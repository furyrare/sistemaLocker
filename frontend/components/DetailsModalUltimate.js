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
  const codigoDeposito = pedido.codigoDeposito || data.codigoDeposito;
  const codigoRetirada = pedido.codigoRetirada || data.codigoRetirada;

  function handleCopy() {
    const text = [
      `Cliente: ${data.nomeDestinatario || '-'}`,
      `Email: ${data.emailDestinatario || '-'}`,
      `Telefone: ${data.telefoneDestinatario || '-'}`,
      `Nº Pedido: ${data.numeroPedido || '-'}`,
      data.emailRemetente ? `Remetente: ${data.emailRemetente}` : null,
      `Locker: ${pedido.Armario?.nome || '-'}`,
      `Caixa: ${pedido.Compartimento?.numero || '-'}`,
      `Cód. Depósito: ${codigoDeposito || '-'}`,
      `Cód. Retirada: ${codigoRetirada || '-'}`,
      `Descrição: ${data.descricao || '-'}`,
      `Status: ${getStatusText(data.status)}`,
      `Criado: ${formatDate(data.dataCriacao) || '-'}`,
      `Depositado: ${formatDate(data.dataDeposito) || 'Não realizado'}`,
      `Retirado: ${formatDate(data.dataRetirada) || 'Não retirado'}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const infos = [
    ['Cliente',    data.nomeDestinatario],
    ['Email',      data.emailDestinatario],
    ['Telefone',   data.telefoneDestinatario],
    ['Nº Pedido',  data.numeroPedido],
    data.emailRemetente ? ['Remetente', data.emailRemetente] : null,
    ['Locker',     pedido.Armario?.nome],
    ['Caixa',      pedido.Compartimento?.numero],
  ].filter(Boolean);

  const datas = [
    ['Criado',      formatDate(data.dataCriacao)     || '-'],
    ['Depositado',  formatDate(data.dataDeposito)    || 'Não realizado'],
    ['Retirado',    formatDate(data.dataRetirada)    || 'Não retirado'],
    ['Status',      getStatusText(data.status)],
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 text-sm">Detalhes do Pedido</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition rounded-lg p-1 hover:bg-slate-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — sem scroll */}
        <div className="p-4 space-y-3">

          {/* Códigos */}
          <div className="grid grid-cols-2 gap-3">
            {[['Depósito', codigoDeposito], ['Retirada', codigoRetirada]].map(([label, code]) => (
              <div key={label} className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
                <p className="text-xs text-blue-500 mb-0.5">{label}</p>
                <p className="font-mono text-xl font-bold text-blue-900">{code || '-'}</p>
              </div>
            ))}
          </div>

          {/* Informações + Histórico lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            {/* Informações */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Informações</p>
              {infos.map(([label, value]) => (
                <div key={label}>
                  <span className="text-[10px] text-slate-400">{label}</span>
                  <p className="text-xs font-medium text-slate-800 leading-tight break-all">{value || '-'}</p>
                </div>
              ))}
            </div>

            {/* Histórico + Descrição */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 space-y-1.5">
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Histórico</p>
                {datas.map(([label, value]) => (
                  <div key={label}>
                    <span className="text-[10px] text-emerald-500">{label}</span>
                    <p className="text-xs font-medium text-slate-800 leading-tight">{value}</p>
                  </div>
                ))}
              </div>

              {data.descricao && (
                <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide mb-1">Descrição</p>
                  <p className="text-xs text-slate-700">{data.descricao}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
