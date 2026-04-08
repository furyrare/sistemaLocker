'use client';

import { useState, useEffect } from 'react';

export default function AddLockerModal({ isOpen, onClose, onSubmit, editingLocker }) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    compartments: [
      { number: 1, size: 'UNICO' },
      { number: 2, size: 'UNICO' },
      { number: 3, size: 'UNICO' },
      { number: 4, size: 'UNICO' },
      { number: 5, size: 'UNICO' },
      { number: 6, size: 'UNICO' },
      { number: 7, size: 'UNICO' },
      { number: 8, size: 'UNICO' },
      { number: 9, size: 'UNICO' },
      { number: 10, size: 'UNICO' },
      { number: 11, size: 'UNICO' },
      { number: 12, size: 'UNICO' }
    ]
  });

  useEffect(() => {
    if (editingLocker) {
      setFormData({
        name: editingLocker.nome || '',
        location: editingLocker.localizacao || '',
        compartments: editingLocker.Compartimento || [
          { number: 1, size: 'UNICO' },
          { number: 2, size: 'UNICO' },
          { number: 3, size: 'UNICO' },
          { number: 4, size: 'UNICO' },
          { number: 5, size: 'UNICO' },
          { number: 6, size: 'UNICO' },
          { number: 7, size: 'UNICO' },
          { number: 8, size: 'UNICO' },
          { number: 9, size: 'UNICO' },
          { number: 10, size: 'UNICO' },
          { number: 11, size: 'UNICO' },
          { number: 12, size: 'UNICO' }
        ]
      });
    } else {
      setFormData({
        name: '',
        location: '',
        compartments: [
          { number: 1, size: 'UNICO' },
          { number: 2, size: 'UNICO' },
          { number: 3, size: 'UNICO' },
          { number: 4, size: 'UNICO' },
          { number: 5, size: 'UNICO' },
          { number: 6, size: 'UNICO' },
          { number: 7, size: 'UNICO' },
          { number: 8, size: 'UNICO' },
          { number: 9, size: 'UNICO' },
          { number: 10, size: 'UNICO' },
          { number: 11, size: 'UNICO' },
          { number: 12, size: 'UNICO' }
        ]
      });
    }
  }, [editingLocker]);

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompartmentChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      compartments: prev.compartments.map((comp, i) => 
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const addCompartment = () => {
    const newNumber = formData.compartments.length + 1;
    setFormData(prev => ({
      ...prev,
      compartments: [...prev.compartments, { number: newNumber, size: 'UNICO' }]
    }));
  };

  const removeCompartment = (index) => {
    if (formData.compartments.length <= 1) return;
    
    setFormData(prev => ({
      ...prev,
      compartments: prev.compartments
        .filter((_, i) => i !== index)
        .map((comp, i) => ({ ...comp, number: i + 1 }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Incluir o ID quando estiver editando
    const submitData = editingLocker ? { ...formData, id: editingLocker.id } : formData;
    
    console.log('🔍 DEBUG - FormData sendo enviado:', submitData);
    console.log('🔍 DEBUG - Nome:', submitData.name);
    console.log('🔍 DEBUG - Location:', submitData.location);
    console.log('🔍 DEBUG - Compartimentos:', submitData.compartments);
    
    try {
      await onSubmit(submitData);
      console.log('✅ Locker criado/atualizado com sucesso');
      // Reset form
      setFormData({
        name: '',
        location: '',
        compartments: [
          { number: 1, size: 'UNICO' },
          { number: 2, size: 'UNICO' },
          { number: 3, size: 'UNICO' },
          { number: 4, size: 'UNICO' },
          { number: 5, size: 'UNICO' },
          { number: 6, size: 'UNICO' },
          { number: 7, size: 'UNICO' },
          { number: 8, size: 'UNICO' },
          { number: 9, size: 'UNICO' },
          { number: 10, size: 'UNICO' },
          { number: 11, size: 'UNICO' },
          { number: 12, size: 'UNICO' }
        ]
      });
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar locker:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Criar elemento DOM diretamente como o ConfirmModal
      const modalOverlay = document.createElement('div');
      modalOverlay.id = 'add-locker-modal-overlay';
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
        width: 100% !important;
        max-width: 1024px !important;
        max-height: 90vh !important;
        overflow-y: auto !important;
        margin: 16px !important;
      `;

      // Função para atualizar o conteúdo do modal
      const updateModalContent = () => {
        modalContent.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0;">
              ${editingLocker ? 'Editar Locker' : 'Adicionar Locker'}
            </h2>
            <button id="close-modal-btn" style="background: none; border: none; color: #9ca3af; font-size: 24px; cursor: pointer; line-height: 1;">
              ×
            </button>
          </div>
          <form id="locker-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  Nome do Locker
                </label>
                <input type="text" name="name" value="${formData.name || ''}" required 
                  style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
                  placeholder="Ex: Locker Principal">
              </div>
              <div>
                <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                  Localização
                </label>
                <input type="text" name="location" value="${formData.location || ''}" required
                  style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"
                  placeholder="Ex: Recepção">
              </div>
            </div>
            
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 8px;">
                Quantidade de Caixas
              </label>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
                  <span style="font-size: 24px; font-weight: 600; color: #111827; min-width: 48px; text-align: center;">
                    ${formData.compartments.length}
                  </span>
                  <span style="font-size: 14px; color: #6b7280;">caixas</span>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button type="button" class="add-caixas" data-amount="2"
                    style="padding: 8px 12px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                    +2
                  </button>
                  <button type="button" class="add-caixas" data-amount="4"
                    style="padding: 8px 12px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                    +4
                  </button>
                  <button type="button" class="add-caixas" data-amount="6"
                    style="padding: 8px 12px; border: 1px solid #3b82f6; background: white; color: #3b82f6; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                    +6
                  </button>
                </div>
              </div>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <button type="button" id="remove-caixa" 
                  style="padding: 6px 12px; border: 1px solid #ef4444; background: white; color: #ef4444; border-radius: 6px; font-size: 13px; cursor: pointer; ${formData.compartments.length <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                  -1 Caixa
                </button>
                <button type="button" id="reset-caixas" 
                  style="padding: 6px 12px; border: 1px solid #6b7280; background: white; color: #6b7280; border-radius: 6px; font-size: 13px; cursor: pointer;">
                  Resetar para 12
                </button>
              </div>
            </div>
            
            <div style="display: flex; gap: 8px;">
              <button type="button" id="cancel-btn" 
                style="flex: 1; padding: 8px 16px; border: 1px solid #d1d5db; background: white; color: #374151; border-radius: 8px; cursor: pointer;">
                Cancelar
              </button>
              <button type="submit" 
                style="flex: 1; padding: 8px 16px; border: none; background: #2563eb; color: white; border-radius: 8px; cursor: pointer;">
                ${editingLocker ? 'Atualizar' : 'Adicionar'}
              </button>
            </div>
          </form>
        `;
        
        // Re-adicionar event listeners após atualizar o HTML
        setupEventListeners();
      };

      // Função para configurar os event listeners
      const setupEventListeners = () => {
        const closeBtn = modalContent.querySelector('#close-modal-btn');
        const cancelBtn = modalContent.querySelector('#cancel-btn');
        const removeCaixaBtn = modalContent.querySelector('#remove-caixa');
        const resetCaixasBtn = modalContent.querySelector('#reset-caixas');
        const addCaixasBtns = modalContent.querySelectorAll('.add-caixas');
        const form = modalContent.querySelector('#locker-form');
        const nameInput = modalContent.querySelector('input[name="name"]');
        const locationInput = modalContent.querySelector('input[name="location"]');

        const closeModal = () => {
          document.body.removeChild(modalOverlay);
          onClose();
        };

        // Remover listeners antigos
        if (closeBtn) closeBtn.replaceWith(closeBtn.cloneNode(true));
        if (cancelBtn) cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        
        // Re-obter elementos após clonar
        const newCloseBtn = modalContent.querySelector('#close-modal-btn');
        const newCancelBtn = modalContent.querySelector('#cancel-btn');
        const newNameInput = modalContent.querySelector('input[name="name"]');
        const newLocationInput = modalContent.querySelector('input[name="location"]');

        if (newCloseBtn) newCloseBtn.addEventListener('click', closeModal);
        if (newCancelBtn) newCancelBtn.addEventListener('click', closeModal);
        
        // Atualizar valores diretamente sem clonar os inputs
        if (newNameInput) {
          newNameInput.value = formData.name || '';
          newNameInput.addEventListener('input', (e) => {
            setFormData(prev => ({ ...prev, name: e.target.value }));
          });
        }
        
        if (newLocationInput) {
          newLocationInput.value = formData.location || '';
          newLocationInput.addEventListener('input', (e) => {
            setFormData(prev => ({ ...prev, location: e.target.value }));
          });
        }

        // Handle add caixas buttons
        addCaixasBtns.forEach(button => {
          button.addEventListener('click', (e) => {
            const amount = parseInt(e.target.dataset.amount);
            const newCount = formData.compartments.length + amount;
            const newCompartments = Array.from({ length: newCount }, (_, i) => ({
              number: i + 1,
              size: 'UNICO'
            }));
            setFormData(prev => ({ ...prev, compartments: newCompartments }));
          });
        });

        // Handle remove caixa
        if (removeCaixaBtn) {
          removeCaixaBtn.addEventListener('click', () => {
            if (formData.compartments.length > 1) {
              const newCompartments = formData.compartments.slice(0, -1);
              setFormData(prev => ({ ...prev, compartments: newCompartments }));
            }
          });
        }

        // Handle reset caixas
        if (resetCaixasBtn) {
          resetCaixasBtn.addEventListener('click', () => {
            const defaultCompartments = Array.from({ length: 12 }, (_, i) => ({
              number: i + 1,
              size: 'UNICO'
            }));
            setFormData(prev => ({ ...prev, compartments: defaultCompartments }));
          });
        }

        if (form) {
          form.addEventListener('submit', (e) => {
            e.preventDefault();
            closeModal();
            handleSubmit(e);
          });
        }
      };

      // Função para atualizar apenas os valores dos inputs sem recriar o modal
      const updateInputValues = () => {
        const nameInput = modalContent.querySelector('input[name="name"]');
        const locationInput = modalContent.querySelector('input[name="location"]');
        
        if (nameInput && nameInput.value !== (formData.name || '')) {
          nameInput.value = formData.name || '';
        }
        if (locationInput && locationInput.value !== (formData.location || '')) {
          locationInput.value = formData.location || '';
        }
      };

      // Watch for formData changes and update only input values
      const updateInterval = setInterval(() => {
        if (document.body.contains(modalOverlay)) {
          updateInputValues();
        } else {
          clearInterval(updateInterval);
        }
      }, 50); // Intervalo menor para melhor responsividade

      // Inicializar o conteúdo
      updateModalContent();
      modalOverlay.appendChild(modalContent);
      document.body.appendChild(modalOverlay);

      // Cleanup
      return () => {
        clearInterval(updateInterval);
        if (document.body.contains(modalOverlay)) {
          document.body.removeChild(modalOverlay);
        }
      };
    }
  }, [isOpen, editingLocker]); // Removido formData para evitar recriação ao digitar

  if (!isOpen) return null;
  return null;
}
