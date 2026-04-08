'use client';

import { useEffect } from 'react';

export default function DetailsModalUltimate({ 
  isOpen, 
  onClose, 
  pedido 
}) {
  useEffect(() => {
    if (isOpen && pedido) {
      // Criar elemento DOM diretamente
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'details-modal-ultimate-overlay';
      modalOverlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.6) !important;
        z-index: 999999999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        position: relative !important;
        z-index: 1000000000000 !important;
        background: white !important;
        border-radius: 12px !important;
        padding: 16px !important;
        max-width: 400px !important;
        width: 100% !important;
        margin: 16px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
      `;

      modalContent.innerHTML = `
        <div style="padding: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2 style="font-size: 16px; font-weight: bold; color: #111827; margin: 0;">Detalhes do Pedido</h2>
            <button id="details-close" style="background: none; border: none; color: #9ca3af; font-size: 20px; cursor: pointer; padding: 0; line-height: 1;">×</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Códigos -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #1e40af; margin: 0 0 6px 0;">Códigos</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <div style="text-align: center;">
                  <div style="font-size: 10px; color: #2563eb;">Depósito</div>
                  <div style="font-size: 14px; font-weight: bold; color: #1e40af;">${pedido.codigoDeposito || '-'}</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 10px; color: #2563eb;">Retirada</div>
                  <div style="font-size: 14px; font-weight: bold; color: #1e40af;">${pedido.codigoRetirada || '-'}</div>
                </div>
              </div>
            </div>

            <!-- Informações -->
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 6px 0;">Informações</h3>
              <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px;">
                <div><span style="color: #6b7280;">Cliente:</span> <span style="font-weight: 500;">${pedido.delivery?.nomeDestinatario || pedido.nomeDestinatario || '-'}</span></div>
                <div><span style="color: #6b7280;">Email:</span> <span style="font-weight: 500;">${pedido.delivery?.emailDestinatario || pedido.emailDestinatario || '-'}</span></div>
                <div><span style="color: #6b7280;">Telefone:</span> <span style="font-weight: 500;">${pedido.delivery?.telefoneDestinatario || pedido.telefoneDestinatario || '-'}</span></div>
                <div><span style="color: #6b7280;">Pedido:</span> <span style="font-weight: 500;">${pedido.delivery?.numeroPedido || pedido.numeroPedido || '-'}</span></div>
                ${pedido.delivery?.emailRemetente || pedido.emailRemetente ? `<div><span style="color: #6b7280;">Enviado por:</span> <span style="font-weight: 500;">${pedido.delivery?.emailRemetente || pedido.emailRemetente}</span></div>` : ''}
                <div><span style="color: #6b7280;">Locker:</span> <span style="font-weight: 500;">${pedido.Armario?.nome || '-'}</span></div>
                <div><span style="color: #6b7280;">Caixa:</span> <span style="font-weight: 500;">${pedido.Compartimento?.numero || '-'}</span></div>
              </div>
            </div>

            <!-- Descrição -->
            <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #7c3aed; margin: 0 0 3px 0;">Descrição</h3>
              <div style="font-size: 11px; color: #111827;">${pedido.delivery?.descricao || pedido.descricao || 'Sem descrição'}</div>
            </div>

            <!-- Datas -->
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px;">
              <h3 style="font-size: 12px; font-weight: 600; color: #16a34a; margin: 0 0 6px 0;">📅 Registro de Datas</h3>
              <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px;">
                <div><span style="color: #16a34a;">Criado:</span> <span style="font-weight: 500;">${formatDate(pedido.delivery?.dataCriacao || pedido.dataCriacao) || 'Data não disponível'}</span></div>
                <div><span style="color: #16a34a;">Depósito:</span> <span style="font-weight: 500;">${formatDate(pedido.delivery?.dataDeposito || pedido.dataDeposito) || 'Não realizado'}</span></div>
                <div><span style="color: #16a34a;">Retirado:</span> <span style="font-weight: 500;">${formatDate(pedido.delivery?.dataRetirada || pedido.dataRetirada) || 'Não retirado'}</span></div>
                <div><span style="color: #16a34a;">Status:</span> <span style="font-weight: 500; color: #16a34a;">${getStatusText(pedido.delivery?.status || pedido.status)}</span></div>
              </div>
            </div>

            <!-- Botões -->
            <div style="display: flex; gap: 6px; padding-top: 6px;">
              <button id="details-copy" style="flex: 1; padding: 6px 12px; background: #6b7280; color: white; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 11px;">
                📋 Copiar Log
              </button>
              <button id="details-close-btn" style="flex: 1; padding: 6px 12px; background: #3b82f6; color: white; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 11px;">
                Fechar
              </button>
            </div>
          </div>
        </div>
      `;

      // Função para formatar datas
      function formatDate(dateString) {
        if (!dateString) return null;
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return null;
          return date.toLocaleString('pt-BR');
        } catch (e) {
          return null;
        }
      }

      // Função para obter texto do status
      function getStatusText(status) {
        switch(status) {
          case 'PENDENTE_DEPOSITO': return 'Aguardando Depósito';
          case 'PRONTO_PARA_RETIRADA': return 'Pronta para Retirada';
          case 'PICKED_UP':
          case 'RETIRADO': return 'Retirada';
          default: return status;
        }
      }

      // Adicionar ao body
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Forçar header para trás
      const headers = document.querySelectorAll('header');
      headers.forEach(header => {
        header.style.zIndex = '1';
        header.style.position = 'relative';
      });

      // Event listeners
      const handleClose = () => {
        cleanup();
        onClose();
      };

      const handleCopy = () => {
        const logData = `PEDIDO DETALHES\nData: ${new Date(pedido.createdAt).toLocaleString('pt-BR')}\nDepósito: ${pedido.locker?.name}\nRetirado: ${pedido.compartment?.number}\nCliente: ${pedido.recipientName}\nEmail: ${pedido.recipientEmail}\nTelefone: ${pedido.recipientPhone || '-'}\nNúmero Pedido: ${pedido.orderNumber || '-'}\n${pedido.senderEmail ? `Enviado por: ${pedido.senderEmail}\n` : ''}Código Depósito: ${pedido.depositCode}\nCódigo Retirada: ${pedido.pickupCode}\nDescrição: ${pedido.description}\nStatus: ${getStatusText(pedido.status)}\n${pedido.placedAt ? `Data Depósito: ${new Date(pedido.placedAt).toLocaleString('pt-BR')}\n` : ''}${pedido.pickedUpAt ? `Data Retirada: ${new Date(pedido.pickedUpAt).toLocaleString('pt-BR')}` : ''}`;
        navigator.clipboard.writeText(logData);
        alert('Log copiado para a área de transferência!');
      };

      const handleOverlayClick = (e) => {
        if (e.target === modalOverlay) {
          cleanup();
          onClose();
        }
      };

      document.getElementById('details-close').addEventListener('click', handleClose);
      document.getElementById('details-close-btn').addEventListener('click', handleClose);
      document.getElementById('details-copy').addEventListener('click', handleCopy);
      modalOverlay.addEventListener('click', handleOverlayClick);

      // Cleanup function
      const cleanup = () => {
        if (modalOverlay && modalOverlay.parentNode) {
          modalOverlay.parentNode.removeChild(modalOverlay);
        }
        // Restaurar z-index do header
        headers.forEach(header => {
          header.style.zIndex = '';
        });
      };

      // Limpar quando fechar
      return cleanup;
    }
  }, [isOpen, onClose, pedido]);

  return null;
}
