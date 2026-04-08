'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../components/api';
import DetailsModalUltimate from '../../components/DetailsModalUltimate';

export default function DeliveriesClient() {
  const [lockers, setLockers] = useState([]);
  const [lockerId, setLockerId] = useState('');

  const [nomeDestinatario, setNomeDestinatario] = useState('');
  const [emailDestinatario, setEmailDestinatario] = useState('');
  const [telefoneDestinatario, setTelefoneDestinatario] = useState('');
  const [emailRemetente, setEmailRemetente] = useState('');
  const [descricao, setDescricao] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet('/api/lockers-manage')
      .then((response) => {
        if (!alive) return;
        // Extrair o array de dentro do objeto response
        const data = response.data || response;
        setLockers(data);
        if (data && data.length > 0 && data[0]?.id) {
          setLockerId(data[0].id);
        }
      })
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, []);

  // Função para formatar telefone
  const formatPhone = (value) => {
    let v = value.replace(/\D/g, '');

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      v = `(${v.slice(0, 2)})${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)})${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }

    return v;
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhone(e.target.value);
    setTelefoneDestinatario(formattedValue);
  };

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    try {
      const body = {
        emailDestinatario,
        nomeDestinatario,
        telefoneDestinatario,
        emailRemetente,
        lockerId,
        descricao,
        numeroPedido
      };

      const data = await apiPost('/api/deliveries/generate-code', body);
      setResult(data);
      setShowDetailsModal(true);
      
      // Limpar formulário
      setEmailDestinatario('');
      setNomeDestinatario('');
      setTelefoneDestinatario('');
      setEmailRemetente('');
      setLockerId('');
      setDescricao('');
      setNumeroPedido('');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Criar Nova Encomenda</h1>
            <p className="text-gray-600 mt-1">Preencha os dados para gerar os códigos de acesso</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do destinatário</label>
                <input 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={emailDestinatario} 
                  onChange={(e) => setEmailDestinatario(e.target.value)} 
                  required 
                  type="email" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do destinatário</label>
                <input 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={nomeDestinatario} 
                  onChange={(e) => setNomeDestinatario(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do destinatário</label>
                <input 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={telefoneDestinatario} 
                  onChange={handlePhoneChange} 
                  required 
                  type="tel" 
                  id="telefone"
                  maxLength="14"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do pedido</label>
                <input 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={numeroPedido} 
                  onChange={(e) => setNumeroPedido(e.target.value)} 
                  required 
                  type="text" 
                  placeholder="PED-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do remetente *</label>
                <input 
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={emailRemetente} 
                  onChange={(e) => setEmailRemetente(e.target.value)} 
                  required 
                  type="email" 
                  placeholder="email@quemenvia.com" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locker</label>
                <select 
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={lockerId} 
                  onChange={(e) => setLockerId(e.target.value)} 
                  required
                >
                  {lockers && lockers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
                required 
                rows={3} 
              />
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
            ) : null}

            <button 
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors" 
              disabled={submitting} 
              type="submit"
            >
              {submitting ? 'Gerando códigos…' : 'Gerar Códigos de Acesso'}
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Detalhes do Pedido - usando o mesmo de pedidos */}
      {showDetailsModal && result?.data && (
        <DetailsModalUltimate
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          pedido={result.data}
        />
      )}
    </div>
  );
}
