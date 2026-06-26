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
    const periodStart = startDate ? new Date(startDate) : thirtyDaysAgo;
    const periodEnd = endDate ? new Date(endDate) : null;

    let deliveriesByDay;
    if (lockerId && periodEnd) {
      deliveriesByDay = await prisma.$queryRaw`
        SELECT FORMAT(dataCriacao, 'dd/MM/yyyy') as date, COUNT(*) as count
        FROM Entregas
        WHERE dataCriacao >= ${periodStart} AND dataCriacao <= ${periodEnd} AND armarioId = ${lockerId}
        GROUP BY FORMAT(dataCriacao, 'dd/MM/yyyy') ORDER BY date DESC`;
    } else if (lockerId) {
      deliveriesByDay = await prisma.$queryRaw`
        SELECT FORMAT(dataCriacao, 'dd/MM/yyyy') as date, COUNT(*) as count
        FROM Entregas
        WHERE dataCriacao >= ${periodStart} AND armarioId = ${lockerId}
        GROUP BY FORMAT(dataCriacao, 'dd/MM/yyyy') ORDER BY date DESC`;
    } else if (periodEnd) {
      deliveriesByDay = await prisma.$queryRaw`
        SELECT FORMAT(dataCriacao, 'dd/MM/yyyy') as date, COUNT(*) as count
        FROM Entregas
        WHERE dataCriacao >= ${periodStart} AND dataCriacao <= ${periodEnd}
        GROUP BY FORMAT(dataCriacao, 'dd/MM/yyyy') ORDER BY date DESC`;
    } else {
      deliveriesByDay = await prisma.$queryRaw`
        SELECT FORMAT(dataCriacao, 'dd/MM/yyyy') as date, COUNT(*) as count
        FROM Entregas
        WHERE dataCriacao >= ${periodStart}
        GROUP BY FORMAT(dataCriacao, 'dd/MM/yyyy') ORDER BY date DESC`;
    }

    // Calcular estatísticas
    const pickedUpDeliveries = deliveriesByStatus.find(s => s.status === 'RETIRADO')?._count.status || 0;
    const pendingDeliveries = deliveriesByStatus.find(s => s.status === 'PRONTO_PARA_RETIRADA')?._count.status || 0;
    
    // Tempo médio de retirada (em horas)
    let averagePickupTime;
    if (lockerId && periodEnd) {
      averagePickupTime = await prisma.$queryRaw`
        SELECT AVG(DATEDIFF(hour, dataCriacao, dataRetirada)) as avgHours
        FROM Entregas
        WHERE dataRetirada IS NOT NULL AND armarioId = ${lockerId} AND dataCriacao >= ${periodStart} AND dataCriacao <= ${periodEnd}`;
    } else if (lockerId) {
      averagePickupTime = await prisma.$queryRaw`
        SELECT AVG(DATEDIFF(hour, dataCriacao, dataRetirada)) as avgHours
        FROM Entregas
        WHERE dataRetirada IS NOT NULL AND armarioId = ${lockerId} AND dataCriacao >= ${periodStart}`;
    } else if (periodEnd) {
      averagePickupTime = await prisma.$queryRaw`
        SELECT AVG(DATEDIFF(hour, dataCriacao, dataRetirada)) as avgHours
        FROM Entregas
        WHERE dataRetirada IS NOT NULL AND dataCriacao >= ${periodStart} AND dataCriacao <= ${periodEnd}`;
    } else {
      averagePickupTime = await prisma.$queryRaw`
        SELECT AVG(DATEDIFF(hour, dataCriacao, dataRetirada)) as avgHours
        FROM Entregas
        WHERE dataRetirada IS NOT NULL AND dataCriacao >= ${periodStart}`;
    }

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
