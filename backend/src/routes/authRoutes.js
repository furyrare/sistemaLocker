const express = require('express');
const router = express.Router();
const { login, register, getProfile, logout } = require('../controllers/authController');
const { verifyToken } = require('../controllers/authController');

// Rota de login
router.post('/login', login);

// Rota de registro
router.post('/register', register);

// Rota de logout
router.post('/logout', logout);

// Rota protegida - obter perfil do usuário
router.get('/profile', verifyToken, getProfile);

module.exports = router;
