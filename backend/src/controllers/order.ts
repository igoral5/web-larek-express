import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, total } = req.body;
    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      throw new BadRequestError('Один или несколько товаров не найдены');
    }

    const notForSale = products.find((product) => product.price === null);
    if (notForSale) {
      throw new BadRequestError(`Товар с id ${notForSale._id} не продается`);
    }

    const productsTotal = products.reduce((sum, product) => sum + (product.price as number), 0);
    if (productsTotal !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    res.send({ id: faker.string.uuid(), total });
  } catch (error) {
    next(error);
  }
};
