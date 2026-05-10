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

const LOCAL_WEB = path.join(__dirname, 'web');
const REMOTE_DIR = '/root/web-mymq';

// Only small config files + src
const ROOT_FILES = [
  'package.json', 'package-lock.json',
  'next.config.js', 'next.config.mjs',
  'jsconfig.json', 'postcss.config.mjs',
  'tailwind.config.js', 'eslint.config.mjs'
];

async function uploadFile(sftp, localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function mkdirRemote(sftp, remotePath) {
  return new Promise((resolve) => {
    sftp.mkdir(remotePath, () => resolve());
  });
}

async function uploadDir(sftp, localDir, remoteDir, skip = []) {
  const items = fs.readdirSync(localDir);
  for (const item of items) {
    if (skip.includes(item)) continue;
    const localPath = path.join(localDir, item);
    const remotePath = remoteDir + '/' + item;
    const stat = fs.statSync(localPath);
    if (stat.isDirectory()) {
      await mkdirRemote(sftp, remotePath);
      await uploadDir(sftp, localPath, remotePath, skip);
    } else {
      await uploadFile(sftp, localPath, remotePath);
      process.stdout.write('.');
    }
  }
}

console.log('Connecting to VPS...');
conn.on('ready', () => {
  console.log('SSH connected.');
  conn.sftp(async (err, sftp) => {
    if (err) throw err;

    // Write .env.production with correct API URL
    console.log('Writing env files...');
    const envContent = 'NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-lQCvC6lEWKG8xOwH\nNEXT_PUBLIC_API_URL=https://api-mq.zamzami.or.id\n';
    const envTmp = path.join(__dirname, '_tmp_env');
    fs.writeFileSync(envTmp, envContent);
    await uploadFile(sftp, envTmp, `${REMOTE_DIR}/.env.local`);
    await uploadFile(sftp, envTmp, `${REMOTE_DIR}/.env.production`);
    fs.unlinkSync(envTmp);
    console.log('Env written.');

    // Upload config files
    for (const file of ROOT_FILES) {
      const localFile = path.join(LOCAL_WEB, file);
      if (fs.existsSync(localFile)) {
        await uploadFile(sftp, localFile, `${REMOTE_DIR}/${file}`);
        console.log(`Uploaded: ${file}`);
      }
    }

    // Upload src
    console.log('\nUploading src/...');
    await mkdirRemote(sftp, `${REMOTE_DIR}/src`);
    await uploadDir(sftp, path.join(LOCAL_WEB, 'src'), `${REMOTE_DIR}/src`);
    console.log('\nSrc uploaded.');

    // Upload public
    if (fs.existsSync(path.join(LOCAL_WEB, 'public'))) {
      console.log('Uploading public/...');
      await mkdirRemote(sftp, `${REMOTE_DIR}/public`);
      await uploadDir(sftp, path.join(LOCAL_WEB, 'public'), `${REMOTE_DIR}/public`);
      console.log('\nPublic uploaded.');
    }

    sftp.end();

    // Now build on VPS
    console.log('\nBuilding Next.js on VPS (this takes ~3-5 minutes)...');
    conn.exec(`cd ${REMOTE_DIR} && npm install && npm run build && npx pm2 restart web-mymq || npx pm2 start server.js --name web-mymq && npx pm2 save`, { pty: false }, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        console.log(`\nBuild finished (code: ${code})`);
        conn.end();
      })
      .on('data', d => process.stdout.write(d.toString()))
      .stderr.on('data', d => process.stderr.write(d.toString()));
    });
  });
}).connect(config);
