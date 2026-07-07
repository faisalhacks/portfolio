/* Minimal static server with clean URLs + 404 — mirrors typical static hosting.
   Usage: node serve.js  →  http://localhost:8080 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".ico": "image/x-icon",
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.includes("..")) { res.writeHead(400); return res.end("bad request"); }

  let file = path.join(ROOT, urlPath);
  if (urlPath.endsWith("/")) file = path.join(file, "index.html");
  else if (!path.extname(file)) {
    // clean URL: /research -> /research/index.html
    if (fs.existsSync(path.join(file, "index.html"))) file = path.join(file, "index.html");
    else file += ".html";
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      fs.readFile(path.join(ROOT, "404.html"), (e2, nf) => {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end(e2 ? "404" : nf);
      });
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log("serving http://localhost:" + PORT));
