const { prisma } = require('../db/prisma');
const { generateDepositCode, depositByCode } = require('../services/deliveryService');

async function listar(req, res, next) {
  try {
    console.log('📦 Listando todas as entregas...');
    
    const deliveries = await prisma.entrega.findMany({
      include: {
        armario: {
          select: {
            id: true,
            nome: true,
            localizacao: true
          }
        },
        compartimento: {
          select: {
            id: true,
            numero: true
          }
        }
      },
      orderBy: {
        dataCriacao: 'desc'
      }
    });

    console.log(`✅ Encontradas ${deliveries.length} entregas`);

    res.json({
      success: true,
      data: deliveries,
      count: deliveries.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar entregas:', error);
    next(error);
  }
}

async function gerarCodigo(req, res, next) {
  try {
    const validatedData = req.body;
    
    console.log('🔢 Gerando código de depósito:', validatedData);
    
    const resultado = await generateDepositCode(validatedData);

    console.log(`✅ Código gerado: ${resultado.codigoDeposito}`);

    res.status(201).json({
      success: true,
      data: resultado,
      message: 'Código de depósito gerado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao gerar código:', error);
    next(error);
  }
}

async function depositar(req, res, next) {
  try {
    const { codigo, code } = req.body;
    const codigoDeposito = codigo || code; // Aceita ambos os formatos
    
    console.log(`📦 Depositando com código: ${codigoDeposito}`);
    
    const resultado = await depositByCode({ code: codigoDeposito });

    console.log(`✅ Depósito realizado: ${resultado.delivery.id}`);

    res.json({
      success: true,
      data: resultado,
      message: 'Depósito realizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao depositar:', error);
    next(error);
  }
}

async function corrigirStatusInconsistentes(req, res, next) {
  try {
    console.log('🔧 Corrigindo status inconsistentes...');
    
    // Buscar todas as entregas que estão PRONTAS mas com compartimento RESERVED
    const entregasInconsistentes = await prisma.entrega.findMany({
      where: {
        status: 'PRONTO_PARA_RETIRADA',
        compartimento: {
          status: 'RESERVADO'
        }
      },
      include: {
        compartimento: true
      }
    });
    
    console.log(`📊 Encontradas ${entregasInconsistentes.length} entregas inconsistentes`);

    // Atualizar todos os compartimentos em uma única transação
    await prisma.$transaction(async (tx) => {
      for (const entrega of entregasInconsistentes) {
        await tx.compartimento.update({
          where: { id: entrega.compartimentoId },
          data: { status: 'OCUPADO' }
        });
        console.log(`✅ Compartimento ${entrega.compartimento.numero} atualizado para OCUPADO`);
      }
    });
    
    res.json({
      success: true,
      message: `${entregasInconsistentes.length} status corrigidos com sucesso`,
      corrigidos: entregasInconsistentes.length
    });
    
  } catch (error) {
    console.error(' Erro ao corrigir status:', error);
    next(error);
  }
}

async function deletarEntrega(req, res, next) {
  try {
    const { id } = req.params;
    
    console.log(' Deletando entrega:', id);
    
    // Verificar se a entrega existe
    const entrega = await prisma.entrega.findUnique({
      where: { id },
      include: {
        Compartimento: true
      }
    });
    
    if (!entrega) {
      const err = new Error('Entrega não encontrada');
      err.statusCode = 404;
      throw err;
    }
    
    // Verificar se a entrega pode ser deletada (apenas PENDENTE_DEPOSITO)
    if (entrega.status !== 'PENDENTE_DEPOSITO') {
      const err = new Error('Apenas entregas pendentes de depósito podem ser deletadas');
      err.statusCode = 409;
      throw err;
    }
    
    // Deletar em transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Deletar logs de retirada associados (não deve haver, mas por segurança)
      await tx.retiradaLog.deleteMany({
        where: { entregaId: id }
      });
      
      // Deletar a entrega
      await tx.entrega.delete({
        where: { id }
      });
      
      // Liberar o compartimento se não houver mais entregas
      const outrasEntregas = await tx.entrega.count({
        where: { compartimentoId: entrega.compartimentoId }
      });
      
      if (outrasEntregas === 0) {
        await tx.compartimento.update({
          where: { id: entrega.compartimentoId },
          data: { status: 'DISPONIVEL' }
        });
        console.log(' Compartimento liberado:', entrega.compartimentoId);
      }
    });
    
    console.log(' Entrega PENDENTE_DEPOSITO deletada com sucesso');
    
    res.json({
      success: true,
      message: 'Entrega pendente deletada com sucesso'
    });
    
  } catch (error) {
    console.error(' Erro ao deletar entrega:', error);
    next(error);
  }
}

module.exports = { listar, gerarCodigo, depositar, corrigirStatusInconsistentes, deletarEntrega };
