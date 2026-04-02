interface ServerConfig{
    port: number,
    host: string, 
    logFile: string
}

interface RequestInfo{
    method: string,
    pathname: string, 
    query: Record<string, string | string[]>
}

interface SystemSnapshot{
    platform: string,
    arch: string,
    totalMemory: number,
    freeMemory: number,
    nodeVersion: string,
    env: Record<string, string> 
}

enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

interface LogEntry{
    level: LogLevel,
    message: string,
    timestamp: string
}

export type {
    ServerConfig, LogEntry, SystemSnapshot, RequestInfo
}
export {LogLevel}