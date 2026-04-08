const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rotas
const lockersRoutes = require('./src/routes/lockersRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const deliveriesManageRoutes = require('./src/routes/deliveriesManageRoutes');
const lockersManageRoutes = require('./src/routes/lockersManageRoutes');
const pickupRoutes = require('./src/routes/pickupRoutes');
const compartmentRoutes = require('./src/routes/compartmentRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/lockers', lockersRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/deliveries-manage', deliveriesManageRoutes);
app.use('/api/lockers-manage', lockersManageRoutes);
app.use('/api/pickup', pickupRoutes);
app.use('/api/compartment', compartmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
