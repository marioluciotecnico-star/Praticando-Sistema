import dotenv from 'dotenv'
import express, { type Request, type Response } from 'express'
import userRoutes from './routes/users'
import productRoutes from './routes/product'
import stockRoutes from './routes/stock'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Rota raiz inicial
app.get('/', (request: Request, response: Response) => {
  response.json({
    message: 'API do Sistema de Controle de Estoque funcionando!',
    timestamp: new Date().toISOString()
  })
})

// Rota de Health Check
app.get('/health', (request: Request, response: Response) => {
  response.json({ status: 'OK' })
})

// Rota do prefixo /api/v1 (Informativa)
app.get('/api/v1', (request: Request, response: Response) => {
  response.json({
    message: 'Bem-vindo à API v1!',
    endpoints: {
      users: '/api/v1/users',
      products: '/api/v1/products',
      stockMovement: '/api/v1/stock/movement',
      stockMovementsHistory: '/api/v1/stock/movements'
    }
  })
})

// Registro unificado das rotas da aplicação sob o prefixo /api/v1
app.use('/api/v1', [userRoutes, productRoutes, stockRoutes])

// Inicialização do servidor
app.listen(port, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${port}`)
  console.log(`📌 Prefix da API: http://localhost:${port}/api/v1`)
  console.log(`🟢 Health: http://localhost:${port}/health\n`)
})