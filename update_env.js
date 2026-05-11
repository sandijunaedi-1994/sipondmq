const { Client } = require('ssh2');
const conn = new Client();
const config = { host: '194.233.83.203', port: 22, username: 'root', password: 'nkyAuXZqhTl23Spo' };

const appendData = `\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\nSMTP_USER=yz.internasional@gmail.com\nSMTP_PASS=gohxdjeyzvjtzpam\nFRONTEND_URL=https://mq.zamzami.or.id\n`;

conn.on('ready', () => {
  // Use echo to append to .env
  conn.exec(`echo "${appendData}" >> /root/api-mymq/.env && cd /root/api-mymq && npx pm2 restart api-mymq`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', d => console.log(d.toString()))
      .stderr.on('data', d => console.error(d.toString()));
  });
}).connect(config);
