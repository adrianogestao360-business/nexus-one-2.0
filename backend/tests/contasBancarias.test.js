const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarConta(token, dados = {}) {
  return request(app)
    .post("/contas-bancarias")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Banco Teste", ...dados });
}

async function criarTitulo(token, tipo, valor = 100) {
  return request(app)
    .post("/titulos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo,
      descricao: "Titulo Conta Bancaria",
      valor,
      vencimento: new Date().toISOString().slice(0, 10),
    });
}

describe("Contas bancárias", () => {
  test("cria uma conta bancária com valores padrão", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await criarConta(token);

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe("banco");
    expect(Number(response.body.saldoInicial)).toBe(0);
  });

  test("nome é obrigatório", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await criarConta(token, { nome: "" });

    expect(response.status).toBe(400);
  });

  test("tipo inválido é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await criarConta(token, { tipo: "cofre" });

    expect(response.status).toBe(400);
  });

  test("listar retorna a conta com saldoAtual calculado a partir do saldoInicial", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarConta(token, { saldoInicial: 500 });

    const response = await request(app)
      .get("/contas-bancarias")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].saldoAtual).toBe(500);
  });

  test("saldoAtual soma títulos a receber pagos e subtrai títulos a pagar pagos", async () => {
    const { token } = await criarEmpresaComAdmin();

    const conta = await criarConta(token, { saldoInicial: 100 });

    const receber = await criarTitulo(token, "receber", 300);
    const pagar = await criarTitulo(token, "pagar", 50);

    await request(app)
      .patch(`/titulos/${receber.body.id}/baixar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ contaBancariaId: conta.body.id });

    await request(app)
      .patch(`/titulos/${pagar.body.id}/baixar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ contaBancariaId: conta.body.id });

    const response = await request(app)
      .get("/contas-bancarias")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body[0].saldoAtual).toBe(350);
  });

  test("título aberto (não baixado) não entra no saldoAtual", async () => {
    const { token } = await criarEmpresaComAdmin();

    const conta = await criarConta(token, { saldoInicial: 100 });
    await criarTitulo(token, "receber", 999);

    const response = await request(app)
      .get("/contas-bancarias")
      .set("Authorization", `Bearer ${token}`);

    expect(response.body[0].saldoAtual).toBe(100);
    expect(response.body[0].id).toBe(conta.body.id);
  });

  test("atualizar altera nome e saldoInicial", async () => {
    const { token } = await criarEmpresaComAdmin();

    const conta = await criarConta(token, { saldoInicial: 10 });

    const response = await request(app)
      .put(`/contas-bancarias/${conta.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Banco Atualizado", saldoInicial: 20 });

    expect(response.status).toBe(200);
    expect(response.body.nome).toBe("Banco Atualizado");
    expect(Number(response.body.saldoInicial)).toBe(20);
  });

  test("desativar remove a conta da listagem", async () => {
    const { token } = await criarEmpresaComAdmin();

    const conta = await criarConta(token);

    const destroyResponse = await request(app)
      .delete(`/contas-bancarias/${conta.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(destroyResponse.status).toBe(204);

    const listResponse = await request(app)
      .get("/contas-bancarias")
      .set("Authorization", `Bearer ${token}`);

    expect(listResponse.body).toHaveLength(0);
  });

  test("conta de outra empresa não é encontrada", async () => {
    const { token: tokenA } = await criarEmpresaComAdmin();
    const { token: tokenB } = await criarEmpresaComAdmin();

    const conta = await criarConta(tokenA);

    const response = await request(app)
      .put(`/contas-bancarias/${conta.body.id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ nome: "Invasão" });

    expect(response.status).toBe(404);
  });

  test("baixar título sem contaBancariaId é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();

    const titulo = await criarTitulo(token, "pagar", 40);

    const response = await request(app)
      .patch(`/titulos/${titulo.body.id}/baixar`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test("baixar título com contaBancariaId de outra empresa é rejeitado", async () => {
    const { token: tokenA } = await criarEmpresaComAdmin();
    const { token: tokenB } = await criarEmpresaComAdmin();

    const contaB = await criarConta(tokenB);
    const tituloA = await criarTitulo(tokenA, "pagar", 40);

    const response = await request(app)
      .patch(`/titulos/${tituloA.body.id}/baixar`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ contaBancariaId: contaB.body.id });

    expect(response.status).toBe(404);
  });

  test("usuário sem financeiro.gerenciar recebe 403 ao criar conta", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await criarConta(token);

    expect(response.status).toBe(403);
  });
});
