export function getStatusColor(status) {
  switch (status) {
    case 'DISPONIVEL':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'RESERVADO':
    case 'RESERVED':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'OCUPADO':
    case 'OCCUPIED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'BLOQUEADO':
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDENTE_DEPOSITO':
      return 'bg-yellow-100 text-yellow-800';
    case 'PRONTO_PARA_RETIRADA':
      return 'bg-blue-100 text-blue-800';
    case 'RETIRADO':
    case 'PICKED_UP':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export function getStatusText(status) {
  switch (status) {
    case 'DISPONIVEL':         return 'Disponível';
    case 'RESERVADO':
    case 'RESERVED':           return 'Reservada';
    case 'OCUPADO':
    case 'OCCUPIED':           return 'Ocupada';
    case 'BLOQUEADO':
    case 'BLOCKED':            return 'Bloqueada';
    case 'PENDENTE_DEPOSITO':  return 'Aguardando Depósito';
    case 'PRONTO_PARA_RETIRADA': return 'Pronta para Retirada';
    case 'RETIRADO':
    case 'PICKED_UP':          return 'Retirada';
    default:                   return status || '-';
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case 'DISPONIVEL':   return '🔓';
    case 'RESERVADO':
    case 'RESERVED':     return '⏳';
    case 'OCUPADO':
    case 'OCCUPIED':     return '📦';
    case 'BLOQUEADO':
    case 'BLOCKED':      return '🔒';
    default:             return '❓';
  }
}

export function getSizeText(size) {
  switch (size) {
    case 'SMALL':  return 'Pequeno';
    case 'MEDIUM': return 'Médio';
    case 'LARGE':  return 'Grande';
    case 'UNICO':  return 'Padrão';
    default:       return size || 'Padrão';
  }
}

export function formatDate(dateString) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('pt-BR');
  } catch {
    return null;
  }
}
