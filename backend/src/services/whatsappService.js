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

function headers() {
  return {
    'Authorization': `Bearer ${SURI_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Busca contato pelo telefone. Retorna o userId interno do Suri.
 * Se não encontrar, cria o contato.
 */
async function getOrCreateContact(phone, name) {
  const normalizedPhone = normalizePhone(phone);

  // Tentar buscar contato existente
  const searchRes = await fetch(
    `${SURI_URL}/api/contacts?phone=${normalizedPhone}&channelId=${SURI_CHANNEL}`,
    { headers: headers() }
  );

  if (searchRes.ok) {
    const data = await searchRes.json();
    const contact = data?.data?.[0] || data?.data || null;
    if (contact?.id) {
      return contact.id;
    }
  }

  // Contato não encontrado — criar
  const createRes = await fetch(`${SURI_URL}/api/contacts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      phone: normalizedPhone,
      channelId: SURI_CHANNEL,
      name: name || normalizedPhone,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Suri criar contato ${createRes.status}: ${err}`);
  }

  const created = await createRes.json();
  const userId = created?.data?.id || created?.id;
  if (!userId) throw new Error('Suri: contato criado mas ID não retornado');
  return userId;
}

/**
 * Envia mensagem de texto para um userId Suri.
 */
async function sendText(userId, text) {
  const res = await fetch(`${SURI_URL}/api/messages/send`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      userId,
      message: { text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Suri enviar mensagem ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Pipeline completo: normaliza telefone → busca/cria contato → envia mensagem.
 */
async function sendWhatsapp(phone, name, text) {
  if (!isConfigured()) {
    console.log('⚠️  WhatsApp (Suri) não configurado — pulando envio');
    return null;
  }

  const userId = await getOrCreateContact(phone, name);
  return sendText(userId, text);
}

// ─── Mensagens ────────────────────────────────────────────────────────────────

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
  const result = await sendWhatsapp(phone, recipientName, message);
  console.log('✅ WhatsApp (código retirada) enviado com sucesso');
  return result;
}

async function sendPickupConfirmationWhatsapp({ phone, recipientName }) {
  const message =
`Olá, *${recipientName}*!

Seu pedido foi retirado com sucesso. ✅

A Dispetral agradece pela preferência!

*Dispetral:* Trabalhando junto com você para o desenvolvimento do país.`;

  console.log(`📱 Enviando WhatsApp (confirmação retirada) para: ${phone}`);
  const result = await sendWhatsapp(phone, recipientName, message);
  console.log('✅ WhatsApp (confirmação retirada) enviado com sucesso');
  return result;
}

module.exports = { sendPickupCodeWhatsapp, sendPickupConfirmationWhatsapp };
