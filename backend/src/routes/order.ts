import { Router } from 'express';
import createOrder from '../controllers/order';
import { createOrderValidation } from '../middlewares/validations';

const orderRouter = Router();

orderRouter.post('/', createOrderValidation, createOrder);

export default orderRouter;
