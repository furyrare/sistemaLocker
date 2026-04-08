function gerarCodigo() {
  return String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
}

module.exports = { gerarCodigo };
