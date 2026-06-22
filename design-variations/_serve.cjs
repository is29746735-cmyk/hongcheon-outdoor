// 디자인 변주 비교용 임시 정적 서버 (Playwright가 file: 프로토콜을 막아서 HTTP로 서빙)
// 사용: node design-variations/_serve.cjs   → http://localhost:8099/index.html
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = 8099;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/" || p === "") p = "/index.html";
    const fp = path.join(ROOT, p);
    fs.readFile(fp, (e, buf) => {
      if (e) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("not found: " + p);
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream" });
      res.end(buf);
    });
  })
  .listen(PORT, () => console.log("serving " + ROOT + " on http://localhost:" + PORT));
