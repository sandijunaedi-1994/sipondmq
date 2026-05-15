const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  // Fix deploy.sh: ensure npm run build completes before pm2 restart  
  // The issue is the `set -e` causes pm2 restart to run even if build isn't truly done in async mode
  // Solution: use explicit wait and check build exit code
  const fixScript = `cat > /root/deploy.sh << 'ENDSCRIPT'
#!/bin/bash
set -e
echo '==============================='
echo ' My MQ Auto Deploy from GitHub'
echo '==============================='
REPO=/root/mymqbs-repo
BACKEND=/root/api-mymq
FRONTEND=/root/web-mymq

echo '[1/5] Pulling latest code from GitHub...'
cd $REPO
git pull origin main
echo 'Code updated!'

echo '[2/5] Syncing backend...'
rsync -a --exclude='.env' --exclude='node_modules' --exclude='.git' $REPO/backend/ $BACKEND/
cd $BACKEND
npm install --omit=dev
npx prisma generate
npx prisma db push --accept-data-loss
npx pm2 restart api-mymq
echo 'Backend restarted!'

echo '[3/5] Syncing frontend source...'
rsync -a --exclude='.env.local' --exclude='.env.production' --exclude='node_modules' --exclude='.next' --exclude='.git' $REPO/web/ $FRONTEND/
cd $FRONTEND
npm install

echo '[4/5] Building frontend (wait for completion)...'
npm run build
BUILD_EXIT=$?
if [ $BUILD_EXIT -ne 0 ]; then
  echo "Build FAILED with exit code $BUILD_EXIT"
  exit 1
fi
echo 'Build completed successfully!'

echo '[5/5] Restarting frontend...'
npx pm2 restart web-mymq || npx pm2 start server.js --name web-mymq
npx pm2 save

echo '==============================='
echo ' Deploy SELESAI!'
echo '==============================='
ENDSCRIPT
chmod +x /root/deploy.sh
echo "deploy.sh updated!"`;

  conn.exec(fixScript, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => { console.log('Exit:', code); conn.end(); })
      .on('data', d => process.stdout.write(d.toString()))
      .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect({ host: '194.233.83.203', port: 22, username: 'root', password: 'nkyAuXZqhTl23Spo' });
