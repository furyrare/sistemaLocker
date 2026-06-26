'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiDelete } from '../../components/api';
import ConfirmModal from '../../components/ConfirmModal';
import DetailsModalUltimate from '../../components/DetailsModalUltimate';
import { getStatusColor, getStatusText } from '../../lib/utils';

export default function PedidosClient() {
  const [pedidos, setPedidos] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    pedido: null,
    action: ''
  });

  useEffect(() => {
    loadLockers();
  }, []);

  useEffect(() => {
    if (selectedLocker) {
      loadPedidos();
    }
  }, [selectedLocker]);

  async function loadLockers() {
    try {
      setLoading(true);
      const response = await apiGet('/api/lockers-manage');
      const data = response.data || response;
      setLockers(data);
      if (data[0]?.id) {
        setSelectedLocker(data[0].id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPedidos() {
    try {
      setLoading(true);
      const url = selectedLocker ? `/api/deliveries-manage?lockerId=${encodeURIComponent(selectedLocker)}` : '/api/deliveries-manage';
      const data = await apiGet(url);
      setPedidos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getPedidosFiltrados() {
    if (showHistorico) {
      return pedidos.filter(p => p.status === 'RETIRADO');
    } else {
      return pedidos.filter(p => p.status !== 'RETIRADO');
    }
  }

  function openDetailsModal(pedido) {
    setSelectedPedido(pedido);
    setShowDetailsModal(true);
  }

  function handleDeleteClick(pedido) {
    if (pedido.status !== 'PENDENTE_DEPOSITO') {
      alert('Apenas entregas pendentes de depósito podem ser deletadas');
      return;
    }
    
    setConfirmModal({
      isOpen: true,
      pedido,
      action: 'delete'
    });
  }

  async function confirmDelete() {
    const { pedido } = confirmModal;
    
    try {
      setDeleting(pedido.id);
      await apiDelete(`/api/deliveries-manage/${pedido.id}`);
      
      // Recarregar lista
      await loadPedidos();
      
      setConfirmModal({ isOpen: false, pedido: null, action: '' });
    } catch (error) {
      console.error('Erro ao deletar entrega:', error);
      alert('Erro ao deletar entrega: ' + error.message);
    } finally {
      setDeleting(null);
    }
  }

  function closeModal() {
    setConfirmModal({ isOpen: false, pedido: null, action: '' });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Locker e Botões de filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Locker:</label>
          <select
            value={selectedLocker}
            onChange={(e) => setSelectedLocker(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {lockers.map((locker) => (
              <option key={locker.id} value={locker.id}>
                {locker.nome}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistorico(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showHistorico 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pedidos Ativos
          </button>
          <button
            onClick={() => setShowHistorico(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showHistorico 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Histórico
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {getPedidosFiltrados().length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-600">
            {showHistorico ? 'Nenhum pedido no histórico.' : 'Nenhum pedido ativo encontrado.'}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Locker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Caixa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Códigos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Detalhes</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getPedidosFiltrados().map((pedido) => (
                <tr key={pedido.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    {new Date(pedido.dataCriacao).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {pedido.nomeDestinatario}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {pedido.emailDestinatario}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {pedido.Armario?.nome}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {pedido.Compartimento?.numero}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="space-y-1">
                      {pedido.codigoDeposito && (
                        <div>
                          <span className="font-medium">Depósito:</span>
                          <span className="ml-1 font-mono">{pedido.codigoDeposito}</span>
                        </div>
                      )}
                      {pedido.codigoRetirada && (
                        <div>
                          <span className="font-medium">Retirada:</span>
                          <span className="ml-1 font-mono">{pedido.codigoRetirada}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pedido.status)}`}>
                      {getStatusText(pedido.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDetailsModal(pedido)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      title="Ver detalhes"
                    >
                      🔍
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {pedido.status === 'PENDENTE_DEPOSITO' ? (
                      <button
                        onClick={() => handleDeleteClick(pedido)}
                        disabled={deleting === pedido.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                        title="Apagar pedido"
                      >
                        {deleting === pedido.id ? 'Apagando...' : '🗑️'}
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs" title="Não pode apagar">
                        -
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Detalhes do Pedido - Ultimate */}
      <DetailsModalUltimate
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        pedido={selectedPedido}
      />

      {/* Modal de Confirmação para Apagar */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Tem certeza que deseja apagar?"
        message={`Deseja apagar o pedido de ${confirmModal.pedido?.nomeDestinatario || 'cliente desconhecido'}? Esta ação não pode ser desfeita.`}
        confirmText="Apagar"
        cancelText="Cancelar"
      />
    </div>
  );
}
