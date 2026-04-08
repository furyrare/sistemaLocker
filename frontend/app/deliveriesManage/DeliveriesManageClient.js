'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../components/api';
import CreateDeliveryModal from '../../components/CreateDeliveryModal';

export default function DeliveriesManageClient() {
  const [deliveries, setDeliveries] = useState([]);
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesResponse, lockersResponse] = await Promise.all([
        apiGet('/api/deliveries-manage'),
        apiGet('/api/lockers-manage')
      ]);
      
      const deliveriesData = deliveriesResponse.data || deliveriesResponse;
      const lockersData = lockersResponse.data || lockersResponse;
      
      setDeliveries(deliveriesData);
      setLockers(lockersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async (formData) => {
    try {
      await apiPost('/api/deliveries/generate-code', formData);
      await loadData(); // Recarregar dados
    } catch (err) {
      throw new Error(err.message || 'Erro ao criar encomenda');
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.nomeDestinatario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.emailDestinatario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.codigoRetirada?.includes(searchTerm) ||
      delivery.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDENTE_DEPOSITO': return 'bg-yellow-100 text-yellow-800';
      case 'PRONTO_PARA_RETIRADA': return 'bg-blue-100 text-blue-800';
      case 'RETIRADO': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDENTE_DEPOSITO': return 'Aguardando Depósito';
      case 'PRONTO_PARA_RETIRADA': return 'Pronto para Retirada';
      case 'RETIRADO': return 'Retirado';
      case 'EXPIRED': return 'Expirado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Encomendas</h1>
          <p className="text-gray-600 mt-2">Gerencie todas as encomendas do sistema</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nome, email, código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="PENDENTE_DEPOSITO">Aguardando Depósito</option>
                <option value="PRONTO_PARA_RETIRADA">Pronto para Retirada</option>
                <option value="RETIRADO">Retirado</option>
                <option value="EXPIRED">Expirado</option>
              </select>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Nova Encomenda
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Deliveries Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinatário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Locker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Nenhuma encomenda encontrada com os filtros aplicados.'
                        : 'Nenhuma encomenda encontrada. Crie uma nova encomenda para começar.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.codigoDeposito || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Retirada: {delivery.codigoRetirada}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {delivery.nomeDestinatario}
                        </div>
                        {delivery.emailRemetente && (
                          <div className="text-xs text-gray-500">
                            Por: {delivery.emailRemetente}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {delivery.emailDestinatario}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {delivery.Armario?.nome || '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Caixa {delivery.Compartimento?.numero || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {delivery.descricao || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                          {getStatusText(delivery.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(delivery.dataCriacao).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <CreateDeliveryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateDelivery}
          lockers={lockers}
        />
      </div>
    </div>
  );
}
