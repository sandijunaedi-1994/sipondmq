const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = [
    'echo "=== CLEAN BUILD VPS ==="',
    'cd /root/web-mymq',
    'git config --global core.autocrlf false',
    'git pull origin main',
    'rm -rf .next',
    'npm run build',
    'npx pm2 restart web-mymq',
    'rm -rf /www/wwwroot/mq.zamzami.or.id/proxy_cache_dir/*',
    '/etc/init.d/nginx reload',
    'echo "Clean build and cache clear complete!"'
  ].join(' && ');

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', d => process.stdout.write(d.toString()))
      .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect({
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
});
