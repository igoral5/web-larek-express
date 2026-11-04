import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/products';
import { createProductValidation } from '../middlewares/validations';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', createProductValidation, createProduct);

export default productRouter;
