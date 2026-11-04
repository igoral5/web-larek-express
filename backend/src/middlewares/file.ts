import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PUBLIC_PATH, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

const tempPath = path.join(PUBLIC_PATH, UPLOAD_PATH_TEMP);

fs.mkdirSync(tempPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempPath);
  },
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname)}`);
  },
});

export default multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new BadRequestError('Можно загружать только изображения'));
      return;
    }
    cb(null, true);
  },
});
