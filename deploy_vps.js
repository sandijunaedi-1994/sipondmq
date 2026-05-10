// Script untuk trigger deploy di VPS via SSH
// VPS akan git pull dari GitHub lalu build & restart

const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
};

console.log('Connecting to VPS...');

conn.on('ready', () => {
  console.log('Connected! Running deploy script...\n');
  conn.exec('bash /root/deploy.sh', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      if (code === 0) {
        console.log('\n✓ Deploy berhasil!');
      } else {
        console.error(`\n✗ Deploy gagal dengan exit code: ${code}`);
        process.exit(1);
      }
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect(config);
