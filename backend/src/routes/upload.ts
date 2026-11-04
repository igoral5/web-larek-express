import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';

const uploadRouter = Router();

uploadRouter.post('/', authMiddleware, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
