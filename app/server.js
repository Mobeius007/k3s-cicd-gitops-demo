const http = require("node:http");

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "dev";
let requests = 0;

function createServer() {
  return http.createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    }
    if (req.url === "/metrics") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end(`# TYPE app_requests_total counter\napp_requests_total ${requests}\n`);
    }
    requests += 1;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ service: "demo-service", version: VERSION, host: process.env.HOSTNAME || "local" }));
  });
}

if (require.main === module) {
  createServer().listen(PORT, () => console.log(`listening on ${PORT}`));
}

module.exports = { createServer };
