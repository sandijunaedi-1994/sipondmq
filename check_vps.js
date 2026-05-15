const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = [
    'echo "=== CLEARING NGINX CACHE ==="',
    'rm -rf /www/wwwroot/mq.zamzami.or.id/proxy_cache_dir/*',
    '/etc/init.d/nginx reload',
    'echo "Cache cleared!"'
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
