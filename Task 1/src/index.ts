// // const message: string = "Hello TypeScript + Node.js";

// // console.log(message);
// import fs from "node:fs"
// import path from "node:path"
// import os from "node:os"
// import { ServerConfig, SystemSnapshot, LogEntry, LogLevel } from "./types";
// import { startServer } from "./server";

// function readJsonSync<T>(filePath: string):T{
//     const rawFile = fs.readFileSync(filePath, "utf-8")
//     return JSON.parse(rawFile) as T
// }

// async function readJson<T>(filePath: string): Promise<T>{
//     const rawFile = await fs.promises.readFile(filePath, "utf-8")
//     return JSON.parse(rawFile) as T
// }

// //this is to load config 
// const configPath = path.join(__dirname, "..", "config.json");
// const baseConfig = readJsonSync<ServerConfig>(configPath);

// const overrides: Partial<ServerConfig> = {
//   // port: 9000 
// };
// const config: ServerConfig = { ...baseConfig, ...overrides };

// //this is for logging
// export function log(abc: LogEntry): void {
//   const line = JSON.stringify(abc) + "\n";
//   fs.appendFileSync(config.logFile, line, "utf-8");
//   console.log(`[${abc.level}] ${abc.timestamp} — ${abc.message}`);
// }

// //collecting system and os info
// async function collectSnapshot(): Promise<SystemSnapshot> {
//   await readJson<ServerConfig>(configPath);

//   const snapshot: SystemSnapshot = {
//     platform: os.platform(),
//     arch: os.arch(),
//     totalMemory: os.totalmem(),
//     freeMemory: os.freemem(),
//     nodeVersion: process.version,
//     env: process.env as Record<string, string>,
//   };

//   return snapshot;
// }

// (async () => {
//   const asyncConfig = await readJson<ServerConfig>(configPath);
//   console.log("Config loaded asynchronously:", asyncConfig);

//   const snapshot = await collectSnapshot();
//   console.log("System Snapshot:", JSON.stringify(snapshot, null, 2));

//   log({
//     level: LogLevel.INFO, message: `Server starting on ${config.host}:${config.port}`, timestamp: new Date().toISOString(),
//   });
//   startServer(config, log);
// })();