'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getStatusText, formatDate } from '../lib/utils';

export default function DetailsModalUltimate({ isOpen, onClose, pedido }) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !pedido) return null;

  const data = pedido.delivery || pedido;

  function handleCopy() {
    const text = [
      `PEDIDO: ${data.nomeDestinatario || '-'}`,
      `Email: ${data.emailDestinatario || '-'}`,
      `Telefone: ${data.telefoneDestinatario || '-'}`,
      `Nº Pedido: ${data.numeroPedido || '-'}`,
      data.emailRemetente ? `Remetente: ${data.emailRemetente}` : null,
      `Locker: ${pedido.Armario?.nome || '-'}`,
      `Caixa: ${pedido.Compartimento?.numero || '-'}`,
      `Cód. Depósito: ${pedido.codigoDeposito || data.codigoDeposito || '-'}`,
      `Cód. Retirada: ${pedido.codigoRetirada || data.codigoRetirada || '-'}`,
      `Descrição: ${data.descricao || '-'}`,
      `Status: ${getStatusText(data.status)}`,
      `Criado: ${formatDate(data.dataCriacao) || '-'}`,
      `Depósito: ${formatDate(data.dataDeposito) || 'Não realizado'}`,
      `Retirado: ${formatDate(data.dataRetirada) || 'Não retirado'}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const codigoDeposito = pedido.codigoDeposito || data.codigoDeposito;
  const codigoRetirada = pedido.codigoRetirada || data.codigoRetirada;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Detalhes do Pedido</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition rounded-lg p-1 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Códigos */}
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Códigos</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-blue-500 mb-1">Depósito</p>
                <p className="font-mono text-lg font-bold text-blue-900">{codigoDeposito || '-'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-500 mb-1">Retirada</p>
                <p className="font-mono text-lg font-bold text-blue-900">{codigoRetirada || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Informações</p>
            {[
              ['Cliente', data.nomeDestinatario],
              ['Email', data.emailDestinatario],
              ['Telefone', data.telefoneDestinatario],
              ['Nº Pedido', data.numeroPedido],
              data.emailRemetente ? ['Remetente', data.emailRemetente] : null,
              ['Locker', pedido.Armario?.nome],
              ['Caixa', pedido.Compartimento?.numero],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-2 text-sm">
                <span className="text-slate-400 shrink-0">{label}</span>
                <span className="text-slate-800 font-medium text-right break-all">{value || '-'}</span>
              </div>
            ))}
          </div>

          {/* Descrição */}
          {data.descricao && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
              <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">Descrição</p>
              <p className="text-sm text-slate-700">{data.descricao}</p>
            </div>
          )}

          {/* Datas */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Histórico</p>
            {[
              ['Criado', formatDate(data.dataCriacao)],
              ['Depositado', formatDate(data.dataDeposito) || 'Não realizado'],
              ['Retirado', formatDate(data.dataRetirada) || 'Não retirado'],
              ['Status', getStatusText(data.status)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-emerald-600">{label}</span>
                <span className="text-slate-800 font-medium">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
