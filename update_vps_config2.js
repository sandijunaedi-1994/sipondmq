const { Client } = require('ssh2');
const conn = new Client();

const newDeploySh = `#!/bin/bash
set -e
echo '==============================='
echo ' My MQ Auto Deploy from GitHub'
echo '==============================='
REPO=/www/wwwroot/mymqbs-repo
BACKEND=/www/wwwroot/api-mq.zamzami.or.id/api-mymq
FRONTEND=/www/wwwroot/mq.zamzami.or.id/mymqbs-next

echo '[1/5] Pulling latest code from GitHub...'
cd $REPO
git pull origin main
echo 'Code updated!'

echo '[2/5] Syncing backend...'
rsync -a --delete --exclude='.env' --exclude='node_modules' --exclude='.git' $REPO/backend/ $BACKEND/
cd $BACKEND
npm install --omit=dev
npx prisma generate
npx prisma db push --accept-data-loss
npx pm2 restart api-mymq || npx pm2 start src/index.js --name api-mymq
echo 'Backend restarted!'

echo '[3/5] Syncing frontend source...'
rsync -a --delete --exclude='.env.local' --exclude='.env.production' --exclude='node_modules' --exclude='.next' --exclude='.git' $REPO/web/ $FRONTEND/
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
NODE_ENV=production PORT=3001 npx pm2 restart mymq-next || NODE_ENV=production PORT=3001 npx pm2 start server.js --name mymq-next
npx pm2 save

echo '==============================='
echo ' Deploy SELESAI!'
echo '==============================='
`;

conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/root/deploy.sh');
    writeStream.write(newDeploySh);
    writeStream.end();
    writeStream.on('close', () => {
      console.log('/root/deploy.sh updated.');
      
      const cmd = `
        npx pm2 delete api-mymq || true
        npx pm2 delete mymq-next || true
        cd /www/wwwroot/api-mq.zamzami.or.id/api-mymq && npx pm2 start src/index.js --name api-mymq
        cd /www/wwwroot/mq.zamzami.or.id/mymqbs-next && NODE_ENV=production PORT=3001 npx pm2 start server.js --name mymq-next
        npx pm2 save
      `;
      conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    });
  });
}).connect({
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
});
