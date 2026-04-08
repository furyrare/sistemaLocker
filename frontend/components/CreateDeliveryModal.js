'use client';

import { useState } from 'react';

export default function CreateDeliveryModal({ isOpen, onClose, onSubmit, lockers }) {
  const [formData, setFormData] = useState({
    nomeDestinatario: '',
    emailDestinatario: '',
    emailRemetente: '',
    lockerId: '',
    descricao: '',
    size: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const result = await onSubmit(formData);
      
      // Mostrar mensagem sobre a caixa escolhida
      if (result.mensagem) {
        alert(result.mensagem);
      }
      
      // Reset form
      setFormData({
        nomeDestinatario: '',
        emailDestinatario: '',
        emailRemetente: '',
        lockerId: '',
        descricao: '',
        size: ''
      });
      onClose();
    } catch (error) {
      console.error('Erro ao criar entrega:', error);
      alert(error.message || 'Erro ao criar encomenda');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center" style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      width: '100vw',
      height: '100vh',
      zIndex: 2147483647,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{zIndex: 2147483648}}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Criar Nova Encomenda</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Destinatário
            </label>
            <input
              type="text"
              name="nomeDestinatario"
              value={formData.nomeDestinatario}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email do Destinatário
            </label>
            <input
              type="email"
              name="emailDestinatario"
              value={formData.emailDestinatario}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="joao@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email do Remetente (opcional)
            </label>
            <input
              type="email"
              name="emailRemetente"
              value={formData.emailRemetente}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="remetente@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Locker
            </label>
            <select
              name="lockerId"
              value={formData.lockerId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione um locker</option>
              {lockers.map((locker) => (
                <option key={locker.id} value={locker.id}>
                  {locker.name} - {locker.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição da Encomenda
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descreva o conteúdo da encomenda..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho (opcional)
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Automático</option>
              <option value="SMALL">Pequeno</option>
              <option value="MEDIUM">Médio</option>
              <option value="LARGE">Grande</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Criando...' : 'Criar Encomenda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
