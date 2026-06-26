'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../components/api';
import ConfirmModal from '../../components/ConfirmModal';
import { getStatusColor, getStatusText, getStatusIcon } from '../../lib/utils';

export default function DashboardClient() {
  const [lockers, setLockers] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [compartments, setCompartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, compartment: null, action: '' });

  useEffect(() => { loadLockers(); }, []);
  useEffect(() => { if (selectedLocker) loadCompartments(); }, [selectedLocker]);

  useEffect(() => {
    const handleFocus = () => { if (selectedLocker) loadCompartments(); };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedLocker]);

  async function loadLockers() {
    try {
      const response = await apiGet('/api/lockers-manage');
      const data = response.data || response;
      setLockers(data);
      if (data[0]?.id) setSelectedLocker(data[0].id);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadCompartments() {
    setLoading(true);
    try {
      const url = `/api/dashboard/grid?lockerId=${encodeURIComponent(selectedLocker)}&t=${Date.now()}`;
      const data = await apiGet(url);
      setCompartments(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function getRealStatus(compartment) {
    if (compartment.status === 'BLOQUEADO') {
      const active = compartment.Entrega?.find(d =>
        d.status === 'PENDENTE_DEPOSITO' || d.status === 'PRONTO_PARA_RETIRADA'
      );
      if (active) return active.status === 'PRONTO_PARA_RETIRADA' ? 'OCUPADO' : 'RESERVADO';
      return 'BLOQUEADO';
    }

    const active = compartment.Entrega?.find(d =>
      d.status === 'PENDENTE_DEPOSITO' || d.status === 'PRONTO_PARA_RETIRADA'
    );
    if (active) return active.status === 'PRONTO_PARA_RETIRADA' ? 'OCUPADO' : 'RESERVADO';

    const allPickedUp = compartment.Entrega?.every(d => d.status === 'RETIRADO');
    if (allPickedUp) return 'DISPONIVEL';

    let status = compartment.status;
    if (status === 'AVAILABLE') status = 'DISPONIVEL';
    if (status === 'BLOCKED') status = 'BLOQUEADO';
    return status;
  }

  async function handleCompartmentClick(compartment) {
    const realStatus = getRealStatus(compartment);
    if (realStatus === 'OCUPADO' || realStatus === 'RESERVADO') {
      setConfirmModal({ isOpen: true, compartment, action: 'error' });
      return;
    }
    setConfirmModal({
      isOpen: true,
      compartment,
      action: realStatus === 'BLOQUEADO' ? 'desbloquear' : 'bloquear'
    });
  }

  async function confirmAction() {
    const { compartment, action } = confirmModal;
    if (action === 'error') { setConfirmModal({ isOpen: false, compartment: null, action: '' }); return; }

    try {
      const realStatus = getRealStatus(compartment);
      const newStatus = realStatus === 'BLOQUEADO' ? 'DISPONIVEL' : 'BLOQUEADO';
      await apiPost('/api/compartment/toggle-status', { id: compartment.id, status: newStatus });
      await loadCompartments();
      setConfirmModal({ isOpen: false, compartment: null, action: '' });
    } catch (err) {
      alert('Erro ao bloquear/desbloquear caixa: ' + err.message);
    }
  }

  const selectedLockerName = lockers.find(l => l.id === selectedLocker)?.nome ?? 'Armário';

  const statusCounts = compartments.reduce((acc, c) => {
    const s = getRealStatus(c);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 pt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Locker</label>
          <select
            value={selectedLocker}
            onChange={(e) => setSelectedLocker(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {lockers.map((l) => (
              <option key={l.id} value={l.id}>{l.nome}</option>
            ))}
          </select>
        </div>

        {/* Contadores */}
        <div className="flex gap-3 text-xs">
          {[
            { label: 'Disponível',  status: 'DISPONIVEL', dot: 'bg-slate-300' },
            { label: 'Reservada',   status: 'RESERVADO',  dot: 'bg-amber-400' },
            { label: 'Ocupada',     status: 'OCUPADO',    dot: 'bg-blue-500' },
            { label: 'Bloqueada',   status: 'BLOQUEADO',  dot: 'bg-red-500' },
          ].map(({ label, status, dot }) => (
            <div key={status} className="flex items-center gap-1.5 text-slate-600">
              <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span>{label}</span>
              {statusCounts[status] ? (
                <span className="font-semibold text-slate-800">({statusCounts[status]})</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Armário */}
      <div className="rounded-2xl border-2 border-slate-200 bg-slate-100 p-6">
        <div className="mb-5 text-center">
          <h2 className="text-lg font-semibold text-slate-800">{selectedLockerName}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Clique em uma caixa para bloquear / desbloquear</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-inner">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[...compartments]
              .sort((a, b) => parseInt(a.numero) - parseInt(b.numero))
              .map((compartment) => {
                const realStatus = getRealStatus(compartment);
                return (
                  <button
                    key={compartment.id}
                    onClick={() => handleCompartmentClick(compartment)}
                    className={`
                      rounded-xl border-2 p-3 text-center transition-all
                      hover:scale-[1.03] hover:shadow-md active:scale-[0.98]
                      focus:outline-none focus:ring-2 focus:ring-slate-400
                      ${getStatusColor(realStatus)}
                    `}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">Caixa {compartment.numero}</div>
                    <div className="text-2xl mb-1">{getStatusIcon(realStatus)}</div>
                    <div className="text-xs font-medium">{getStatusText(realStatus)}</div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, compartment: null, action: '' })}
        onConfirm={confirmAction}
        title={
          confirmModal.action === 'error'
            ? 'Ação não permitida'
            : `Confirmar: ${confirmModal.action} caixa ${confirmModal.compartment?.numero}?`
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
