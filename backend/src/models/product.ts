import mongoose from 'mongoose';

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
  },
}, { versionKey: false });

export default mongoose.model<IProduct>('product', productSchema);
