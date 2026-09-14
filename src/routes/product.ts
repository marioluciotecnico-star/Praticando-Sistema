import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateProductInput, UpdateProductInput } from '../types/product.types';

const router = Router();
const prisma = new PrismaClient();

// Listar todos os produtos
router.get('/products', async (req: Request, res: Response) => {
  const products = await prisma.product.findMany();
  return res.json(products);
});

// Buscar produto por ID
router.get('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    return res.status(404).json({ message: 'Produto não encontrado' });
  }

  return res.json(product);
});

// Criar produto
router.post('/products', async (req: Request, res: Response) => {
  const body = req.body as CreateProductInput;
  const product = await prisma.product.create({
    data: body,
  });

  return res.status(201).json(product);
});

// Atualizar produto
router.put('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as UpdateProductInput;

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: body,
  });

  return res.json(product);
});

// Deletar produto
router.delete('/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id: Number(id) },
  });

  return res.status(204).send();
});

export default router;