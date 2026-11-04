import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';
import {
  createProductValidation,
  productIdValidation,
  updateProductValidation,
} from '../middlewares/validations';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', authMiddleware, createProductValidation, createProduct);
productRouter.patch('/:productId', authMiddleware, updateProductValidation, updateProduct);
productRouter.delete('/:productId', authMiddleware, productIdValidation, deleteProduct);

export default productRouter;
