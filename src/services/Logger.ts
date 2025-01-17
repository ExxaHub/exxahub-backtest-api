import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, durationMs }) => `[${timestamp}] ${level}: ${durationMs ? `duration=${durationMs}ms` : ''} ${message}`)
  ),
  transports: [new transports.Console()],
});

export { logger };