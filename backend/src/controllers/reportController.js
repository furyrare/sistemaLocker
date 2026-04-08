const { prisma } = require('../db/prisma');

async function getDeliveryReport(req, res, next) {
  try {
    const { startDate, endDate, lockerId } = req.query;

    const where = {};
    
    // Filtro por período
    if (startDate || endDate) {
      where.dataCriacao = {};
      if (startDate) where.dataCriacao.gte = new Date(startDate);
      if (endDate) where.dataCriacao.lte = new Date(endDate);
    }
    
    // Filtro por locker
    if (lockerId) {
      where.armarioId = lockerId;
    }

    const deliveries = await prisma.entrega.findMany({
      where,
      include: {
        Armario: { select: { nome: true, localizacao: true } },
        Compartimento: { select: { numero: true } }
      },
      orderBy: { dataCriacao: 'desc' }
    });

    res.json(deliveries);
  } catch (error) {
    next(error);
  }
}

async function exportDeliveryReport(req, res, next) {
  try {
    console.log('🔄 Iniciando exportDeliveryReport');
    const { startDate, endDate, lockerId } = req.query;
    console.log('📋 Parâmetros:', { startDate, endDate, lockerId });

    const where = {};
    
    // Filtro por período
    if (startDate || endDate) {
      where.dataCriacao = {};
      if (startDate) where.dataCriacao.gte = new Date(startDate);
      if (endDate) where.dataCriacao.lte = new Date(endDate);
    }
    
    // Filtro por locker
    if (lockerId) {
      where.armarioId = lockerId;
    }

    console.log('🔍 Where clause:', where);

    const deliveries = await prisma.entrega.findMany({
      where,
      include: {
        Armario: { select: { nome: true, localizacao: true } },
        Compartimento: { select: { numero: true } }
      },
      orderBy: { dataCriacao: 'desc' }
    });

    console.log('📊 Entregas encontradas:', deliveries.length);

    // Gerar CSV exatamente igual ao modelo (ponto e vírgula como separador)
    console.log('📝 Gerando CSV formato modelo...');
    
    // Headers exatos do seu arquivo
    const headers = 'ID Pedido;Nome Completo Destinatario;Email Destinatario;Telefone Destinatario;Email Remetente;Descricao Produto;Status Atual;Codigo Deposito;Codigo Retirada;Nome Locker;Endereco Locker;Numero Compartimento;Data Criacao Pedido;Data Hora Deposito;Data Hora Retirada;Numero Pedido Cliente;Tamanho Produto;Tempo Permanencia (horas);Dias em Locker;Status Finalizado;Periodo Permanencia';

    // Converter para CSV com ponto e vírgula (formato brasileiro/Excel)
    const csvContent = '\uFEFF' + // BOM para Excel
      headers + '\n' +
      deliveries.map((delivery) => {
        // Calcular tempo de permanência em horas
        let tempoPermanencia = '';
        let diasEmLocker = '';
        let periodoPermanencia = '';
        
        if (delivery.dataDeposito && delivery.dataRetirada) {
          const deposito = new Date(delivery.dataDeposito);
          const retirada = new Date(delivery.dataRetirada);
          const diffMs = retirada - deposito;
          const diffHours = diffMs / (1000 * 60 * 60);
          tempoPermanencia = diffHours.toFixed(2);
          diasEmLocker = (diffHours / 24).toFixed(1);
          
          if (diffHours < 1) {
            periodoPermanencia = 'Menos de 1 hora';
          } else if (diffHours < 24) {
            periodoPermanencia = `${Math.floor(diffHours)} horas`;
          } else {
            periodoPermanencia = `${Math.floor(diffHours / 24)} dias`;
          }
        }

        const row = [
          delivery.id || '',
          `"${String(delivery.nomeDestinatario || '').replace(/"/g, '""')}"`,
          `"${String(delivery.emailDestinatario || '').replace(/"/g, '""')}"`,
          `"${String(delivery.telefoneDestinatario || '').replace(/"/g, '""')}"`,
          `"${String(delivery.emailDestinatario || '').replace(/"/g, '""')}"`, // Email remetente = mesmo email
          `"${String(delivery.descricao || '').replace(/"/g, '""')}"`,
          delivery.status || '',
          `"${String(delivery.codigoDeposito || '').replace(/"/g, '""')}"`,
          `"${String(delivery.codigoRetirada || '').replace(/"/g, '""')}"`,
          `"${String(delivery.Armario?.nome || '').replace(/"/g, '""')}"`,
          `"${String(delivery.Armario?.localizacao || '').replace(/"/g, '""')}"`,
          delivery.Compartimento?.numero || '',
          delivery.dataCriacao ? new Date(delivery.dataCriacao).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', '') : '', // Remove vírgula para não conflitar com separador
          delivery.dataDeposito ? new Date(delivery.dataDeposito).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', '') : '',
          delivery.dataRetirada ? new Date(delivery.dataRetirada).toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(',', '') : '',
          `"${String(delivery.numeroPedido || '').replace(/"/g, '""')}"`,
          '', // Tamanho Produto (vazio)
          tempoPermanencia,
          diasEmLocker,
          delivery.status === 'RETIRADO' ? 'Sim' : 'Não',
          periodoPermanencia
        ];
        return row.join(';'); // Ponto e vírgula separa as colunas
      }).join('\n');

    console.log('📤 Enviando CSV formato modelo...');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-completo-pedidos-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);
    console.log('✅ Exportação concluída');
  } catch (error) {
    console.error('❌ Erro no exportDeliveryReport:', error);
    console.error('❌ Stack:', error.stack);
    next(error);
  }
}

async function getLockerReport(req, res, next) {
  try {
    const lockers = await prisma.locker.findMany({
      include: {
        compartments: {
          select: {
            status: true
          }
        },
        deliveries: {
          select: {
            status: true,
            createdAt: true
          }
        }
      }
    });

    res.json(lockers);
  } catch (error) {
    next(error);
  }
}

async function getSummaryReport(req, res, next) {
  try {
    const stats = await prisma.$transaction([
      prisma.delivery.count(),
      prisma.delivery.count({ where: { status: 'RETIRADO' } }),
      prisma.delivery.count({ where: { status: 'PENDING_DEPOSIT' } }),
      prisma.delivery.count({ where: { status: 'READY_FOR_PICKUP' } }),
      prisma.locker.count(),
      prisma.compartment.count({ where: { status: 'AVAILABLE' } })
    ]);

    const [total, pickedUp, pending, ready, totalLockers, availableCompartments] = stats;

    res.json({
      totalDeliveries: total,
      pickedUpDeliveries: pickedUp,
      pendingDeliveries: pending,
      readyDeliveries: ready,
      totalLockers,
      availableCompartments
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDeliveryReport, exportDeliveryReport, getLockerReport, getSummaryReport };
