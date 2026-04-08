'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiDelete, apiPost } from '../../components/api';
import ConfirmModal from '../../components/ConfirmModal';
import AddLockerModal from '../../components/AddLockerModal';

export default function LockersManageClient() {
  const [lockers, setLockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    locker: null
  });
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    loadLockers();
  }, []);

  async function loadLockers() {
    try {
      console.log('🔄 Carregando lockers...');
      const response = await apiGet('/api/lockers-manage');
      const data = response.data || response;
      console.log('📡 Dados recebidos:', data);
      setLockers(data);
      console.log('✅ Lockers atualizados:', data.length);
    } catch (e) {
      console.error('❌ Erro ao carregar lockers:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteLocker(lockerId, lockerName) {
    setConfirmModal({
      isOpen: true,
      locker: { id: lockerId, name: lockerName }
    });
  }

  async function confirmDelete() {
    const { locker } = confirmModal;
    
    try {
      setDeleting(locker.id);
      await apiDelete(`/api/lockers-manage/${locker.id}`);
      await loadLockers(); // Recarregar a lista
      setConfirmModal({ isOpen: false, locker: null });
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  }

  async function handleAddLocker(lockerData) {
    console.log('🚀 handleAddLocker chamado com:', lockerData);
    try {
      await apiPost('/api/lockers-manage', lockerData);
      await loadLockers(); // Recarregar a lista
    } catch (e) {
      console.error('❌ Erro ao adicionar locker:', e);
      throw e;
    }
  }

  function closeConfirmModal() {
    setConfirmModal({ isOpen: false, locker: null });
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
      {/* Botão de Adicionar */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('🔘 Botão Adicionar Locker clicado!');
            setAddModal(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Adicionar Locker
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="text-sm font-semibold mb-4">Lockers Cadastrados</div>
        
        {lockers.length === 0 ? (
          <div className="text-center py-8 text-slate-600">
            Nenhum locker encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total de Caixas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {lockers && lockers.map((locker) => (
                  <tr key={locker.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {locker.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {locker.localizacao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {locker.Compartimento?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteLocker(locker.id, locker.nome)}
                        disabled={deleting === locker.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === locker.id ? 'Deletando...' : 'Deletar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Deleção */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Tem certeza que deseja deletar?"
        message={`Deseja deletar o locker "${confirmModal.locker?.name}"? Esta ação não poderá ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
      />

      {/* Modal de Adicionar Locker */}
      <AddLockerModal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        onSubmit={handleAddLocker}
      />

      </div>
  );
}
