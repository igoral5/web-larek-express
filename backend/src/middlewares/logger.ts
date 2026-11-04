import expressWinston from 'express-winston';
import winston from 'winston';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`),
);

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
      format: winston.format.json(),
    }),
  ],
});

const transports = (filename: string) => [
  new winston.transports.File({ filename }),
  new winston.transports.Console({ format: consoleFormat }),
];

export const requestLogger = expressWinston.logger({
  transports: transports('request.log'),
  format: winston.format.json(),
  msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
});

export const errorLogger = expressWinston.errorLogger({
  transports: transports('error.log'),
  format: winston.format.json(),
  msg: '{{err.message}}',
});
