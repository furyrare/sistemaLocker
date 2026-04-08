const { prisma } = require('../db/prisma');

async function getStats(req, res, next) {
  try {
    const stats = await prisma.entrega.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function getSummary(req, res, next) {
  try {
    const totalLockers = await prisma.armario.count();
    const totalDeliveries = await prisma.entrega.count();
    const availableCompartments = await prisma.compartimento.count({
      where: { status: 'DISPONIVEL' }
    });

    res.json({
      totalLockers,
      totalDeliveries,
      availableCompartments
    });
  } catch (error) {
    next(error);
  }
}

async function getGrid(req, res, next) {
  try {
    const { lockerId } = req.query;
    
    if (!lockerId) {
      return res.status(400).json({ error: 'Locker ID é obrigatório' });
    }
    
    const compartments = await prisma.compartimento.findMany({
      where: { armarioId: lockerId },
      include: {
        Entrega: {
          select: {
            id: true,
            nomeDestinatario: true,
            emailDestinatario: true,
            codigoDeposito: true,
            codigoRetirada: true,
            descricao: true,
            status: true
          }
        }
      },
      orderBy: { numero: 'asc' }
    });
    
    // Adicionar informações de entrega aos compartimentos
    const compartmentsWithDelivery = compartments.map(comp => ({
      ...comp,
      deliveryId: comp.Entrega?.[0]?.id || null,
      deliveryDetails: comp.Entrega?.[0] || null,
      // Manter o status original do banco, não sobrescrever
      status: comp.status
    }));
    
    res.json(compartmentsWithDelivery);
  } catch (error) {
    next(error);
  }
}

module.exports = { getStats, getSummary, getGrid };
// Teste de modificação
