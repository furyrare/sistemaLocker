const { z } = require('zod');
const { prisma } = require('../db/prisma');

/**
 * Controller para gerenciamento de entregas
 * 
 * Responsável por listar e deletar entregas
 */

async function list(req, res, next) {
  try {
    const { lockerId } = req.query;
    
    const whereClause = lockerId ? { armarioId: lockerId } : {};
    
    const deliveries = await prisma.entrega.findMany({
      where: whereClause,
      include: {
        Armario: {
          select: { nome: true, localizacao: true }
        },
        Compartimento: {
          select: { numero: true }
        }
      },
      orderBy: { dataCriacao: 'desc' },
      take: 50
    });
    
    res.json(deliveries);
  } catch (err) {
    next(err);
  }
}

async function deleteDelivery(req, res, next) {
  try {
    const paramsSchema = z.object({ id: z.string().min(1) });
    const { id } = paramsSchema.parse(req.params);
    
    // Verificar se a entrega existe
    const delivery = await prisma.entrega.findUnique({
      where: { id },
      include: {
        Compartimento: true
      }
    });
    
    if (!delivery) {
      const err = new Error('Entrega não encontrada');
      err.statusCode = 404;
      throw err;
    }
    
    // Se a entrega já foi retirada ou está pronta para retirada, não permitir exclusão
    // EXCETO se o compartimento estiver BLOQUEADO (inconsistência a ser corrigida)
    if ((delivery.status === 'RETIRADO' || delivery.status === 'PRONTO_PARA_RETIRADA') && delivery.Compartimento.status !== 'BLOQUEADO') {
      const err = new Error('Entregas prontas para retirada ou já retiradas não podem ser excluídas e servem como histórico.');
      err.statusCode = 409;
      throw err;
    }
    
    // Se a entrega ainda não foi retirada, liberar o compartimento
    if (delivery.status !== 'RETIRADO') {
      await prisma.$transaction(async (tx) => {
        // Deletar logs de retirada primeiro
        await tx.retiradaLog.deleteMany({
          where: { entregaId: id }
        });

        // Deletar a entrega
        await tx.entrega.delete({
          where: { id }
        });

        // Liberar o compartimento
        await tx.compartimento.update({
          where: { id: delivery.compartimentoId },
          data: { status: 'DISPONIVEL' }
        });
      });
    }
    
    res.json({ 
      ok: true, 
      message: 'Entrega removida com sucesso' 
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, deleteDelivery };
