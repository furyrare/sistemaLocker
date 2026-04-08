'use client';

import { useState } from 'react';
import { apiPost } from '../../components/api';

export default function KioskClient() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    console.log('=== INÍCIO DO PROCESSO ===');
    console.log('Código digitado:', code);

    try {
      // Tenta como depósito primeiro
      console.log('Tentando depósito...');
      const data = await apiPost('/api/deliveries/deposit', { code });
      console.log('✅ Depósito SUCCESS:', data);
      setResult({ type: 'deposit', data });
      setCode('');
      console.log('=== SUCESSO COMPLETO ===');
      
      // Retorna para tela inicial após 10 segundos
      setTimeout(() => {
        setResult(null);
        setError('');
      }, 10000);
    } catch (error) {
      console.log('❌ Erro no depósito:', error);
      console.log('Mensagem do erro:', error.message);
      
      // Se o erro for de código já utilizado, mostra mensagem específica
      if (error.message && error.message.includes('já foi utilizado')) {
        console.log('Código já utilizado - mostrando mensagem específica');
        setError(error.message);
      } else if (error.message && error.message.includes('inválido')) {
        console.log('Código inválido - tentando como retirada...');
        // Se for código inválido, tenta como retirada
        try {
          const pickupData = await apiPost('/api/pickup', { code });
          console.log('✅ Retirada SUCCESS:', pickupData);
          setResult({ type: 'pickup', data: pickupData });
          setCode('');
          console.log('=== SUCESSO COMPLETO ===');
          
          // Retorna para tela inicial após 10 segundos
          setTimeout(() => {
            setResult(null);
            setError('');
          }, 10000);
        } catch (pickupError) {
          console.log('❌ Erro na retirada:', pickupError);
          setError('Código inválido. Verifique se o código de depósito ou retirada está correto.');
        }
      } else {
        setError(error.message || 'Erro ao processar código. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setCode('');
    setResult(null);
    setError('');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center p-4 pt-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          {/* Cabeçalho */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Smart Locker</h1>
            <p className="text-slate-600 text-sm">
              Digite o código abaixo!
            </p>
          </div>

          {/* Formulário */}
          {!result ? (
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 text-center mb-2">
                  Código de Acesso
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-5 text-3xl font-mono text-center border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-full bg-slate-900 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Processando...' : 'Enviar'}
              </button>
            </form>
          ) : (
            /* Resultado */
            <div className="text-center space-y-6 animate-fade-in">
              {result && (
                <>
                  {result.type === 'deposit' ? (
                    <>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-green-900 mb-3">Depósito Realizado!</h2>
                        <p className="text-lg text-slate-600 mb-6">
                          O código de retirada foi enviado para o e-mail do destinatário.
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 animate-pulse">
                       Retornando à tela inicial em 10 segundos...
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-blue-900 mb-3">Retirada Realizada!</h2>
                        <p className="text-lg text-slate-600 mb-6">
                          Encomenda retirada com sucesso.
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 animate-pulse">
                       Retornando à tela inicial em 10 segundos...
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
