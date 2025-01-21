import pino from "pino";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create rotating file stream
const rotatingLogStream = {
  write: (str: string) => {
    const date = new Date().toISOString().split("T")[0];
    const logFile = path.join(logsDir, `server-${date}.log`);
    fs.appendFileSync(logFile, str);
  },
};

// Configure logger
export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
}, rotatingLogStream);

// Export middleware
export const loggerMiddleware = pinoHttp({
  logger,
  customLogLevel: function (res: ServerResponse, err: Error) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  }
});