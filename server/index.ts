import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";
import cluster from "cluster";
import os from "os";
import { db, checkDatabaseConnection } from "@db";

// Initialize monitoring and logging after express
import { monitoringMiddleware, metricsEndpoint } from "./monitoring";
import { logger } from "./logger";

// Auto-restart using cluster
if (cluster.isPrimary && process.env.NODE_ENV === "production") {
  const numCPUs = os.cpus().length;

  // Fork workers based on CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker crashes and restart
  cluster.on("exit", (worker, code, signal) => {
    log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add monitoring middleware first
  app.use("/", monitoringMiddleware);

  // Expose metrics endpoint
  app.get("/metrics", metricsEndpoint);

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  (async () => {
    try {
      // Check database connection before starting the server with retries
      const isConnected = await checkDatabaseConnection(5);
      if (!isConnected) {
        throw new Error("Failed to establish database connection after multiple retries");
      }
      log("Database connection successful");

      const server = registerRoutes(app);

      app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";

        res.status(status).json({ message });
        log(`Error: ${message}`);
      });

      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }

      const PORT = 5000;

      server.listen(PORT, "0.0.0.0", () => {
        log(`Server worker ${process.pid} listening on port ${PORT}`);
      }).on('error', (err: any) => {
        if (err.code === 'EADDRINUSE') {
          log(`Port ${PORT} is already in use`);
          process.exit(1);
        } else {
          log(`Error starting server: ${err.message}`);
          process.exit(1);
        }
      });

    } catch (err) {
      log(`Critical error during server startup: ${err}`);
      process.exit(1);
    }
  })();

  // Handle uncaught exceptions and rejections
  process.on("uncaughtException", (err) => {
    log(`Uncaught Exception: ${err.message}`);
    setTimeout(() => process.exit(1), 1000);
  });

  process.on("unhandledRejection", (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    setTimeout(() => process.exit(1), 1000);
  });
}