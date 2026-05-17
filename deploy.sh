#!/bin/bash
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
rsync -a --delete --exclude='.env' --exclude='node_modules' --exclude='.git' --exclude='public/uploads' $REPO/backend/ $BACKEND/
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
