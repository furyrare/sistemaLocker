'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../components/api';

function buildCompartments({ small, medium, large }) {
  const comps = [];
  let n = 1;
  for (let i = 0; i < Number(small || 0); i++) comps.push({ number: n++, size: 'SMALL' });
  for (let i = 0; i < Number(medium || 0); i++) comps.push({ number: n++, size: 'MEDIUM' });
  for (let i = 0; i < Number(large || 0); i++) comps.push({ number: n++, size: 'LARGE' });
  return comps;
}

export default function LockersClient() {
  const [lockers, setLockers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [nome, setNome] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [small, setSmall] = useState(6);
  const [medium, setMedium] = useState(4);
  const [large, setLarge] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => Number(small || 0) + Number(medium || 0) + Number(large || 0),
    [small, medium, large]
  );

  async function refresh() {
    setError('');
    const response = await apiGet('/api/lockers-manage');
    const data = response.data || response;
    setLockers(data);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const compartments = buildCompartments({ small, medium, large });
      await apiPost('/api/lockers', { nome, localizacao, compartments });
      setSuccess('Locker criado com sucesso.');
      setNome('');
      setLocalizacao('');
      await refresh();
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Novo locker</div>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-medium text-slate-600">Nome</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Localização</label>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Pequenas</label>
              <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={small} onChange={(e) => setSmall(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Médias</label>
              <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={medium} onChange={(e) => setMedium(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Grandes</label>
              <input type="number" min="0" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={large} onChange={(e) => setLarge(e.target.value)} />
            </div>
          </div>

          <div className="text-xs text-slate-500">Total de caixas: {total}</div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">{success}</div>
          ) : null}

          <button
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Salvando…' : 'Criar locker'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="text-sm font-semibold">Lockers cadastrados</div>
        <div className="mt-4 space-y-3">
          {lockers.map((l) => (
            <div key={l.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{l.nome}</div>
                  <div className="text-sm text-slate-500">{l.localizacao}</div>
                </div>
                <div className="text-xs text-slate-600">Caixas: {l._count?.compartments ?? 0}</div>
              </div>
            </div>
          ))}
          {lockers.length === 0 ? <div className="text-sm text-slate-600">Nenhum locker cadastrado.</div> : null}
        </div>
      </div>
    </div>
  );
}
