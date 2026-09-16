import type { Supplier, Product, StockMovement, PurchaseOrder } from '@prisma/client';

export interface CreateSupplierInput {
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
}

export interface CreateProductInput {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  minQuantity?: number;
  supplierId: number;
}

export interface CreateMovementInput {
  productId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  reason?: string;
}