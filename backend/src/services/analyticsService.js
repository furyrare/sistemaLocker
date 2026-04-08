const { prisma } = require('../db/prisma');

async function getEntregaAnalytics({ lockerId, startDate, endDate }) {
  try {
    // Verificar conexão antes de executar query
    await prisma.$connect();
    
    const where = {};
    
    // Filtro por locker
    if (lockerId) {
      where.armarioId = lockerId;
    }
    
    // Filtro por período
    if (startDate || endDate) {
      where.dataCriacao = {};
      if (startDate) where.dataCriacao.gte = new Date(startDate);
      if (endDate) where.dataCriacao.lte = new Date(endDate);
    }

    // Contagem total de entregas
    const totalDeliveries = await prisma.entrega.count({ where });

    // Entregas por status
    const deliveriesByStatus = await prisma.entrega.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    });

    // Entregas por locker (se não filtrar por locker específico)
    let deliveriesByLocker = [];
    if (!lockerId) {
      // Buscar entregas com join de lockers
      const deliveriesWithLockers = await prisma.entrega.findMany({
        where,
        select: {
          Armario: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      // Agrupar por locker
      const lockerCounts = {};
      deliveriesWithLockers.forEach(delivery => {
        const lockerId = delivery.Armario.id;
        const lockerName = delivery.Armario.nome;
        
        if (!lockerCounts[lockerId]) {
          lockerCounts[lockerId] = {
            lockerId,
            lockerName,
            totalDeliveries: 0
          };
        }
        lockerCounts[lockerId].totalDeliveries++;
      });

      deliveriesByLocker = Object.values(lockerCounts);
    }

    // Entregas por dia (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Montar query dinamicamente para SQL Server
    let query = `
      SELECT 
        FORMAT(dataCriacao, 'dd/MM/yyyy') as date,
        COUNT(*) as count
      FROM Entregas
      WHERE dataCriacao >= '${thirtyDaysAgo.toISOString().split('T')[0]}'
    `;
    
    if (lockerId) {
      query += ` AND armarioId = '${lockerId}'`;
    }
    
    if (startDate) {
      query += ` AND dataCriacao >= '${new Date(startDate).toISOString().split('T')[0]}'`;
    }
    
    if (endDate) {
      query += ` AND dataCriacao <= '${new Date(endDate).toISOString().split('T')[0]}'`;
    }
    
    query += ` GROUP BY FORMAT(dataCriacao, 'dd/MM/yyyy') ORDER BY date DESC`;
    
    const deliveriesByDay = await prisma.$queryRawUnsafe(query);

    // Calcular estatísticas
    const pickedUpDeliveries = deliveriesByStatus.find(s => s.status === 'RETIRADO')?._count.status || 0;
    const pendingDeliveries = deliveriesByStatus.find(s => s.status === 'PRONTO_PARA_RETIRADA')?._count.status || 0;
    
    // Tempo médio de retirada (em horas)
    let timeQuery = `
      SELECT AVG(DATEDIFF(hour, dataCriacao, dataRetirada)) as avgHours
      FROM Entregas
      WHERE dataRetirada IS NOT NULL
    `;
    
    if (lockerId) {
      timeQuery += ` AND armarioId = '${lockerId}'`;
    }
    
    if (startDate) {
      timeQuery += ` AND dataCriacao >= '${new Date(startDate).toISOString().split('T')[0]}'`;
    }
    
    if (endDate) {
      timeQuery += ` AND dataCriacao <= '${new Date(endDate).toISOString().split('T')[0]}'`;
    }
    
    const averagePickupTime = await prisma.$queryRawUnsafe(timeQuery);

    const averagePickupTimeHours = averagePickupTime[0]?.avgHours || 0;

    // Montar objeto de retorno
    const analytics = {
      totalDeliveries,
      pickedUpDeliveries,
      pendingDeliveries,
      averagePickupTimeHours: parseFloat(averagePickupTimeHours),
      statusBreakdown: {},
      deliveriesByLocker,
      deliveriesByDay: deliveriesByDay.map(d => ({
        date: d.date,
        count: parseInt(d.count)
      }))
    };

    // Montar breakdown por status
    deliveriesByStatus.forEach(status => {
      analytics.statusBreakdown[status.status] = status._count.status;
    });

    await prisma.$disconnect();
    
    return analytics;
    
  } catch (error) {
    console.error('Erro no analyticsService:', error);
    await prisma.$disconnect();
    throw error;
  }
}

module.exports = {
  getEntregaAnalytics
};
