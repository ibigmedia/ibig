import { Request, Response, NextFunction } from "express";
import * as promClient from "prom-client";
import { logger } from "./logger";

// Initialize metrics registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory usage, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP request duration histogram
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Active connections gauge
const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
});

register.registerMetric(activeConnections);

// Monitoring middleware
export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Increment active connections
  activeConnections.inc();

  res.on("finish", () => {
    // Decrement active connections
    activeConnections.dec();

    // Record request duration
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.path, String(res.statusCode))
      .observe(duration);

    // Log request details using pino logger
    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}s`,
    });
  });

  next();
};

// Metrics endpoint
export const metricsEndpoint = async (_req: Request, res: Response) => {
  try {
    const metrics = await register.metrics();
    res.set("Content-Type", register.contentType);
    res.end(metrics);
  } catch (err) {
    logger.error(err);
    res.status(500).end(err instanceof Error ? err.message : String(err));
  }
};