import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { CreateUserInput, LoginUserInput, UpdateUserInput } from '../types/user.types';

const router = Router();
const prisma = new PrismaClient();

const handleUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.single(fieldName)(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

router.post('/users', handleUpload('profileImage'), async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body as CreateUserInput;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return res.status(400).json({ message: 'E-mail já cadastrado' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      age: age ? Number(age) : null,
      profileImage
    },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      profileImage: true,
      createdAt: true
    }
  });

  return res.status(201).json(user);
});

router.post('/users/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginUserInput;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: 'Credenciais inválidas' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ message: 'Credenciais inválidas' });
  }

  const secret = process.env.JWT_SECRET || 'default_secret';
  const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' });

  return res.status(200).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage
    },
    token
  });
});

router.get('/users/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  return res.status(200).json(user);
});

router.put('/users/me', authMiddleware, handleUpload('profileImage'), async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { name, email, password, age } = req.body as UpdateUserInput;

  const dataToUpdate: any = {};

  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;
  if (age !== undefined && age !== null && age !== ('' as any)) dataToUpdate.age = Number(age);
  if (password) {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }
  if (req.file) {
    dataToUpdate.profileImage = `/uploads/${req.file.filename}`;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      profileImage: true,
      updatedAt: true
    }
  });

  return res.status(200).json(updatedUser);
});

router.delete('/users/me', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  await prisma.user.delete({
    where: { id: userId }
  });

  return res.status(200).json({ message: 'Usuário removido com sucesso' });
});

export default router;