const express = require('express');
const { generateDepositCode, depositByCode } = require('../services/deliveryService');

const router = express.Router();

// Gerar código de depósito
router.post('/generate-code', async (req, res, next) => {
  try {
    const result = await generateDepositCode(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Códigos gerados com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// Realizar depósito
router.post('/deposit', async (req, res, next) => {
  try {
    const result = await depositByCode(req.body);
    res.json({
      success: true,
      data: result,
      message: 'Depósito realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
