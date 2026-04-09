const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../db/prisma');
const { z } = require('zod');

// Schema de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'sistema-locker-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Login de usuário
async function login(req, res, next) {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    // Gerar token
    const token = generateToken(usuario.id);

    // Retornar dados do usuário (sem senha)
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.json({
      message: 'Login realizado com sucesso',
      usuario: usuarioSemSenha,
      token
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    next(error);
  }
}

// Registro de usuário
async function register(req, res, next) {
  try {
    const { nome, email, senha } = registerSchema.parse(req.body);

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'Email já cadastrado' 
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash
      }
    });

    // Gerar token
    const token = generateToken(usuario.id);

    // Retornar dados do usuário (sem senha)
    const { senha: _, ...usuarioSemSenha } = usuario;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: usuarioSemSenha,
      token
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: error.errors
      });
    }
    next(error);
  }
}

// Verificar token (middleware)
async function verifyToken(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Token não fornecido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sistema-locker-secret');
    
    // Buscar usuário no banco
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        dataCriacao: true
      }
    });

    if (!usuario) {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    // Adicionar usuário ao request
    req.usuario = usuario;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    next(error);
  }
}

// Obter dados do usuário logado
async function getProfile(req, res, next) {
  try {
    // O usuário já está disponível no req.usuario (pelo middleware verifyToken)
    res.json({
      message: 'Dados do usuário',
      usuario: req.usuario
    });
  } catch (error) {
    next(error);
  }
}

// Logout (apenas informativo, JWT é stateless)
async function logout(req, res, next) {
  try {
    res.json({ 
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  verifyToken,
  getProfile,
  logout
};
