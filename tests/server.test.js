const app = require('../server');
const http = require('http');

let server;

beforeAll(done => {
  server = app.listen(0, done);
});

afterAll(done => {
  server.close(done);
});

function getJson(path) {
  return new Promise((resolve, reject) => {
    const { port } = server.address();
    const req = http.get(`http://localhost:${port}${path}`, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
  });
}

test('GET /api/health returns ok', async () => {
  const { status, body } = await getJson('/api/health');
  expect(status).toBe(200);
  expect(body.status).toBe('ok');
}, 10000);

test('GET /api/news returns articles array', async () => {
  const { status, body } = await getJson('/api/news?category=all');
  expect(status).toBe(200);
  expect(body).toHaveProperty('articles');
  expect(Array.isArray(body.articles)).toBe(true);
}, 30000);

test('GET /api/news?category=technology returns articles', async () => {
  const { status, body } = await getJson('/api/news?category=technology');
  expect(status).toBe(200);
  expect(Array.isArray(body.articles)).toBe(true);
}, 30000);
