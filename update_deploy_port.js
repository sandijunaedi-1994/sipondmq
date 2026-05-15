const { Client } = require('ssh2');
const conn = new Client();

const fixScript = `#!/bin/bash
set -e
echo 'Fixing deploy.sh port...'
sed -i 's/PORT=3200/PORT=3001/g' /root/deploy.sh
echo 'Deploy script fixed!'
`;

conn.on('ready', () => {
  console.log('Connected to VPS');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const writeStream = sftp.createWriteStream('/root/fix_port.sh');
    writeStream.write(fixScript);
    writeStream.end();
    writeStream.on('close', () => {
      console.log('Script updated successfully.');
      console.log('Running fix_port.sh...');
      conn.exec('bash /root/fix_port.sh', (err, stream) => {
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
