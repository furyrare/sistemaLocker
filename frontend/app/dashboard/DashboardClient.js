'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../components/api';
import ConfirmModal from '../../components/ConfirmModal';

export default function DashboardClient() {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [compartments, setCompartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    compartment: null,
    action: ''
  });

  useEffect(() => {
    loadLockers();
  }, []);

  useEffect(() => {
    if (selectedLocker) {
      loadCompartments();
    }
  }, [selectedLocker]);

  // Recarregar dados quando a página ganha foco (usuário volta para a aba)
  useEffect(() => {
    const handleFocus = () => {
      if (selectedLocker) {
        console.log('Página ganhou foco, recarregando compartimentos...');
        loadCompartments();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedLocker]);

  async function loadLockers() {
    try {
      console.log(' Carregando lockers...');
      const response = await apiGet('/api/lockers-manage');
      const data = response.data || response;
      console.log(' Dados recebidos:', data);
      setLockers(data);
      if (data[0]?.id) {
        setSelectedLocker(data[0].id);
        console.log(' Locker selecionado:', data[0].id);
      }
    } catch (e) {
      console.error(' Erro ao carregar lockers:', e);
      setError(e.message);
    }
  }

  async function loadCompartments() {
    setLoading(true);
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      const url = `/api/dashboard/grid?lockerId=${encodeURIComponent(selectedLocker)}&t=${timestamp}&force=${Math.random()}`;
      
      const data = await apiGet(url);
      
      setCompartments(data);
    } catch (e) {
      console.error('Erro no loadCompartments:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carregar detalhes das entregas para compartimentos reservados/ocupados
    const loadDetails = async () => {
      const deliveries = await apiGet('/api/deliveries-list');
      
      const updatedCompartments = compartments.map(compartment => {
        if (compartment.status === 'RESERVED' || compartment.status === 'OCCUPIED') {
          const delivery = deliveries.find(d => d.compartimentoId === compartment.id);
          if (delivery) {
            return {
              ...compartment,
              deliveryDetails: delivery
            };
          }
        }
        return compartment;
      });
      
      setCompartments(updatedCompartments);
    };
    
    if (compartments.length > 0) {
      loadDetails();
    }
  }, [selectedLocker]); // Apenas selectedLocker como dependência

  function getStatusColor(status) {
    switch (status) {
      case 'DISPONIVEL': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BLOQUEADO': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'DISPONIVEL': return '🔓';
      case 'RESERVED': return '⏳';
      case 'OCCUPIED': return '📦';
      case 'BLOQUEADO': return '🔒';
      default: return '❓';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'DISPONIVEL': return 'Disponível';
      case 'RESERVED': return 'Reservada';
      case 'OCCUPIED': return 'Ocupada';
      case 'BLOQUEADO': return 'Bloqueada';
      default: return status;
    }
  }

  // Função para obter o status real com base nas entregas
  function getRealStatus(compartment) {
    // Se o status do banco é BLOQUEADO, mantém BLOQUEADO
    if (compartment.status === 'BLOQUEADO') {
      // Verificar se há entregas ativas (PENDENTE_DEPOSITO ou PRONTO_PARA_RETIRADA)
      if (compartment.Entrega && compartment.Entrega.length > 0) {
        const activeDelivery = compartment.Entrega.find(d => 
          d.status === 'PENDENTE_DEPOSITO' || d.status === 'PRONTO_PARA_RETIRADA'
        );
        
        if (activeDelivery) {
          if (activeDelivery.status === 'PRONTO_PARA_RETIRADA') return 'OCCUPIED';
          if (activeDelivery.status === 'PENDENTE_DEPOSITO') return 'RESERVED';
        }
      }
      // Se não há entregas ativas, mantém BLOQUEADO (não muda para DISPONIVEL)
      return 'BLOQUEADO';
    }
    
    // Verificar todas as entregas, não apenas a primeira
    if (compartment.Entrega && compartment.Entrega.length > 0) {
      // Verificar se há alguma entrega ativa (PENDENTE_DEPOSITO ou PRONTO_PARA_RETIRADA)
      const activeDelivery = compartment.Entrega.find(d => 
        d.status === 'PENDENTE_DEPOSITO' || d.status === 'PRONTO_PARA_RETIRADA'
      );
      
      if (activeDelivery) {
        if (activeDelivery.status === 'PRONTO_PARA_RETIRADA') return 'OCCUPIED';
        if (activeDelivery.status === 'PENDENTE_DEPOSITO') return 'RESERVED';
      }
      
      // Se só tiver entregas RETIRADO, considera disponível
      const hasOnlyPickedUp = compartment.Entrega.every(d => d.status === 'RETIRADO');
      if (hasOnlyPickedUp) {
        return 'DISPONIVEL';
      }
    }
    
    // Se não tem entregas ou todas foram retiradas, usa o status do compartimento
    let status = compartment.status;
    if (status === 'AVAILABLE') status = 'DISPONIVEL';
    if (status === 'BLOCKED') status = 'BLOQUEADO';
    
    return status;
  }

  function getSizeText(size) {
    switch (size) {
      case 'SMALL': return 'Pequeno';
      case 'MEDIUM': return 'Médio';
      case 'LARGE': return 'Grande';
      default: return size || 'Padrão';
    }
  }

  // Função para clicar no compartimento
  async function handleCompartmentClick(compartment) {
    const realStatus = getRealStatus(compartment);
    
    console.log('🔍 - Clique na caixa:', compartment.numero);
    console.log('🔍 - Dados completos da caixa:', compartment);
    console.log('🔍 - Status do banco:', compartment.status);
    console.log('🔍 - Tem deliveryDetails:', !!compartment.deliveryDetails);
    console.log('🔍 - Status da entrega:', compartment.deliveryDetails?.status);
    console.log('🔍 - RealStatus calculado:', realStatus);
    console.log('🔍 - Condição de bloqueio:', realStatus === 'OCCUPIED' || realStatus === 'RESERVED');
    
    // Se estiver ocupado ou reservado, não permite bloquear
    if (realStatus === 'OCCUPIED' || realStatus === 'RESERVED') {
      console.log('🔍 - Bloqueado! Não permite bloquear - action: error');
      setConfirmModal({
        isOpen: true,
        compartment,
        action: 'error'
      });
      return;
    }
    
    // Abrir modal de confirmação
    const action = realStatus === 'BLOQUEADO' ? 'desbloquear' : 'bloquear';
    console.log('🔍 - Permitido! Action:', action);
    setConfirmModal({
      isOpen: true,
      compartment,
      action
    });
  }

  // Confirmar ação
  async function confirmAction() {
    const { compartment, action } = confirmModal;
    
    if (action === 'error') {
      setConfirmModal({ isOpen: false, compartment: null, action: '' });
      return;
    }
    
    try {
      const realStatus = getRealStatus(compartment);
      const newStatus = realStatus === 'BLOQUEADO' ? 'DISPONIVEL' : 'BLOQUEADO';
      
      // Chamada real à API para bloquear/desbloquear (POST com body)
      const response = await apiPost(`/api/compartment/toggle-status`, { 
        id: compartment.id, 
        status: newStatus 
      });
      
      // Recarregar compartimentos do servidor para garantir sincronização
      await loadCompartments();
      
      setConfirmModal({ isOpen: false, compartment: null, action: '' });
    } catch (error) {
      console.error('❌ Erro ao bloquear/desbloquear caixa:', error);
      alert('Erro ao bloquear/desbloquear caixa: ' + error.message);
    }
  }

  // Fechar modal
  function closeModal() {
    setConfirmModal({ isOpen: false, compartment: null, action: '' });
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
      {/* Seletor de Locker e Legenda */}
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

        {/* Legenda de Status */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs font-semibold mb-2 text-slate-600">Status:</div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
              <span>Bloqueado</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Grid de Caixas - Layout de Armário Real */}
      <div className="space-y-6">
        {/* Container do Armário */}
        <div className="bg-gray-100 rounded-lg p-6 border-2 border-gray-300">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              {selectedLocker ? lockers.find(l => l.id === selectedLocker)?.nome : 'Armário'} 
            </h3>
            <p className="text-sm text-slate-600">Visualização do Armário (clique para bloquear/desbloquear)</p>
          </div>
          
          {/* Layout do Armário - Grade de Caixas Detalhadas */}
          <div className="bg-white rounded-lg p-4 shadow-inner">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Ordenar caixas por número para posicionamento correto */}
              {compartments
                .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
                .map((compartment) => {
                  const realStatus = getRealStatus(compartment);
                  return (
                  <div
                    key={compartment.id}
                    className={`
                      relative rounded-lg border-2 p-3 transition-all hover:shadow-md cursor-pointer
                      ${getStatusColor(realStatus)}
                    `}
                    onClick={() => handleCompartmentClick(compartment)}
                  >
                    {/* Número da Caixa */}
                    <div className="text-center">
                      <div className="text-sm font-bold mb-1">
                        Caixa {compartment.numero}
                      </div>
                      
                      {/* Ícone de Status */}
                      <div className="text-2xl mb-2">
                        {getStatusIcon(realStatus)}
                      </div>
                      
                      {/* Status */}
                      <div className="text-xs font-medium">
                        {getStatusText(realStatus)}
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmAction}
        title={
          confirmModal.action === 'error' 
            ? 'Ação Não Permitida'
            : `Tem certeza que deseja ${confirmModal.action}?`
        }
        message={
          confirmModal.action === 'error'
            ? 'Esta caixa está ocupada ou reservada e não pode ser bloqueada.'
            : `Deseja ${confirmModal.action} a caixa ${confirmModal.compartment?.numero}?`
        }
        confirmText={
          confirmModal.action === 'error' 
            ? 'Entendido'
            : confirmModal.action === 'bloquear' 
              ? 'Bloquear' 
              : 'Desbloquear'
        }
        cancelText="Cancelar"
      />
    </div>
  );
}
