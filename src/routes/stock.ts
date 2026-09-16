import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateSupplierInput, CreateProductInput, CreateMovementInput } from '../types/stock.types';

const router = Router();
const prisma = new PrismaClient();

// [TICKET-EST-01] Fornecedores: Cadastrar e Listar
router.post('/suppliers', async (req: Request, res: Response) => {
  const body = req.body as CreateSupplierInput;

  if (!body.companyName || !body.cnpj || !body.email || !body.phone) {
    return res.status(400).json({ message: 'companyName, cnpj, email e phone são obrigatórios' });
  }

  const supplier = await prisma.supplier.create({ data: body });
  return res.status(201).json(supplier);
});

router.get('/suppliers', async (req: Request, res: Response) => {
  const suppliers = await prisma.supplier.findMany();
  return res.json(suppliers);
});

// [TICKET-EST-02] Produtos com Fornecedor Obrigatório
router.post('/stock/products', async (req: Request, res: Response) => {
  const body = req.body as CreateProductInput;

  // Validar se o fornecedor existe no MySQL antes de criar
  const supplierExists = await prisma.supplier.findUnique({
    where: { id: Number(body.supplierId) }
  });

  if (!supplierExists) {
    return res.status(400).json({ message: 'Fornecedor (supplierId) informado não existe.' });
  }

  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      description: body.description,
      price: body.price,
      stock: body.stock || 0,
      minQuantity: body.minQuantity || 5,
      supplierId: Number(body.supplierId)
    }
  });

  return res.status(201).json(product);
});

// [TICKET-EST-03] Movimentação de Entrada e Saída
router.post('/stock/movements', async (req: Request, res: Response) => {
  const { productId, type, quantity, reason } = req.body as CreateMovementInput;

  const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  // Trava se a saída for maior que o estoque atual
  if (type === 'OUT' && quantity > product.stock) {
    return res.status(400).json({
      message: `Estoque Insuficiente. Estoque atual: ${product.stock}, solicitado: ${quantity}`
    });
  }

  const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        productId: Number(productId),
        type,
        quantity,
        reason: reason || (type === 'IN' ? 'Entrada de material' : 'Baixa de estoque')
      }
    }),
    prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: newStock }
    })
  ]);

  return res.status(200).json({
    message: 'Movimentação realizada!',
    movement,
    currentStock: newStock
  });
});

// [TICKET-EST-04] Geração de Ordem de Compra para produtos abaixo do mínimo
router.post('/stock/purchase-orders', async (req: Request, res: Response) => {
  // Busca todos os produtos onde o estoque está igual ou abaixo da quantidade mínima
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: { lte: prisma.product.fields.minQuantity }
    },
    include: { supplier: true }
  });

  if (lowStockProducts.length === 0) {
    return res.status(200).json({ message: 'Nenhum produto necessita de reposição no momento.' });
  }

  // Agrupa os itens por fornecedor e gera ordens de compra
  const ordersCreated = [];
  
  for (const product of lowStockProducts) {
    const purchaseAmount = product.minQuantity * 2; // Exemplo de quantidade de reposição
    const totalValue = Number(product.price) * purchaseAmount;

    const order = await prisma.purchaseOrder.create({
      data: {
        supplierId: product.supplierId,
        totalValue
      }
    });

    ordersCreated.push(order);
  }

  return res.status(201).json({
    message: 'Ordens de Compra geradas com sucesso!',
    orders: ordersCreated
  });
});

export default router;