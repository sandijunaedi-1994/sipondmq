const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const config = {
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
};

const REMOTE_DIR = '/root/api-mymq';
const ZIP_PATH = path.join(__dirname, 'backend', 'backend.zip');
const ENV_PATH = path.join(__dirname, 'backend', '.env.production');

console.log('Connecting to VPS via SSH...');

conn.on('ready', () => {
  console.log('SSH connection established.');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    conn.exec(`mkdir -p ${REMOTE_DIR} && apt-get update && apt-get install unzip -y && npm install -g pm2`, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        console.log(`Prerequisites installed (code: ${code})`);
        
        console.log('Uploading backend.zip...');
        sftp.fastPut(ZIP_PATH, `${REMOTE_DIR}/backend.zip`, (err) => {
          if (err) throw err;
          console.log('backend.zip uploaded.');

          console.log('Uploading .env.production...');
          sftp.fastPut(ENV_PATH, `${REMOTE_DIR}/.env`, (err) => {
            if (err) throw err;
            console.log('.env uploaded as production config.');

            console.log('Extracting and configuring backend on VPS...');
            const setupCmd = `
              cd ${REMOTE_DIR}
              unzip -o backend.zip
              npm install
              npx prisma generate
              pm2 restart api-mymq || pm2 start src/index.js --name api-mymq
              pm2 save
            `;

            conn.exec(setupCmd, (err, execStream) => {
              if (err) throw err;
              execStream.on('close', (code) => {
                console.log(`Backend deployment finished with code ${code}`);
                conn.end();
              }).on('data', (data) => {
                process.stdout.write(data.toString());
              }).stderr.on('data', (data) => {
                process.stderr.write(data.toString());
              });
            });
          });
        });
      }).on('data', (data) => {
        console.log(data.toString().trim());
      });
    });
  });
}).connect(config);
