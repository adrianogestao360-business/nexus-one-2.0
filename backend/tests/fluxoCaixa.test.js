const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarConta(token, dados = {}) {
  return request(app)
    .post("/contas-bancarias")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Banco Fluxo", ...dados });
}

async function criarTitulo(token, tipo, valor, vencimento) {
  return request(app)
    .post("/titulos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo,
      descricao: "Titulo Fluxo de Caixa",
      valor,
      vencimento,
    });
}

function dataMaisDias(dias) {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

async function obterFluxo(token, query = "") {
  return request(app)
    .get(`/financeiro/fluxo-caixa${query}`)
    .set("Authorization", `Bearer ${token}`);
}

describe("Fluxo de caixa", () => {
  test("sem contas nem títulos, saldoAtualTotal é zero e projeção cobre 31 dias por padrão", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await obterFluxo(token);

    expect(response.status).toBe(200);
    expect(response.body.saldoAtualTotal).toBe(0);
    expect(response.body.contas).toHaveLength(0);
    expect(response.body.projecao).toHaveLength(31);
  });

  test("saldoAtualTotal soma o saldoAtual de todas as contas ativas", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarConta(token, { nome: "Conta 1", saldoInicial: 100 });
    await criarConta(token, { nome: "Conta 2", saldoInicial: 250 });

    const response = await obterFluxo(token);

    expect(response.body.saldoAtualTotal).toBe(350);
  });

  test("título a receber em aberto entra como entrada no dia do vencimento", async () => {
    const { token } = await criarEmpresaComAdmin();

    const vencimento = dataMaisDias(5);
    await criarTitulo(token, "receber", 200, vencimento);

    const response = await obterFluxo(token);

    const dia = response.body.projecao.find((item) => item.data === vencimento);

    expect(dia).toBeDefined();
    expect(dia.entradas).toBe(200);
    expect(dia.saidas).toBe(0);
  });

  test("título a pagar em aberto entra como saída e reduz o saldo projetado dali em diante", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarConta(token, { saldoInicial: 1000 });

    const vencimento = dataMaisDias(3);
    await criarTitulo(token, "pagar", 300, vencimento);

    const response = await obterFluxo(token);

    const diaAntes = response.body.projecao.find(
      (item) => item.data === dataMaisDias(2),
    );
    const diaDepois = response.body.projecao.find(
      (item) => item.data === vencimento,
    );

    expect(diaAntes.saldoProjetado).toBe(1000);
    expect(diaDepois.saldoProjetado).toBe(700);
  });

  test("título já baixado (status paga) não entra na projeção", async () => {
    const { token } = await criarEmpresaComAdmin();

    const conta = await criarConta(token, { saldoInicial: 500 });
    const vencimento = dataMaisDias(2);
    const titulo = await criarTitulo(token, "pagar", 100, vencimento);

    await request(app)
      .patch(`/titulos/${titulo.body.id}/baixar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ contaBancariaId: conta.body.id });

    const response = await obterFluxo(token);

    const dia = response.body.projecao.find((item) => item.data === vencimento);

    expect(dia.entradas).toBe(0);
    expect(dia.saidas).toBe(0);
  });

  test("título com vencimento fora do intervalo filtrado não aparece na projeção", async () => {
    const { token } = await criarEmpresaComAdmin();

    const vencimento = dataMaisDias(60);
    await criarTitulo(token, "receber", 500, vencimento);

    const response = await obterFluxo(
      token,
      `?dataInicio=${dataMaisDias(0)}&dataFim=${dataMaisDias(30)}`,
    );

    const dia = response.body.projecao.find((item) => item.data === vencimento);

    expect(dia).toBeUndefined();
  });

  test("usuário sem financeiro.gerenciar recebe 403", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await obterFluxo(token);

    expect(response.status).toBe(403);
  });
});
