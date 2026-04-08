const { z } = require('zod');
const { prisma } = require('../db/prisma');

/**
 * Controller para gerenciamento de compartimentos
 * 
 * Responsável por bloquear/desbloquear compartimentos
 */

const toggleStatusSchema = z.object({
  id: z.string(),
  status: z.enum(['DISPONIVEL', 'BLOQUEADO'])
});

async function toggleStatus(req, res, next) {
  try {
    const { id, status } = toggleStatusSchema.parse(req.body);
    
    // Verificar se o compartimento existe
    const compartment = await prisma.compartimento.findUnique({
      where: { id },
      include: {
        Armario: true
      }
    });
    
    if (!compartment) {
      const err = new Error('Compartimento não encontrado');
      err.statusCode = 404;
      throw err;
    }
    
    // Verificar se pode mudar o status (apenas bloqueia se tiver entregas ativas)
    if (compartment.status === 'OCUPADO' || compartment.status === 'RESERVADO' || compartment.status === 'BLOQUEADO') {
      // Permitir se só tiver entregas RETIRADO (já retiradas)
      const hasActiveDeliveries = await prisma.entrega.findFirst({
        where: {
          compartimentoId: id,
          status: {
            notIn: ['RETIRADO']
          }
        }
      });
      
      if (hasActiveDeliveries) {
        const err = new Error('Compartimentos ocupados, reservados ou bloqueados não podem ter seu status alterado se houver entregas ativas');
        err.statusCode = 409;
        throw err;
      }
    }
    
    // Atualizar o status do compartimento
    const updatedCompartment = await prisma.compartimento.update({
      where: { id },
      data: { 
        status,
        dataAtualizacao: new Date()
      },
      include: {
        Armario: {
          select: { nome: true, localizacao: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedCompartment,
      message: `Status do compartimento atualizado para ${status}`
    });
    
  } catch (error) {
    next(error);
  }
}

async function getCompartmentsByLocker(req, res, next) {
  try {
    const { armarioId } = req.params;
    
    const compartments = await prisma.compartimento.findMany({
      where: { armarioId },
      include: {
        Armario: {
          select: { nome: true }
        }
      },
      orderBy: { numero: 'asc' }
    });
    
    res.json(compartments);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const compartments = await prisma.compartimento.findMany({
      include: {
        Armario: {
          select: { nome: true, localizacao: true }
        }
      },
      orderBy: { numero: 'asc' }
    });
    
    res.json(compartments);
  } catch (error) {
    next(error);
  }
}

async function padronizarStatus(req, res, next) {
  try {
    console.log('🔧 Padronizando status de AVAILABLE para DISPONIVEL...');
    
    // Atualizar todos os compartimentos com status AVAILABLE para DISPONIVEL
    const result = await prisma.compartimento.updateMany({
      where: { status: 'AVAILABLE' },
      data: { status: 'DISPONIVEL' }
    });
    
    console.log(`✅ ${result.count} compartimentos atualizados de AVAILABLE para DISPONIVEL`);
    
    res.json({
      success: true,
      message: `${result.count} compartimentos padronizados com sucesso`,
      atualizados: result.count
    });
    
  } catch (error) {
    console.error('❌ Erro ao padronizar status:', error);
    next(error);
  }
}

async function padronizarBloqueados(req, res, next) {
  try {
    console.log('🔧 Padronizando status de BLOCKED para BLOQUEADO...');
    
    // Atualizar todos os compartimentos com status BLOCKED para BLOQUEADO
    const result = await prisma.compartimento.updateMany({
      where: { status: 'BLOCKED' },
      data: { status: 'BLOQUEADO' }
    });
    
    console.log(`✅ ${result.count} compartimentos atualizados de BLOCKED para BLOQUEADO`);
    
    res.json({
      success: true,
      message: `${result.count} compartimentos bloqueados padronizados com sucesso`,
      atualizados: result.count
    });
    
  } catch (error) {
    console.error('❌ Erro ao padronizar status bloqueados:', error);
    next(error);
  }
}

module.exports = { toggleStatus, getCompartmentsByLocker, list, padronizarStatus, padronizarBloqueados };
