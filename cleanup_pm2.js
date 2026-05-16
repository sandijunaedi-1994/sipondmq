const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  console.log('Connected to VPS');
  const cmd = `
    npx pm2 delete api-mymq
    cd /root/api-mymq && npx pm2 start src/index.js --name api-mymq
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
}).connect({
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
});
