import path from 'path';
import 'dotenv/config';
import type { StringValue } from 'ms';

const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  JWT_SECRET = 'dev-secret-key',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  ORIGIN_ALLOW = 'http://localhost:5173',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;

const PUBLIC_PATH = path.join(__dirname, 'public');

export {
  PORT,
  DB_ADDRESS,
  JWT_SECRET,
  ORIGIN_ALLOW,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
  PUBLIC_PATH,
};

export const ACCESS_TOKEN_EXPIRY = AUTH_ACCESS_TOKEN_EXPIRY as StringValue;
export const REFRESH_TOKEN_EXPIRY = AUTH_REFRESH_TOKEN_EXPIRY as StringValue;
