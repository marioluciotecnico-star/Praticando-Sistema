import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import userRoutes from './routes/users'
import productRoutes from './routes/product'
import stockRoutes from './routes/stock'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/health', (request: Request, response: Response) => {
  response.json({ status: 'OK' })
})

app.get('/api/v1', (request: Request, response: Response) => {
  response.json({
    message: 'Sistema de Controle de Estoque Corporativo',
    endpoints: {
      suppliers: '/api/v1/suppliers',
      products: '/api/v1/stock/products',
      movements: '/api/v1/stock/movements',
      purchaseOrders: '/api/v1/stock/purchase-orders'
    }
  })
})

app.use('/api/v1', [userRoutes, productRoutes, stockRoutes])

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}/api/v1`)
})