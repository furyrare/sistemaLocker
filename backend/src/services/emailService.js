require('dotenv').config();
const nodemailer = require('nodemailer');
const { emailTemplate, replaceVariables } = require('../../templates/emailTemplate');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const sslEnabled = process.env.SSL_ENABLED === 'true';

  if (!host || !user || !pass) {
    console.log('E-mail não enviado: SMTP não configurado');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false, // Para Gmail com porta 587, secure deve ser false
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // Para evitar problemas de certificado
    }
  });
}

async function sendPickupCodeEmail({ to, recipientName, recipientEmail, lockerLocation, compartmentNumber, pickupCode, description, senderEmail }) {
  console.log('📧 Enviando e-mail para:', to);
  
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter) {
    console.log('❌ E-mail não enviado: SMTP não configurado');
    return;
  }

  const template = emailTemplate({
    type: 'pickup',
    recipientName,
    recipientEmail,
    lockerLocation, // Removido lockerName, mantido apenas lockerLocation
    compartmentNumber,
    pickupCode,
    description,
    senderEmail
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Código de Retirada - Dispetral',
      html: template.html,
      text: template.text
    });
    console.log('✅ E-mail de código de retirada enviado para:', to);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    throw error;
  }
}

async function sendPickupConfirmationEmail({ to, recipientName, lockerLocation, compartmentNumber, description, pickupTime, senderEmail }) {
  console.log('📧 Enviando e-mail de confirmação para:', to);
  
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter) {
    console.log('❌ E-mail não enviado: SMTP não configurado');
    return;
  }

  const template = emailTemplate({
    type: 'pickup_confirmation',
    recipientName,
    lockerLocation, // Usar lockerLocation em vez de lockerName
    compartmentNumber,
    description,
    pickupTime,
    senderEmail
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Retirada Confirmada - Dispetral',
      html: template.html,
      text: template.text
    });
    console.log('✅ E-mail de confirmação de retirada enviado para:', to);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de confirmação:', error);
    throw error;
  }
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  if (!transporter) {
    console.log('E-mail não enviado: SMTP não configurado');
    return;
  }

  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text
    });
    console.log('E-mail enviado com sucesso para:', to);
    return result;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
}

module.exports = { sendPickupCodeEmail, sendPickupConfirmationEmail, sendEmail };
