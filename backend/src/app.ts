import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import {
  DB_ADDRESS,
  ORIGIN_ALLOW,
  PORT,
  PUBLIC_PATH,
  UPLOAD_PATH_TEMP,
} from './config';
import './types/express';
import router from './routes';
import openapi from './docs/openapi';
import { errorLogger, logger, requestLogger } from './middlewares/logger';
import { errorHandler, notFoundHandler } from './middlewares/error-handlers';

const tempPath = path.join(PUBLIC_PATH, UPLOAD_PATH_TEMP);

const app = express();

app.use(cors({ origin: ORIGIN_ALLOW, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(PUBLIC_PATH));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(requestLogger);
app.use(router);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

const removeOldTempFiles = () => {
  fs.readdir(tempPath, (_readError, files) => {
    files.forEach((file) => {
      const filePath = path.join(tempPath, file);
      fs.stat(filePath, (statError, stats) => {
        if (!statError && Date.now() - stats.mtimeMs > 24 * 60 * 60 * 1000) {
          fs.unlink(filePath, () => undefined);
        }
      });
    });
  });
};

cron.schedule('0 0 * * *', removeOldTempFiles);

const stopWithError = (message: string) => {
  logger.error(message);
  logger.on('finish', () => process.exit(1));
  logger.end();
};

const start = async () => {
  try {
    await mongoose.connect(DB_ADDRESS);
  } catch (error) {
    stopWithError(`Не удалось подключиться к MongoDB по адресу ${DB_ADDRESS}: ${(error as Error).message}`);
    return;
  }

  const server = app.listen(PORT, () => {
    logger.info(`Сервис успешно запущен на порту ${PORT}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    const message = error.code === 'EADDRINUSE'
      ? `Порт ${PORT} уже занят другим процессом`
      : `Ошибка запуска сервера: ${error.message}`;
    stopWithError(message);
  });
};

start();
