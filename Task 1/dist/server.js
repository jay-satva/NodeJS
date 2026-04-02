"use strict";
// import { URL } from "node:url";
// import http, { IncomingMessage, ServerResponse } from "node:http";
// import { parse as parseUrl } from "node:url";
// import { ServerConfig, RequestInfo, LogEntry, LogLevel } from "./types";
// // import * as osInfo from "./osInfo";
// // import * as pathUtils from "./pathUtils";
// // import * as fsOps from "./fsOperations";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// // const server = http.createServer((req, res) => {
// //   res.end('Hello');
// // });
// // server.listen(3000);
// function buildRequestInfo(req: IncomingMessage): RequestInfo {
//   // url.parse splits pathname and query out of the raw url string
//   const parsed = parseUrl(req.url ?? "/", true); // this will parse query string into object
//   const info: RequestInfo = {
//     method: req.method ?? "GET",
//     pathname: parsed.pathname ?? "/",
//     query: parsed.query as Record<string, string | string[]>,
//   };
//   return info;
// }
// async function handleRequest(
//   req: IncomingMessage,   
//   res: ServerResponse,    
//   logFn: (entry: LogEntry) => void
// ): Promise<void> {
//   const info = buildRequestInfo(req);
//   await Promise.resolve()
//   logFn({
//     level: LogLevel.INFO,
//     message: `${info.method} ${info.pathname} | query: ${JSON.stringify(info.query)}`,
//     timestamp: new Date().toISOString(),
//   });
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.end(`Path: ${info.pathname}`);
// }
// export function startServer(
//   config: ServerConfig,
//   logFn: (entry: LogEntry) => void
// ): void {
//   const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
//     //we use .catch() to prevent server creash if it throws 
//     handleRequest(req, res, logFn).catch((err) => {
//       res.writeHead(500);
//       res.end("Something went wrong");
//     });
//   });
//   server.listen(config.port, config.host, () => {
//     logFn({
//       level: LogLevel.INFO,
//       message: `Listening at http://${config.host}:${config.port}`,
//       timestamp: new Date().toISOString(),
//     });
//   });
// }
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_http_1 = __importDefault(require("node:http"));
const node_url_1 = require("node:url");
const types_1 = require("./types");
// ── 1. Generic JSON reader ────────────────────────────────────────────────────
// return type is T — no Promise, no async, blocks until file is read
function readJson(filePath) {
    const raw = node_fs_1.default.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}
// ── 2. Load config ────────────────────────────────────────────────────────────
// path.join used to safely build the path to config.json
const configPath = node_path_1.default.join(__dirname, "..", "config.json");
const baseConfig = readJson(configPath);
// Partial<ServerConfig> — all fields optional, only override what you need
const overrides = {};
const config = { ...baseConfig, ...overrides };
// ── 3. log() ──────────────────────────────────────────────────────────────────
// sync — guarantees log lines are written in order, never scrambled
function log(entry) {
    const line = JSON.stringify(entry) + "\n";
    node_fs_1.default.appendFileSync(config.logFile, line, "utf-8");
    console.log(`[${entry.level}] ${entry.timestamp} — ${entry.message}`);
}
// ── 4. SystemSnapshot ─────────────────────────────────────────────────────────
// collected once at startup using os module and process.env
// Object.entries + Object.fromEntries used to filter out undefined values
// this avoids type assertion on process.env
function collectSnapshot() {
    const env = Object.fromEntries(Object.entries(process.env).filter((entry) => entry[1] !== undefined));
    return {
        platform: node_os_1.default.platform(),
        arch: node_os_1.default.arch(),
        totalMemory: node_os_1.default.totalmem(),
        freeMemory: node_os_1.default.freemem(),
        nodeVersion: process.version,
        env,
    };
}
// ── 5. buildRequestInfo() ─────────────────────────────────────────────────────
// sync — pure URL string parsing, no I/O involved
// query comes back as ParsedUrlQuery which is Record<string, string | string[] | undefined>
// we filter out undefined keys to match RequestInfo exactly — no type assertion needed
function buildRequestInfo(req) {
    const parsed = (0, node_url_1.parse)(req.url ?? "/", true);
    const query = Object.fromEntries(Object.entries(parsed.query).filter((entry) => entry[1] !== undefined));
    return {
        method: req.method ?? "GET",
        pathname: parsed.pathname ?? "/",
        query,
    };
}
// ── 6. handleRequest() ────────────────────────────────────────────────────────
// async — models real per-request work like DB calls or file reads
async function handleRequest(req, res) {
    const info = buildRequestInfo(req);
    // represents real async work — DB query, file read, API call etc.
    await Promise.resolve();
    log({
        level: types_1.LogLevel.INFO,
        message: `${info.method} ${info.pathname} | query: ${JSON.stringify(info.query)}`,
        timestamp: new Date().toISOString(),
    });
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Path: ${info.pathname}`);
}
// ── 7. Server ─────────────────────────────────────────────────────────────────
const server = node_http_1.default.createServer((req, res) => {
    // createServer callback is sync — async handler called inside with .catch()
    // .catch() prevents unhandled rejection from crashing the server
    handleRequest(req, res).catch((err) => {
        log({
            level: types_1.LogLevel.ERROR,
            message: `Unhandled error: ${String(err)}`,
            timestamp: new Date().toISOString(),
        });
        res.writeHead(500);
        res.end("Internal Server Error");
    });
});
// ── 8. Startup ────────────────────────────────────────────────────────────────
const snapshot = collectSnapshot();
console.log("System Snapshot:", JSON.stringify(snapshot, null, 2));
log({
    level: types_1.LogLevel.INFO,
    message: `Server starting on ${config.host}:${config.port}`,
    timestamp: new Date().toISOString(),
});
server.listen(config.port, config.host, () => {
    log({
        level: types_1.LogLevel.INFO,
        message: `Listening at http://${config.host}:${config.port}`,
        timestamp: new Date().toISOString(),
    });
});
