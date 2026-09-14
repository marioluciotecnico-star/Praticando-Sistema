import type { StockMovement } from '@prisma/client';

export type IStockMovement = StockMovement;

export interface CreateStockMovementInput {
  productId: number;
  quantity: number;
  type: 'IN' | 'OUT';
}