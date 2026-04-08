function emailTemplate({ type, recipientName, recipientEmail, recipientPhone, orderNumber, lockerLocation, compartmentNumber, pickupCode, description, senderEmail, pickupTime }) {
  const now = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (type === 'pickup_confirmation') {
    // Template para o cliente
    const html = `
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Seu Pedido foi Retirado - Dispetral</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .content { padding: 20px; background: #f9fafb; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
    <img src="https://www.dispetral.com.br/storage/app/uploads/public/0fa/981/9c4/thumb__0_70_0_0_auto.png" 
         alt="Logo Dispetral"
         style="max-width: 300px; height: auto; display: block; margin: 0 auto;">    
    </div>
    
    <div class="content">
        <p>Olá, <strong>${recipientName}</strong>!</p>
        <p>Seu pedido foi retirado com sucesso.</p>
        
        <p>A Dispetral agradece pela preferência!</p>
            
        <p><strong>Dispetral:</strong> Trabalhando junto com você para o desenvolvimento do país.</p>
    </div>
    
</body>
</html>`;

    const text = `

Seu pedido foi retirado com sucesso.

A Dispetral agradece pela preferência!

Dispetral: Trabalhando junto com você para o desenvolvimento do país.

`;

    return { html, text };
  }

  if (type === 'pickup_confirmation_sender') {
    // Template para o remetente
    const html = `
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Item Retirado - Dispetral</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .content { padding: 20px; background: #f9fafb; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
    <img src="https://www.dispetral.com.br/storage/app/uploads/public/0fa/981/9c4/thumb__0_70_0_0_auto.png" 
         alt="Logo Dispetral"
         style="max-width: 300px; height: auto; display: block; margin: 0 auto;">    
    </div>
    
    <div class="content">
        <p>Olá, Informamos que o item foi retirado com sucesso pelo destinatário.</p>
        
        <p><strong>📋 Detalhes da retirada:</strong></p>
        <p>Destinatário: ${recipientName}<br>
        <p>Número do pedido: ${orderNumber}</p>
        Data/Hora: ${pickupTime}</p>
        
        <p><strong>Dispetral:</strong> Trabalhando junto com você para o desenvolvimento do país.</p>
    </div>
    
</body>
</html>`;

    const text = `
ITEM RETIRADO - Dispetral

Olá, ${senderEmail || 'Remetente'}!

Informamos que o item foi retirado com sucesso pelo destinatário.

📋 DetALHES DA RETIRADA:
• Destinatário: ${recipientName}
• Número do pedido: ${orderNumber}
• Data/Hora: ${pickupTime}

Dispetral: Trabalhando junto com você para o desenvolvimento do país.

`;

    return { html, text };
  }

  // Template ultra simplificado
  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Retirada - Dispetral</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .content { padding: 20px; background: #f9fafb; border-radius: 10px; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
    <img src="https://www.dispetral.com.br/storage/app/uploads/public/0fa/981/9c4/thumb__0_70_0_0_auto.png" 
         alt="Logo Dispetral"
         style="max-width: 300px; height: auto; display: block; margin: 0 auto;">    
    </div>
    
    <div class="content">
        <p>Olá, <strong>${recipientName}</strong>!</p>
        <p>Seu pedido está disponível para retirada na Dispetral! Dirija-se ao "Retira Rápido" para recebê-lo. Estamos localizados na <strong>${lockerLocation}</strong>.</p>
        
        <p>Para retirar, siga os passos abaixo:</p>
        <ol>
            <li>Abra o portão inicial com a senha: <strong>${description}</strong></li>
            <li>Vá ao tablet e digite o pin: <strong>${pickupCode}</strong></li>
            <li>Pronto! Colete seu pedido e feche a porta do armário.</li>
        </ol>
        
        <p>Para sua comodidade você pode buscar a encomenda a qualquer momento, pois o "Retira Rápido" funciona 24 horas por dia!</p>
        
        <p>Ao concluir o processo, você receberá um e-mail avisando que seu pedido foi retirado!</p>
        
        <p><strong>Dispetral:</strong> Trabalhando junto com você para o desenvolvimento do país.</p>
    </div>
    
</body>
</html>`;

    text = `CÓDIGO DE RETIRADA - Dispetral

Olá, ${recipientName}!

Seu pedido está disponível para retirada na Dispetral! Dirija-se ao "Retira Rápido" para recebê-lo. Estamos localizados na ${lockerLocation}.

Para retirar, siga os passos abaixo:
Abra o portão inicial com a senha: ${description}
Vá ao tablet e digite o pin: ${pickupCode}
Pronto! Colete seu pedido e Feche a porta do armário.

Para sua comodidade você pode buscar a encomenda a qualquer momento, pois o "Retira Rápido" funciona 24 horas por dia!

Ao concluir o processo, você receberá um e-mail avisando que seu pedido foi retirado!

Dispetral: Trabalhando junto com você para o desenvolvimento do país.

`;

  return { html, text };
}

/**
 * Função para substituir variáveis no template
 */
function replaceVariables(template, variables) {
  let result = template;
  
  // Substituir variáveis simples
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key]);
  });
  
  return result;
}

module.exports = { emailTemplate, replaceVariables };
