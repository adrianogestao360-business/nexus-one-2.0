function calcularParcelas(total, parcelas, dataBase = new Date()) {
  const valorBase = Math.round((total / parcelas) * 100) / 100;
  let somaAnteriores = 0;
  const resultado = [];

  for (let numero = 1; numero <= parcelas; numero++) {
    const ultima = numero === parcelas;
    const valor = ultima
      ? Math.round((total - somaAnteriores) * 100) / 100
      : valorBase;

    somaAnteriores += valor;

    const vencimento = new Date(dataBase);
    vencimento.setDate(vencimento.getDate() + 30 * numero);

    resultado.push({ numero, valor, vencimento });
  }

  return resultado;
}

module.exports = { calcularParcelas };
