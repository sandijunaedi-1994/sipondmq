const { Client } = require('ssh2');
const conn = new Client();
const config = { host: '194.233.83.203', port: 22, username: 'root', password: 'nkyAuXZqhTl23Spo' };

conn.on('ready', () => {
  conn.exec('cat /root/api-mymq/.env', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', d => console.log(d.toString()))
      .stderr.on('data', d => console.error(d.toString()));
  });
}).connect(config);
