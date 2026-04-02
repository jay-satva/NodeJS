// import { URL } from "node:url";
// import http, { IncomingMessage, ServerResponse } from "node:http";
// import { parse as parseUrl } from "node:url";
// import { ServerConfig, RequestInfo, LogEntry, LogLevel } from "./types";
// // import * as osInfo from "./osInfo";
// // import * as pathUtils from "./pathUtils";
// // import * as fsOps from "./fsOperations";

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


import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import http, { IncomingMessage, ServerResponse } from "node:http";
import { parse as parseUrl } from "node:url";
import {
  ServerConfig,
  RequestInfo,
  SystemSnapshot,
  LogEntry,
  LogLevel,
} from "./types";


function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

const configPath = path.join(__dirname, "..", "config.json");
const baseConfig = readJson<ServerConfig>(configPath);

const overrides: Partial<ServerConfig> = {};
const config: ServerConfig = { ...baseConfig, ...overrides };
  
function log(entry: LogEntry): void {
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(config.logFile, line, "utf-8");
  console.log(`[${entry.level}] ${entry.timestamp} — ${entry.message}`);
}

function collectSnapshot(): SystemSnapshot {
  const env: Record<string, string> = Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );

  return {
    platform: os.platform(),
    arch: os.arch(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    nodeVersion: process.version,
    env,
  };
}

function buildRequestInfo(req: IncomingMessage): RequestInfo {
  const parsed = parseUrl(req.url ?? "/", true);

  const query: Record<string, string | string[]> = Object.fromEntries(
    Object.entries(parsed.query).filter(
      (entry): entry is [string, string | string[]] => entry[1] !== undefined
    )
  );

  return {
    method: req.method ?? "GET",
    pathname: parsed.pathname ?? "/",
    query,
  };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const info = buildRequestInfo(req);

  await Promise.resolve();

  log({
    level: LogLevel.INFO,
    message: `${info.method} ${info.pathname} | query: ${JSON.stringify(info.query)}`,
    timestamp: new Date().toISOString(),
  });

  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(`Path: ${info.pathname}`);
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  handleRequest(req, res).catch((err: unknown) => {
    log({
      level: LogLevel.ERROR,
      message: `Unhandled error: ${String(err)}`,
      timestamp: new Date().toISOString(),
    });
    res.writeHead(500);
    res.end("Internal Server Error");
  });
});

const snapshot = collectSnapshot();
console.log("System Snapshot:", JSON.stringify(snapshot, null, 2));

log({
  level: LogLevel.INFO,
  message: `Server starting on ${config.host}:${config.port}`,
  timestamp: new Date().toISOString(),
});

server.listen(config.port, config.host, () => {
  log({
    level: LogLevel.INFO,
    message: `Listening at http://${config.host}:${config.port}`,
    timestamp: new Date().toISOString(),
  });
});