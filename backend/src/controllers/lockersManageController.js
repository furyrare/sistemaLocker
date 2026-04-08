const { z } = require('zod');
const { prisma } = require('../db/prisma');

// Schema para validação
const lockerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  location: z.string().min(1, "Localização é obrigatória"),
  compartments: z.array(z.object({
    number: z.number(),
    size: z.literal('UNICO')
  })).optional()
});

async function getAllLockers(req, res, next) {
  try {
    console.log('📦 Buscando todos os lockers...');
    
    const lockers = await prisma.armario.findMany({
      orderBy: { nome: 'asc' },
      include: {
        Compartimento: {
          select: { id: true }
        }
      }
    });

    console.log(`✅ Encontrados ${lockers.length} lockers`);

    res.json({
      success: true,
      data: lockers,
      count: lockers.length
    });

  } catch (error) {
    console.error('❌ Error fetching lockers:', error);
    next(error);
  }
}

async function getLockerById(req, res, next) {
  try {
    const { id } = req.params;
    
    console.log(`📦 Buscando locker ID: ${id}`);
    
    const locker = await prisma.armario.findUnique({
      where: { id },
      include: {
        Compartimento: {
          orderBy: { numero: 'asc' }
        }
      }
    });

    if (!locker) {
      const err = new Error('Locker não encontrado');
      err.statusCode = 404;
      throw err;
    }

    console.log(`✅ Locker encontrado: ${locker.nome}`);

    res.json({
      success: true,
      data: locker
    });

  } catch (error) {
    console.error('❌ Erro ao buscar locker:', error);
    next(error);
  }
}

async function createLocker(req, res, next) {
  try {
    const validatedData = lockerSchema.parse(req.body);
    
    console.log('📦 Criando novo locker:', validatedData);
    
    const result = await prisma.$transaction(async (tx) => {
      // Criar o armário
      const locker = await tx.armario.create({
        data: {
          id: validatedData.id || `locker_${Date.now()}`,
          nome: validatedData.name,
          localizacao: validatedData.location,
          dataCriacao: new Date(),
          dataAtualizacao: new Date()
        }
      });

      // Criar compartimentos se fornecidos
      if (validatedData.compartments && validatedData.compartments.length > 0) {
        const compartments = validatedData.compartments.map(comp => ({
          id: `comp_${locker.id}_${comp.number}`,
          armarioId: locker.id,
          numero: comp.number,
          tamanho: comp.size,
          status: 'DISPONIVEL',
          dataCriacao: new Date(),
          dataAtualizacao: new Date()
        }));

        await tx.compartimento.createMany({
          data: compartments
        });
      }

      return locker;
    });

    console.log(`✅ Locker criado: ${result.id}`);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Locker criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao criar locker:', error);
    next(error);
  }
}

async function updateLocker(req, res, next) {
  try {
    const { id } = req.params;
    const validatedData = lockerSchema.partial().parse(req.body);
    
    console.log(`📦 Atualizando locker ID: ${id}`, validatedData);
    
    const locker = await prisma.armario.findUnique({
      where: { id }
    });

    if (!locker) {
      const err = new Error('Locker não encontrado');
      err.statusCode = 404;
      throw err;
    }

    const updatedLocker = await prisma.armario.update({
      where: { id },
      data: {
        nome: validatedData.name,
        localizacao: validatedData.location,
        dataAtualizacao: new Date()
      }
    });

    console.log(`✅ Locker atualizado: ${updatedLocker.id}`);

    res.json({
      success: true,
      data: updatedLocker,
      message: 'Locker atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar locker:', error);
    next(error);
  }
}

async function deleteLocker(req, res, next) {
  try {
    const { id } = req.params;
    
    console.log(`📦 Deletando locker ID: ${id}`);
    
    const locker = await prisma.armario.findUnique({
      where: { id },
      include: {
        Compartimento: {
          include: {
            Entrega: true
          }
        }
      }
    });

    if (!locker) {
      const err = new Error('Locker não encontrado');
      err.statusCode = 404;
      throw err;
    }

    // Verificar se há Entregas ativas
    const activeDeliveries = locker.Compartimento.some(comp => 
      comp.Entrega.some(del => del.status !== 'RETIRADO')
    );

    if (activeDeliveries) {
      const err = new Error('Locker possui Entregas ativas e não pode ser excluído');
      err.statusCode = 409;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      // Se não há entregas ativas, pode deletar diretamente
      // Apenas deleta compartimentos e locker
      await tx.compartimento.deleteMany({
        where: { armarioId: id }
      });

      await tx.armario.delete({
        where: { id }
      });
    });

    console.log(`✅ Locker deletado: ${id}`);

    res.json({
      success: true,
      message: 'Locker deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar locker:', error);
    next(error);
  }
}

async function getLockerStats(req, res, next) {
  try {
    const { id } = req.params;
    
    console.log(`📦 Buscando estatísticas do locker ID: ${id}`);
    
    const stats = await prisma.armario.findUnique({
      where: { id },
      include: {
        Compartimento: {
          select: {
            status: true
          }
        }
      }
    });

    if (!stats) {
      const err = new Error('Locker não encontrado');
      err.statusCode = 404;
      throw err;
    }

    const totalCompartments = stats.Compartimento.length;
    const availableCompartments = stats.Compartimento.filter(c => c.status === 'DISPONIVEL').length;
    const occupiedCompartments = totalCompartments - availableCompartments;

    res.json({
      success: true,
      data: {
        totalCompartments,
        availableCompartments,
        occupiedCompartments,
        occupationRate: totalCompartments > 0 ? (occupiedCompartments / totalCompartments * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    next(error);
  }
}

async function getLockerDeliveries(req, res, next) {
  try {
    const { id } = req.params;
    const { status, startDate, endDate } = req.query;
    
    console.log(`📦 Buscando Entregas do locker ID: ${id}`);
    
    const whereClause = {
      armarioId: id,
      ...(status && { status }),
      ...(startDate && endDate && {
        dataCriacao: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const deliveries = await prisma.Entrega.findMany({
      where: whereClause,
      include: {
        Compartimento: {
          select: { numero: true }
        }
      },
      orderBy: { dataCriacao: 'desc' }
    });

    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar Entregas:', error);
    next(error);
  }
}

async function clearAllDeliveries(req, res, next) {
  try {
    const { id } = req.params;
    
    console.log(`📦 Limpando todas as Entregas do locker ID: ${id}`);
    
    const locker = await prisma.armario.findUnique({
      where: { id },
      include: {
        Compartimento: {
          include: {
            Entrega: true
          }
        }
      }
    });

    if (!locker) {
      const err = new Error('Locker não encontrado');
      err.statusCode = 404;
      throw err;
    }

    await prisma.$transaction(async (tx) => {
      // Deletar logs de retirada
      const deliveryIds = locker.Compartimento.flatMap(comp => 
        comp.Entrega.map(del => del.id)
      );
      
      if (deliveryIds.length > 0) {
        await tx.retiradaLog.deleteMany({
          where: {
            entregaId: {
              in: deliveryIds
            }
          }
        });
      }

      // Deletar Entregas
      await tx.Entrega.deleteMany({
        where: { armarioId: id }
      });

      // Liberar compartimentos
      await tx.compartimento.updateMany({
        where: { armarioId: id },
        data: { status: 'DISPONIVEL' }
      });
    });

    console.log(`✅ Entregas do locker ${id} removidas`);

    res.json({
      success: true,
      message: 'Todas as Entregas foram removidas com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao limpar Entregas:', error);
    next(error);
  }
}

module.exports = {
  getAllLockers,
  getLockerById,
  createLocker,
  updateLocker,
  deleteLocker,
  getLockerStats,
  getLockerDeliveries,
  clearAllDeliveries
};
