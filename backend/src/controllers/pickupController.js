const { prisma } = require('../db/prisma');
const crypto = require('crypto');
const { pickupByCode: deliveryPickupByCode } = require('../services/deliveryService');

async function pickupByCode(req, res, next) {
  try {
    const { code, ipAddress } = req.body;

    // Usar a função do deliveryService que já faz tudo corretamente
    const result = await deliveryPickupByCode({ code, ipAddress });

    res.json({
      success: true,
      message: 'Retirada realizada com sucesso',
      data: {
        recipientName: result.nomeDestinatario,
        lockerName: result.Armario.nome,
        compartmentNumber: result.Compartimento.numero
      }
    });
  } catch (error) {
    console.error('❌ Erro na retirada:', error);
    next(error);
  }
}

async function verifyPickupCode(req, res, next) {
  try {
    const { pickupCode } = req.body;

    const delivery = await prisma.entrega.findUnique({
      where: { codigoRetirada: pickupCode }, // Corrigido: codigoRetirada em vez de pickupCode
      include: {
        Armario: { select: { nome: true, localizacao: true } }, // Corrigido: Armario em vez de locker
        Compartimento: { select: { numero: true } } // Corrigido: Compartimento em vez de compartment
      }
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Código não encontrado' });
    }

    if (delivery.status !== 'PRONTO_PARA_RETIRADA') { // Corrigido: PRONTO_PARA_RETIRADA em vez de READY_FOR_PICKUP
      return res.status(400).json({ error: 'Entrega não está pronta para retirada' });
    }

    res.json({
      success: true,
      delivery: {
        recipientName: delivery.nomeDestinatario, // Corrigido: nomeDestinatario em vez de recipientName
        lockerName: delivery.Armario.nome, // Corrigido: Armario.nome em vez de locker.name
        compartmentNumber: delivery.Compartimento.numero // Corrigido: Compartimento.numero em vez de compartment.number
      }
    });
  } catch (error) {
    next(error);
  }
}

async function completePickup(req, res, next) {
  try {
    const { pickupCode, ipAddress } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const delivery = await tx.entrega.update({
        where: { codigoRetirada: pickupCode }, // Corrigido: codigoRetirada em vez de pickupCode
        data: { 
          status: 'RETIRADO',
          dataRetirada: new Date() // Corrigido: dataRetirada em vez de pickedUpAt
        },
        include: {
          Compartimento: true // Corrigido: Compartimento em vez de compartment
        }
      });

      await tx.compartimento.update({
        where: { id: delivery.compartimentoId },
        data: { status: 'DISPONIVEL' } // Corrigido: DISPONIVEL em vez de AVAILABLE
      });

      await tx.retiradaLog.create({ // Corrigido: retiradaLog em vez de pickupLog
        data: {
          id: crypto.randomUUID(),
          entregaId: delivery.id, // Corrigido: entregaId em vez de deliveryId
          enderecoIP: ipAddress || null // Corrigido: enderecoIP em vez de ipAddress
        }
      });

      return delivery;
    });

    res.json({
      success: true,
      message: 'Retirada concluída com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { pickupByCode, verifyPickupCode, completePickup };
