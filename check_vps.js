const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  // Run prisma db push to ensure schema is synced, then check recent errors
  const cmd = [
    'cd /root/api-mymq',
    'echo "=== RUNNING PRISMA DB PUSH ==="',
    'npx prisma db push --accept-data-loss 2>&1 | tail -10',
    'echo ""',
    'echo "=== PRISMA GENERATE ==="',
    'npx prisma generate 2>&1 | tail -5',
    'echo ""',
    'echo "=== RESTART BACKEND ==="',
    'npx pm2 restart api-mymq',
    'echo "Backend restarted"',
  ].join(' && ');

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\nExit code:', code);
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect({
  host: '194.233.83.203',
  port: 22,
  username: 'root',
  password: 'nkyAuXZqhTl23Spo'
});
