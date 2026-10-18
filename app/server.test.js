const test = require("node:test");
const assert = require("node:assert");
const { createServer } = require("./server");

test("health and root endpoints respond", async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/healthz`);
  assert.strictEqual(health.status, 200);
  assert.strictEqual(await health.text(), "ok");

  const root = await fetch(`${base}/`);
  const body = await root.json();
  assert.strictEqual(body.service, "demo-service");

  server.close();
});
