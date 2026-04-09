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
      { number:7, size: 'UNICO' },
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

  const addCompartments = (amount) => {
    const newCount = formData.compartments.length + amount;
    const newCompartments = Array.from({ length: newCount }, (_, i) => ({
      number: i + 1,
      size: 'UNICO'
    }));
    setFormData(prev => ({ ...prev, compartments: newCompartments }));
  };

  const removeCompartment = () => {
    if (formData.compartments.length <= 1) return;
    
    const newCompartments = formData.compartments
      .slice(0, -1)
      .map((comp, i) => ({ ...comp, number: i + 1 }));
    
    setFormData(prev => ({ ...prev, compartments: newCompartments }));
  };

  const resetCompartments = () => {
    const defaultCompartments = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      size: 'UNICO'
    }));
    setFormData(prev => ({ ...prev, compartments: defaultCompartments }));
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
      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar locker:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingLocker ? 'Editar Locker' : 'Adicionar Locker'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Locker
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ex: Locker Principal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Localização
              </label>
              <input 
                type="text" 
                name="location" 
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Ex: Recepção"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade de Caixas
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                <span className="text-2xl font-semibold text-gray-900 min-w-[48px] text-center">
                  {formData.compartments.length}
                </span>
                <span className="text-sm text-gray-600">caixas</span>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => addCompartments(2)}
                  className="px-3 py-2 border border-blue-500 bg-white text-blue-500 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  +2
                </button>
                <button 
                  type="button"
                  onClick={() => addCompartments(4)}
                  className="px-3 py-2 border border-blue-500 bg-white text-blue-500 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  +4
                </button>
                <button 
                  type="button"
                  onClick={() => addCompartments(6)}
                  className="px-3 py-2 border border-blue-500 bg-white text-blue-500 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  +6
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                type="button" 
                onClick={removeCompartment}
                disabled={formData.compartments.length <= 1}
                className="px-3 py-1 border border-red-500 bg-white text-red-500 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
              >
                -1 Caixa
              </button>
              <button 
                type="button" 
                onClick={resetCompartments}
                className="px-3 py-1 border border-gray-500 bg-white text-gray-500 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Resetar para 12
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="flex-1 px-4 py-2 border-0 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Salvando...' : (editingLocker ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
