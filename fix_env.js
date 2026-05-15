const { Client } = require('ssh2');
const conn = new Client();

const fixScript = `#!/bin/bash
set -e
echo 'Fixing API URL in .env.local...'
sed -i 's/NEXT_PUBLIC_API_URL=https:\\/\\/mq.zamzami.or.id/NEXT_PUBLIC_API_URL=https:\\/\\/api-mq.zamzami.or.id/g' /root/mymqbs-next/.env.local
cd /root/mymqbs-next
echo 'Rebuilding frontend with new API URL...'
npm run build
npx pm2 restart mymq-next
echo 'Fix applied!'
`;

conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/root/fix_env.sh');
    writeStream.write(fixScript);
    writeStream.end();
    writeStream.on('close', () => {
      console.log('Script updated successfully.');
      console.log('Running fix_env.sh...');
      conn.exec('bash /root/fix_env.sh', (err, stream) => {
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
