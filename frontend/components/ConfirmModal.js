'use client';

import { useEffect } from 'react';

export default function ConfirmModalUltimate({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) {
  useEffect(() => {
    if (isOpen) {
      // Criar elemento DOM diretamente
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'modal-ultimate-overlay';
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
        border-radius: 8px !important;
        padding: 24px !important;
        max-width: 448px !important;
        width: 100% !important;
        margin: 16px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
      `;

      modalContent.innerHTML = `
        <div style="text-align: center;">
          <div style="margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background-color: #fef3c7;">
            <svg style="width: 24px; height: 24px; color: #d97706;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">${title}</h3>
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">${message}</p>
          <div style="display: flex; gap: 12px;">
            <button id="modal-cancel" style="flex: 1; padding: 8px 16px; background: #f3f4f6; color: #374151; border-radius: 8px; border: none; cursor: pointer; font-weight: 500;">${cancelText}</button>
            <button id="modal-confirm" style="flex: 1; padding: 8px 16px; background: #dc2626; color: white; border-radius: 8px; border: none; cursor: pointer; font-weight: 500;">${confirmText}</button>
          </div>
        </div>
      `;

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
      const handleCancel = () => {
        cleanup();
        onClose();
      };

      const handleConfirm = () => {
        cleanup();
        onConfirm();
      };

      const handleOverlayClick = (e) => {
        if (e.target === modalOverlay) {
          cleanup();
          onClose();
        }
      };

      document.getElementById('modal-cancel').addEventListener('click', handleCancel);
      document.getElementById('modal-confirm').addEventListener('click', handleConfirm);
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
  }, [isOpen, onClose, onConfirm, title, message, confirmText, cancelText]);

  return null;
}
