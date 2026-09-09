import type { Request, Response } from 'express'
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const usersRoutes = Router()

usersRoutes.get('/users', async (request: Request, response: Response) => {
  const result = await prisma.user.findMany()

  return response.status(200).json({
    message: `Lista de usuários`,
    data: result,
  })
})


usersRoutes.get('/users/:id', async (request: Request, response: Response) => {

  const { id } = request.params

  const result = await prisma.user.findUnique({
    where: {
      id: String(id),
    }
  })


  if (!result) {
    return response.status(404).json({
      message: 'Usuário não encontrado',
      timestamp: new Date().toISOString(),
      status: 'API funcionando!'
    })
  }


  response.status(200).json({
    message: 'Detalhes do usuário:',
    user: result,
    status: 'API funcionando!'
  })
})

usersRoutes.post('/users', async (request: Request, response: Response) => {
  const { name, email, password, age } = request.body
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      age
    },
  })

  return response.status(201).json({
    message: 'Usuário criado com sucesso!',
    user: user,
  })
})


usersRoutes.put('/users/:id', async (request: Request, response: Response) => {
  const { id } = request.params
  const { name, email, senha } = request.body
  const user = await prisma.user.update({
    where: {
      id: String(id),
    },
    data: {
      name,
      email,
      senha,
    },
  })

  return response.status(200).json({
    message: 'Usuário atualizado com sucesso!',
    timestamp: new Date().toISOString(),
    user: user,
  })
})

usersRoutes.delete('/users/:id', async (request: Request, response: Response) => {
  const { id } = request.params
  await prisma.user.delete({
    where: {
      id: String(id),
    },
  })

  return response.status(200).json({
    message: 'Usuário deletado com sucesso!',
    timestamp: new Date().toISOString(),
  })
})

export default usersRoutes


