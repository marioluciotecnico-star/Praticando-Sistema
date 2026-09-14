import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateStockMovementInput } from '../types/stock.types';

const router = Router();
const prisma = new PrismaClient();

// Criar movimentação de estoque (Entrada ou Saída)
router.post('/stock/movement', async (req: Request, res: Response) => {
  const { productId, quantity, type } = req.body as CreateStockMovementInput;

  if (!productId || !quantity || !type) {
    return res.status(400).json({ message: 'productId, quantity e type são obrigatórios' });
  }

  // 1. Verificar se o produto existe
  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  // 2. Regra de negócio: impedir saída maior que o estoque atual
  if (type === 'OUT' && product.stock < quantity) {
    return res.status(400).json({ 
      message: `Estoque insuficiente. Estoque atual: ${product.stock}, Quantidade solicitada: ${quantity}` 
    });
  }

  // 3. Transação do Prisma: Registra o histórico e atualiza a quantidade do produto de forma atômica
  const newStockCount = type === 'IN' ? product.stock + quantity : product.stock - quantity;

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: Number(productId),
        quantity,
        type,
      },
    }),
    prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: newStockCount },
    }),
  ]);

  return res.status(201).json({
    message: 'Movimentação realizada com sucesso!',
    movement,
    currentStock: newStockCount,
  });
});

// Listar o histórico de movimentações
router.post('/stock/movement', async (req: Request, res: Response) => { 
     const movements = await prisma.stockMovement.findMany({
    include: {
      product: {
        select: { name: true, price: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json(movements);
});

export default router;