import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import path from 'path';
import userRoutes from './routes/users';
import productRoutes from './routes/product';
import stockRoutes from './routes/stock';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    message: 'Sistema de Controle de Estoque Corporativo',
    endpoints: {
      users: {
        create: 'POST /api/v1/users (Multipart/form-data com profileImage)',
        login: 'POST /api/v1/users/login',
        me: 'GET /api/v1/users/me (Auth)',
        updateMe: 'PUT /api/v1/users/me (Auth - Multipart/form-data com profileImage)',
        deleteMe: 'DELETE /api/v1/users/me (Auth)'
      },
      suppliers: '/api/v1/suppliers',
      products: '/api/v1/stock/products',
      movements: '/api/v1/stock/movements',
      purchaseOrders: '/api/v1/stock/purchase-orders'
    }
  });
});

app.use('/api/v1', [userRoutes, productRoutes, stockRoutes]);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}/api/v1`);
});