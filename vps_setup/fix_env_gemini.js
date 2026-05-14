const { Client } = require('ssh2');

const conn = new Client();
const config = {
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
};

conn.on('ready', () => {
  console.log('Connected! Updating .env on VPS...');
  
  const envPath = '/root/api-mymq/.env';
  const appendCmd = `echo 'GEMINI_API_KEY="AIzaSyDnXSA762zSuOzddUp7dkMpdHHlcFgQWdA"' >> ${envPath} && npx pm2 restart api-mymq --update-env`;

  conn.exec(appendCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log(`\nUpdated and restarted with exit code: ${code}`);
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect(config);
