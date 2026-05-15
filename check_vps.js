const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  const cmd = [
    'echo "=== TUGAS DELEGASI ON VPS ==="',
    'cat /root/web-mymq/src/app/admin/\\(panel\\)/ruang-kerja/components/TugasDelegasi.js | grep -A 2 -B 2 "replace" || echo "no replace"'
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
