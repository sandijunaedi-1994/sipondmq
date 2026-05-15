const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = [
    `curl -s -X POST http://127.0.0.1:4000/api/auth/login -H "Content-Type: application/json" -d '{"contact":"sandi@mymq.com", "password":"password123"}'`
  ].join(' && ');

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let data = '';
    stream.on('close', () => {
        console.log(data);
        conn.end();
    })
      .on('data', d => data += d.toString())
      .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect({
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
});
