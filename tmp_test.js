const http = require('http');
const server = http.createServer((req, res) => {
  try {
    res.setHeader('Content-Disposition', 'attachment; filename="전시.pdf"');
    res.end('ok');
  } catch (err) {
    console.error('Error:', err);
    res.statusCode = 500;
    res.end('error');
  }
});
server.listen(0, () => {
  const { port } = server.address();
  console.log('Server listening', port);
  http.get({ port, path: '/' }, (res) => {
    res.on('data', () => {});
    res.on('end', () => server.close());
  }).on('error', (err) => {
    console.error('Request error', err);
    server.close();
  });
});
