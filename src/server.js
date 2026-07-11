const api = require('./modules/api');
const ui = require('./modules/ui');

const port = process.env.PORT || 3000;
const server = api.createServer();

server.on('request', (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(ui.renderHomePage());
  }
});

server.listen(port, () => {
  console.log(`ShopStream listening on http://localhost:${port}`);
});
