import type { Product } from '@prisma/client';

export type IProduct = Product;

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}