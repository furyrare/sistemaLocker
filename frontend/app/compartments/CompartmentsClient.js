'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../../components/api';

export default function CompartmentsClient() {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [compartments, setCompartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLockers();
  }, []);

  useEffect(() => {
    if (selectedLocker) {
      loadCompartments();
    }
  }, [selectedLocker]);

  async function loadLockers() {
    try {
      const data = await apiGet('/api/lockers-manage');
      setLockers(data);
      if (data[0]?.id) {
        setSelectedLocker(data[0].id);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadCompartments() {
    setLoading(true);
    try {
      const data = await apiGet(`/api/dashboard/grid?lockerId=${encodeURIComponent(selectedLocker)}`);
      setCompartments(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Removido - dados de entregas já vêm da API /api/dashboard/grid
  // Não há necessidade de requisição adicional

  function getStatusColor(status) {
    switch (status) {
      case 'AVAILABLE': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'RESERVED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'AVAILABLE': return 'Disponível';
      case 'RESERVED': return 'Reservado';
      case 'OCCUPIED': return 'Ocupado';
      case 'BLOCKED': return 'Bloqueado';
      default: return status;
    }
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
      {/* Seletor de Locker */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Locker:</label>
        <select
          value={selectedLocker}
          onChange={(e) => setSelectedLocker(e.target.value)}
          className="rounded-lg border bg-white px-3 py-2 text-sm"
        >
          {lockers.map((locker) => (
            <option key={locker.id} value={locker.id}>
              {locker.nome} — {locker.localizacao}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Grid de Caixas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {compartments.map((compartment) => (
          <div
            key={compartment.id}
            className={`rounded-lg border p-4 ${getStatusColor(compartment.status)}`}
          >
            <div className="text-center">
              {/* Número da Caixa e Tamanho */}
              <div className="text-center mb-2">
                <div className="text-lg font-bold">
                  Caixa {compartment.number}
                </div>
                <div className="text-xs text-slate-600">
                  {compartment.size || 'Auto'}
                </div>
              </div>

              {/* Status */}
              <div className="text-xs font-medium mb-3">
                {getStatusText(compartment.status)}
              </div>

              {/* Informações da Entrega (se houver) */}
              {compartment.deliveryDetails && (
                <div className="space-y-2 text-xs">
                  <div className="border-t pt-2">
                    <div className="font-semibold">Cliente:</div>
                    <div>{compartment.deliveryDetails.nomeDestinatario}</div>
                  </div>
                  
                  <div>
                    <div className="font-semibold">Email:</div>
                    <div className="truncate">{compartment.deliveryDetails.emailDestinatario}</div>
                  </div>

                  <div>
                    <div className="font-semibold">Descrição:</div>
                    <div className="truncate">{compartment.deliveryDetails.descricao}</div>
                  </div>

                  {/* Códigos */}
                  <div className="border-t pt-2 space-y-1">
                    {compartment.deliveryDetails.codigoDeposito && (
                      <div>
                        <div className="font-semibold">Código Depósito:</div>
                        <div className="font-mono tracking-widest text-lg">
                          {compartment.deliveryDetails.codigoDeposito}
                        </div>
                      </div>
                    )}
                    
                    {compartment.deliveryDetails.codigoRetirada && (
                      <div>
                        <div className="font-semibold">Código Retirada:</div>
                        <div className="font-mono tracking-widest text-lg">
                          {compartment.deliveryDetails.codigoRetirada}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status do Compartimento */}
                  <div className="border-t pt-2">
                    <div className="font-semibold">Status da Caixa:</div>
                    <div>
                      {getStatusText(compartment.status)}
                    </div>
                  </div>

                  {/* Status da Entrega */}
                  {compartment.deliveryDetails && (
                    <div className="border-t pt-2">
                      <div className="font-semibold">Status da Entrega:</div>
                      <div>
                        {compartment.deliveryDetails.status === 'PENDENTE_DEPOSITO' && 'Aguardando Depósito'}
                        {compartment.deliveryDetails.status === 'PRONTO_PARA_RETIRADA' && 'Pronta para Retirada'}
                        {compartment.deliveryDetails.status === 'PICKED_UP' && 'Retirada'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="rounded-lg border bg-slate-50 p-4">
        <div className="text-sm font-semibold mb-2">Legenda:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span>Reservada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
            <span>Ocupada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
            <span>Bloqueada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
