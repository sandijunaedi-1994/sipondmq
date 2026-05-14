const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
};

conn.on('ready', () => {
  conn.exec('npx pm2 logs api-mymq --lines 50 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect(config);
