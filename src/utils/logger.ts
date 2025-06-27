import winston, { Logger as WinstonLogger, LoggerOptions } from "winston";

export class Logger {
  private readonly _logger: WinstonLogger;
  private readonly _dev: boolean;

  private _addCallSiteMeta(meta: Record<string, any>) {
    const callSite = getCallSite(this._dev);
    return { ...meta, ...callSite };
  }

  constructor(level: string = "info", dev: boolean = false) {
    this._dev = dev;

    const transports =
      level === "none"
        ? [new winston.transports.Console({ silent: true })]
        : [new winston.transports.Console()];

    this._logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length
            ? JSON.stringify(meta, null, dev ? 2 : 0)
            : "";
          return `${timestamp} ${level}: ${message} ${metaString}`;
        })
      ),
      transports,
    });
  }

  info(message: string, meta: any = {}) {
    this._logger.info(message, this._addCallSiteMeta(meta));
  }

  warn(message: string, meta?: any) {
    this._logger.warn(message, this._addCallSiteMeta(meta));
  }

  error(message: string, meta?: any) {
    this._logger.error(message, this._addCallSiteMeta(meta));
  }

  debug(message: string, meta?: any) {
    this._logger.debug(message, this._addCallSiteMeta(meta));
  }
}

function getCallSite(dev: boolean): {
  file?: string | null;
  line?: number | null;
  column?: number | null;
  func?: string;
} {
  if (!dev) {
    return {};
  }

  const originalPrepareStackTrace = Error.prepareStackTrace;

  try {
    const err = new Error();
    Error.prepareStackTrace = (_, stack) => stack;
    const stack = err.stack as unknown as NodeJS.CallSite[];
    const callSite = stack[3];

    return {
      file: callSite?.getFileName(),
      line: callSite?.getLineNumber(),
      column: callSite?.getColumnNumber(),
      func:
        callSite?.getFunctionName() || callSite?.getMethodName() || undefined,
    };
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace;
  }
}
