require('dotenv').config();

const SURI_URL     = process.env.SURI_URL;
const SURI_TOKEN   = process.env.SURI_TOKEN;
const SURI_CHANNEL = process.env.SURI_CHANNEL_ID;

function isConfigured() {
  return SURI_URL && SURI_TOKEN && SURI_CHANNEL;
}

function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}

async function sendText(phone, text) {
  if (!isConfigured()) {
    console.log('⚠️  WhatsApp (Suri) não configurado — pulando envio');
    return null;
  }

  const body = {
    phone: normalizePhone(phone),
    channelId: SURI_CHANNEL,
    message: text,
  };

  const res = await fetch(`${SURI_URL}/api/contacts/send-message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SURI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const responseText = await res.text();
    throw new Error(`Suri API ${res.status}: ${responseText}`);
  }

  return res.json();
}

/**
 * Envia código de retirada via WhatsApp após depósito.
 * Mesmo conteúdo do e-mail em formato texto.
 */
async function sendPickupCodeWhatsapp({ phone, recipientName, pickupCode, lockerLocation, compartmentNumber, description }) {
  const message =
`Olá, *${recipientName}*!

Seu pedido está disponível para retirada na Dispetral! Dirija-se ao "Retira Rápido" para recebê-lo. Estamos localizados na *${lockerLocation}*.

Para retirar, siga os passos abaixo:
1️⃣ Abra o portão inicial com a senha: *${description}*
2️⃣ Vá ao tablet e digite o pin: *${pickupCode}*
3️⃣ Pronto! Colete seu pedido e feche a porta do armário.

Para sua comodidade você pode buscar a encomenda a qualquer momento, pois o "Retira Rápido" funciona 24 horas por dia!

Ao concluir o processo, você receberá uma mensagem avisando que seu pedido foi retirado!

*Dispetral:* Trabalhando junto com você para o desenvolvimento do país.`;

  console.log(`📱 Enviando WhatsApp (código retirada) para: ${phone}`);
  try {
    const result = await sendText(phone, message);
    console.log('✅ WhatsApp (código retirada) enviado com sucesso');
    return result;
  } catch (err) {
    console.error('❌ Erro ao enviar WhatsApp (código retirada):', err.message);
    throw err;
  }
}

/**
 * Envia confirmação de retirada via WhatsApp.
 * Mesmo conteúdo do e-mail em formato texto.
 */
async function sendPickupConfirmationWhatsapp({ phone, recipientName }) {
  const message =
`Olá, *${recipientName}*!

Seu pedido foi retirado com sucesso. ✅

A Dispetral agradece pela preferência!

*Dispetral:* Trabalhando junto com você para o desenvolvimento do país.`;

  console.log(`📱 Enviando WhatsApp (confirmação retirada) para: ${phone}`);
  try {
    const result = await sendText(phone, message);
    console.log('✅ WhatsApp (confirmação retirada) enviado com sucesso');
    return result;
  } catch (err) {
    console.error('❌ Erro ao enviar WhatsApp (confirmação retirada):', err.message);
    throw err;
  }
}

module.exports = { sendPickupCodeWhatsapp, sendPickupConfirmationWhatsapp };
