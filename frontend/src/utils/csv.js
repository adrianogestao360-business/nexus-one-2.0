function escaparCampo(valor) {
  const texto = String(valor ?? "");

  if (/[",\n;]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }

  return texto;
}

export function exportarCsv(nomeArquivo, colunas, linhas) {
  const cabecalho = colunas.map((coluna) => escaparCampo(coluna.label));
  const corpo = linhas.map((linha) =>
    colunas.map((coluna) => escaparCampo(coluna.valor(linha))),
  );

  const conteudo = [cabecalho, ...corpo].map((l) => l.join(";")).join("\n");
  const blob = new Blob(["﻿" + conteudo], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
