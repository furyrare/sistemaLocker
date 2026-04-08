'use client';

import { useState } from 'react';
import { apiPost } from '../../components/api';

export default function PickupClient() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const cleaned = String(code || '').replace(/\D/g, '').slice(0, 6);
      await apiPost('/api/pickup', { code: cleaned });
      setStatus('success');
      setMessage('Caixa liberada');
      setCode('');
    } catch (e2) {
      setStatus('error');
      setMessage('Código inválido');
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Código</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-3 text-center text-2xl tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            required
          />
        </div>

        <button
          className="w-full rounded-lg bg-slate-900 px-3 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Validando…' : 'Liberar'}
        </button>

        {message ? (
          <div
            className={`rounded-lg border p-3 text-center text-sm ${
              status === 'success'
                ? 'border-green-200 bg-green-50 text-green-900'
                : status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : 'border-slate-200 bg-slate-50 text-slate-900'
            }`}
          >
            {message}
          </div>
        ) : null}
      </form>
    </div>
  );
}
