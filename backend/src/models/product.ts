import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { PUBLIC_PATH, UPLOAD_PATH } from '../config';

export interface IImage {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  image: IImage;
  category: string;
  description?: string;
  price: number | null;
}

const imageSchema = new mongoose.Schema<IImage>(
  {
    fileName: {
      type: String,
      required: [true, 'Поле "image.fileName" должно быть заполнено'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле "image.originalName" должно быть заполнено'],
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: imageSchema,
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
    min: [0, 'Цена не может быть отрицательной'],
  },
}, { versionKey: false });

productSchema.post('findOneAndDelete', (doc: IProduct | null) => {
  if (doc?.image?.fileName) {
    const filePath = path.join(PUBLIC_PATH, UPLOAD_PATH, path.basename(doc.image.fileName));
    fs.unlink(filePath, () => undefined);
  }
});

export default mongoose.model<IProduct>('product', productSchema);
