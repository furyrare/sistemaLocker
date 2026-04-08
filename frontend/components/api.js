/**
 * Cliente HTTP simples para chamar a API do backend.
 *
 * Centraliza o `fetch` e o tratamento de erro para não repetir lógica nas telas.
 */

// Sempre usar a URL do backend
export const API_BASE = 'http://localhost:4000';

export async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  return res.json();
}

export async function apiDownload(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  return res.text(); // Retorna texto para CSV
}

export async function apiPost(path, body) {
  console.log('🚀 API POST Request:', path, body);
  
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  console.log('📡 API Response Status:', res.status);
  console.log('📡 API Response OK:', res.ok);
  
  if (!res.ok) {
    const data = await safeJson(res);
    console.log('❌ API Error Data:', data);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ API Success Data:', data);
  return data;
}

export async function apiPut(path, body) {
  console.log('🔄 API PUT Request:', path, body);
  console.log('🔍 API_BASE:', API_BASE);
  console.log('🔍 URL completa:', `${API_BASE}${path}`);
  
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  console.log('📡 API Response Status:', res.status);
  console.log('📡 API Response OK:', res.ok);
  
  if (!res.ok) {
    const data = await safeJson(res);
    console.log('❌ API Error Data:', data);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ API Success Data:', data);
  return data;
}

export async function apiDelete(path) {
  console.log('🗑️ API DELETE Request:', path);
  
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE'
  });
  
  console.log('📡 API Response Status:', res.status);
  console.log('📡 API Response OK:', res.ok);
  
  if (!res.ok) {
    const data = await safeJson(res);
    console.log('❌ API Error Data:', data);
    throw new Error(data?.error || `Falha na requisição: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ API Success Data:', data);
  return data;
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
