'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiDownload } from './api';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadLockers();
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [selectedLocker, startDate, endDate]);

  async function loadLockers() {
    try {
      const response = await apiGet('/api/lockers-manage');
      const data = response.data || response;
      setLockers(data);
    } catch (e) {
      console.error('Erro ao carregar lockers:', e);
    }
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLocker) params.append('lockerId', selectedLocker);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiGet(`/api/analytics/entregas?${params.toString()}`);
      setAnalytics(response.data);
    } catch (e) {
      console.error('Erro ao carregar analytics:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDENTE_DEPOSITO': 'bg-yellow-100 text-yellow-800',
      'PRONTO_PARA_RETIRADA': 'bg-blue-100 text-blue-800',
      'RETIRADO': 'bg-green-100 text-green-800',
      'EXPIRED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDENTE_DEPOSITO': 'Aguardando Depósito',
      'PRONTO_PARA_RETIRADA': 'Pronta para Retirada',
      'RETIRADO': 'Retirada',
      'EXPIRED': 'Expirada'
    };
    return labels[status] || status;
  };

  const exportReport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLocker) params.append('lockerId', selectedLocker);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await apiDownload(`/api/report/deliveries/export?${params.toString()}`);
      
      // Download do CSV com tratamento simplificado
      const blob = new Blob([response], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const hoje = new Date();
      const dataFormatada = `${hoje.getDate().toString().padStart(2, '0')}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}-${hoje.getFullYear()}`;
      link.download = `RelatorioLocker_${dataFormatada}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Erro: {error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-800">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Exportação */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('csv')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              📄 Exportar CSV Completo
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Locker</label>
            <select
              value={selectedLocker}
              onChange={(e) => setSelectedLocker(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Lockers</option>
              {lockers.map((locker) => (
                <option key={locker.id} value={locker.id}>
                  {locker.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedLocker('');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total de Pedidos</h4>
          <p className="text-2xl font-bold text-blue-600">{analytics.totalDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Retiradas</h4>
          <p className="text-2xl font-bold text-green-600">{analytics.pickedUpDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Pendentes</h4>
          <p className="text-2xl font-bold text-orange-600">{analytics.pendingDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Tempo Médio Retirada</h4>
          <p className="text-2xl font-bold text-purple-600">
            {analytics.averagePickupTimeHours.toFixed(1)}h
          </p>
        </div>
      </div>

      {/* Pedidos por Status */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Pedidos por Status</h3>
        <div className="space-y-2">
          {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status)}`}>
                {getStatusLabel(status)}
              </span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pedidos por Locker (apenas quando não filtrado por locker específico) */}
      {!selectedLocker && analytics.deliveriesByLocker.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-lg font-semibold mb-4">Pedidos por Locker</h3>
          <div className="space-y-2">
            {analytics.deliveriesByLocker
              .sort((a, b) => b.totalDeliveries - a.totalDeliveries)
              .map((locker) => (
                <div key={locker.lockerId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{locker.lockerName}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {locker.totalDeliveries}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Gráfico de Pedidos por Dia */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Pedidos por Dia (Últimos 30 dias)</h3>
        <div className="space-y-2">
          {analytics.deliveriesByDay.map((day) => (
            <div key={day.date} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">{day.date}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((day.count / Math.max(...analytics.deliveriesByDay.map(d => d.count))) * 100, 100)}%`
                    }}
                  />
                </div>
                <span className="font-medium text-sm w-8 text-right">{day.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
