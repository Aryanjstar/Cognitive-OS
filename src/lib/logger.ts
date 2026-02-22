import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  ...(isProduction
    ? {
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),
  base: {
    service: "cognitive-os",
    env: process.env.NODE_ENV ?? "development",
  },
});

export function createChildLogger(module: string) {
  return logger.child({ module });
}

export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  extra?: Record<string, unknown>
) {
  const log = logger.child({ module: "http" });
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  log[level]({ method, path, statusCode, durationMs, ...extra }, `${method} ${path} ${statusCode} ${durationMs}ms`);
}

export function logError(
  module: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  const log = logger.child({ module });
  const err = error instanceof Error ? error : new Error(String(error));
  log.error(
    {
      err: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
      ...context,
    },
    err.message
  );
}

export function logAgentRun(
  agent: string,
  userId: string,
  durationMs: number,
  result: Record<string, unknown>
) {
  logger.child({ module: "agents" }).info(
    { agent, userId, durationMs, ...result },
    `Agent ${agent} completed in ${durationMs}ms`
  );
}
