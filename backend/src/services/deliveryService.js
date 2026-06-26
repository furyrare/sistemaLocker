const { prisma } = require('../db/prisma');
const { gerarCodigo } = require('../utils/gerarCodigo');
const { sendPickupCodeEmail } = require('./emailService');
const { sendPickupCodeWhatsapp, sendPickupConfirmationWhatsapp } = require('./whatsappService');
const crypto = require('crypto');

async function generateDepositCode({ emailDestinatario, nomeDestinatario, telefoneDestinatario, emailRemetente, lockerId, descricao, numeroPedido, size }) {
  const depositCode = gerarCodigo(6);
  const pickupCode = gerarCodigo(6);

  // Verificar se há compartimentos disponíveis e escolher aleatoriamente
  const availableCompartments = await prisma.compartimento.findMany({
    where: {
      armarioId: lockerId,
      status: 'DISPONIVEL'
    }
  });

  if (!availableCompartments || availableCompartments.length === 0) {
    const err = new Error('Nenhum compartimento disponível neste locker.');
    err.statusCode = 409;
    throw err;
  }

  // Escolher um compartimento aleatoriamente
  const randomIndex = Math.floor(Math.random() * availableCompartments.length);
  const availableCompartment = availableCompartments[randomIndex];
  
  console.log(`🎲 Caixa escolhida aleatoriamente: ${availableCompartment.numero} (índice ${randomIndex} de ${availableCompartments.length} disponíveis)`);

  const delivery = await prisma.$transaction(async (tx) => {
    const newDelivery = await tx.entrega.create({
      data: {
        id: crypto.randomUUID(),
        armarioId: lockerId,
        compartimentoId: availableCompartment.id,
        nomeDestinatario,
        emailDestinatario,
        telefoneDestinatario,
        emailRemetente,
        descricao,
        numeroPedido,
        codigoDeposito: depositCode,
        codigoRetirada: pickupCode,
        status: 'PENDENTE_DEPOSITO'
      },
      include: {
        Armario: {
          select: {
            id: true,
            nome: true,
            localizacao: true
          }
        },
        Compartimento: {
          select: {
            id: true,
            numero: true,
            status: true
          }
        }
      }
    });

    await tx.compartimento.update({
      where: { id: availableCompartment.id },
      data: { status: 'RESERVADO' }
    });

    return newDelivery;
  });

  return { 
    delivery, 
    codigoDeposito: depositCode, 
    codigoRetirada: pickupCode,
    Armario: delivery.Armario,
    Compartimento: delivery.Compartimento,
    mensagem: `🎲 Caixa ${delivery.Compartimento.numero} escolhida aleatoriamente no locker ${delivery.Armario.nome}`
  };
}

async function depositByCode({ code, ipAddress }) {
  const delivery = await prisma.entrega.findFirst({
    where: {
      codigoDeposito: code,
      status: 'PENDENTE_DEPOSITO'
    },
    include: {
      Armario: true,
      Compartimento: true
    }
  });

  if (!delivery) {
    const usedDelivery = await prisma.entrega.findFirst({
      where: {
        codigoDeposito: code,
        status: { in: ['PRONTO_PARA_RETIRADA', 'RETIRADO'] }
      },
      select: { id: true, status: true }
    });
    
    if (usedDelivery) {
      const err = new Error('Este código de depósito já foi utilizado. A encomenda está pronta para retirada.');
      err.statusCode = 400;
      throw err;
    } else {
      const err = new Error('Código de depósito inválido');
      err.statusCode = 400;
      throw err;
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.entrega.update({
      where: { id: delivery.id },
      data: {
        status: 'PRONTO_PARA_RETIRADA',
        dataDeposito: new Date()
      }
    });

    await tx.compartimento.update({
      where: { id: delivery.compartimentoId },
      data: { status: 'OCUPADO' }
    });

    return updatedDelivery;
  });

  // Enviar notificações após depósito (e-mail + WhatsApp)
  // dataNotificacao só é marcado se ao menos um canal for bem-sucedido
  let notificado = false;

  try {
    await sendPickupCodeEmail({
      to: delivery.emailDestinatario,
      recipientName: delivery.nomeDestinatario,
      recipientEmail: delivery.emailDestinatario,
      telefoneDestinatario: delivery.telefoneDestinatario || '',
      numeroPedido: delivery.numeroPedido || '',
      lockerLocation: delivery.Armario.localizacao,
      compartmentNumber: delivery.Compartimento.numero,
      pickupCode: delivery.codigoRetirada,
      description: delivery.descricao,
      senderEmail: delivery.emailRemetente
    });
    console.log('✅ E-mail enviado para:', delivery.emailDestinatario);
    notificado = true;
  } catch (emailError) {
    console.error('❌ Erro ao enviar e-mail de depósito:', emailError.message);
  }

  if (delivery.telefoneDestinatario) {
    try {
      await sendPickupCodeWhatsapp({
        phone: delivery.telefoneDestinatario,
        recipientName: delivery.nomeDestinatario,
        pickupCode: delivery.codigoRetirada,
        lockerLocation: delivery.Armario.localizacao,
        compartmentNumber: delivery.Compartimento.numero,
        description: delivery.descricao,
      });
      notificado = true;
    } catch (waError) {
      console.error('❌ Erro ao enviar WhatsApp de depósito:', waError.message);
    }
  }

  if (notificado) {
    await prisma.entrega.update({
      where: { id: delivery.id },
      data: { dataNotificacao: new Date() }
    });
  }

  return { 
    delivery: result, 
    codigoRetirada: delivery.codigoRetirada,
    Armario: delivery.Armario,
    Compartimento: delivery.Compartimento
  };
}

async function pickupByCode({ code, ipAddress }) {
  const delivery = await prisma.entrega.findFirst({
    where: {
      codigoRetirada: code,
      status: 'PRONTO_PARA_RETIRADA'
    },
    include: {
      Armario: true,
      Compartimento: true
    }
  });

  if (!delivery) {
    const err = new Error('Código inválido');
    err.statusCode = 400;
    throw err;
  }

  // Verificar se o e-mail foi enviado antes de permitir retirada
  if (!delivery.dataNotificacao) {
    const err = new Error('Retirada não permitida. O e-mail com o código de retirada ainda não foi enviado. Tente novamente em alguns minutos.');
    err.statusCode = 400;
    throw err;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedDelivery = await tx.entrega.update({
      where: { id: delivery.id },
      data: {
        status: 'RETIRADO',
        dataRetirada: new Date()
      },
      include: {
        Armario: true,
        Compartimento: true
      }
    });

    await tx.compartimento.update({
      where: { id: delivery.compartimentoId },
      data: { status: 'DISPONIVEL' }
    });

    await tx.retiradaLog.create({
      data: {
        id: crypto.randomUUID(),
        entregaId: delivery.id,
        enderecoIP: ipAddress || null
      }
    });

    return updatedDelivery;
  });

  // Confirmações de retirada: e-mail + WhatsApp para destinatário (e e-mail para remetente)
  const { sendPickupConfirmationEmail } = require('./emailService');
  const confirmPayload = {
    lockerLocation: delivery.Armario.localizacao,
    compartmentNumber: delivery.Compartimento.numero,
    description: delivery.descricao,
    pickupTime: new Date().toLocaleString('pt-BR'),
    senderEmail: delivery.emailRemetente,
  };

  // E-mail para destinatário
  try {
    await sendPickupConfirmationEmail({ to: delivery.emailDestinatario, recipientName: delivery.nomeDestinatario, ...confirmPayload });
    console.log('📧 Confirmação enviada por e-mail para:', delivery.emailDestinatario);
  } catch (e) {
    console.error('❌ Erro e-mail confirmação (destinatário):', e.message);
  }

  // WhatsApp para destinatário
  if (delivery.telefoneDestinatario) {
    try {
      await sendPickupConfirmationWhatsapp({
        phone: delivery.telefoneDestinatario,
        recipientName: delivery.nomeDestinatario,
        lockerLocation: delivery.Armario.localizacao,
        compartmentNumber: delivery.Compartimento.numero,
      });
      console.log('📱 Confirmação enviada por WhatsApp para:', delivery.telefoneDestinatario);
    } catch (e) {
      console.error('❌ Erro WhatsApp confirmação:', e.message);
    }
  }

  // E-mail para remetente (se informado)
  if (delivery.emailRemetente) {
    try {
      await sendPickupConfirmationEmail({ to: delivery.emailRemetente, recipientName: delivery.nomeDestinatario, ...confirmPayload });
      console.log('📧 Confirmação enviada por e-mail para remetente:', delivery.emailRemetente);
    } catch (e) {
      console.error('❌ Erro e-mail confirmação (remetente):', e.message);
    }
  }

  return result;
}

module.exports = { generateDepositCode, depositByCode, pickupByCode };
