import path from 'path';
import fs from 'fs/promises';
import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import { PUBLIC_PATH, UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const moveImage = async (fileName?: string) => {
  if (!fileName) {
    return;
  }

  const name = path.basename(fileName);
  const source = path.join(PUBLIC_PATH, UPLOAD_PATH_TEMP, name);
  const target = path.join(PUBLIC_PATH, UPLOAD_PATH, name);

  try {
    await fs.rename(source, target);
  } catch (error) {
    if ((error as { code?: string }).code !== 'ENOENT') {
      throw error;
    }
  }
};

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Product.find({});
    res.send({ items, total: items.length });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await moveImage(req.body.image?.fileName);
    const product = await Product.create(req.body);
    res.send(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await moveImage(req.body.image?.fileName);
    const product = await Product.findByIdAndUpdate(req.params.productId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new NotFoundError('Товар с указанным id не найден');
    }

    res.send(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      throw new NotFoundError('Товар с указанным id не найден');
    }

    res.send(product);
  } catch (error) {
    next(error);
  }
};
