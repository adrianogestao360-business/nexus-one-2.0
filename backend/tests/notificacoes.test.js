const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin, adicionarUsuario } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

function diasAPartirDeHoje(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
}

async function criarTitulo(token, dados = {}) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Notificação" });

  const response = await request(app)
    .post("/titulos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo: "receber",
      descricao: "Título Notificação",
      valor: 100,
      vencimento: diasAPartirDeHoje(1),
      clienteId: cliente.body.id,
      ...dados,
    });

  return response.body;
}

async function criarEntregaViaExpedicao(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Entrega Notif" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "NT-01", descricao: "Produto Notif", preco: 10, estoque: 5 });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 1 }],
    });

  const separacoes = await request(app)
    .get("/separacoes")
    .set("Authorization", `Bearer ${token}`);
  const separacao = separacoes.body.find((s) => s.vendaId === venda.body.id);

  await request(app)
    .post(`/separacoes/${separacao.id}/assumir`)
    .set("Authorization", `Bearer ${token}`);

  const detalhada = await request(app)
    .get(`/separacoes/${separacao.id}`)
    .set("Authorization", `Bearer ${token}`);

  for (const item of detalhada.body.itens) {
    await request(app)
      .patch(`/separacoes/${separacao.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ separado: true });
  }

  await request(app)
    .post(`/separacoes/${separacao.id}/concluir`)
    .set("Authorization", `Bearer ${token}`);

  const veiculo = await request(app)
    .post("/veiculos")
    .set("Authorization", `Bearer ${token}`)
    .send({ placa: "NTF1234", modelo: "Van" });

  const motorista = await request(app)
    .post("/motoristas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Motorista Notif" });

  await request(app)
    .post(`/separacoes/${separacao.id}/expedir`)
    .set("Authorization", `Bearer ${token}`)
    .send({ veiculoId: veiculo.body.id, motoristaId: motorista.body.id });

  const entregas = await request(app)
    .get("/entregas")
    .set("Authorization", `Bearer ${token}`);

  return entregas.body.find((e) => e.separacaoId === separacao.id);
}

describe("Notificações - título vencendo", () => {
  test("título vencendo em breve aparece como aviso (warning)", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarTitulo(token, { vencimento: diasAPartirDeHoje(1) });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    const notificacao = response.body.find((n) => n.tipo === "titulo_vencendo");
    expect(notificacao).toBeDefined();
    expect(notificacao.severidade).toBe("warning");
  });

  test("título vencido aparece como erro (error)", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarTitulo(token, { vencimento: diasAPartirDeHoje(-2) });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "titulo_vencendo");
    expect(notificacao).toBeDefined();
    expect(notificacao.severidade).toBe("error");
  });

  test("título com vencimento distante não aparece", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarTitulo(token, { vencimento: diasAPartirDeHoje(30) });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "titulo_vencendo");
    expect(notificacao).toBeUndefined();
  });
});

describe("Notificações - estoque baixo", () => {
  test("produto abaixo do estoque mínimo aparece", async () => {
    const { token } = await criarEmpresaComAdmin();

    await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "EB-01", descricao: "Produto Baixo", estoque: 2, estoqueMinimo: 5 });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "estoque_baixo");
    expect(notificacao).toBeDefined();
  });

  test("produto com estoque suficiente não aparece", async () => {
    const { token } = await criarEmpresaComAdmin();

    await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "EB-02", descricao: "Produto OK", estoque: 50, estoqueMinimo: 5 });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "estoque_baixo");
    expect(notificacao).toBeUndefined();
  });
});

describe("Notificações - entrega atrasada", () => {
  test("entrega em rota há mais de 24h aparece como atrasada", async () => {
    const { token } = await criarEmpresaComAdmin();
    const entrega = await criarEntregaViaExpedicao(token);

    const dataAntiga = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await prisma.entrega.update({
      where: { id: entrega.id },
      data: { dataSaida: dataAntiga },
    });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "entrega_atrasada");
    expect(notificacao).toBeDefined();
    expect(notificacao.severidade).toBe("error");
  });

  test("entrega recente não aparece como atrasada", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarEntregaViaExpedicao(token);

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const notificacao = response.body.find((n) => n.tipo === "entrega_atrasada");
    expect(notificacao).toBeUndefined();
  });
});

describe("Notificações - marcar como lida", () => {
  test("marcar como lida remove a notificação da listagem do mesmo usuário", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarTitulo(token, { vencimento: diasAPartirDeHoje(1) });

    const antes = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);
    const notificacao = antes.body.find((n) => n.tipo === "titulo_vencendo");

    const marcar = await request(app)
      .post("/notificacoes/marcar-lida")
      .set("Authorization", `Bearer ${token}`)
      .send({ chave: notificacao.chave });
    expect(marcar.status).toBe(204);

    const depois = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);
    expect(
      depois.body.find((n) => n.chave === notificacao.chave),
    ).toBeUndefined();
  });

  test("notificação lida por um usuário continua aparecendo para outro", async () => {
    const { token, empresa, papel } = await criarEmpresaComAdmin();
    await criarTitulo(token, { vencimento: diasAPartirDeHoje(1) });

    const { token: tokenOutro } = await adicionarUsuario(empresa, papel);

    const lista1 = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);
    const notificacao = lista1.body.find((n) => n.tipo === "titulo_vencendo");

    await request(app)
      .post("/notificacoes/marcar-lida")
      .set("Authorization", `Bearer ${token}`)
      .send({ chave: notificacao.chave });

    const lista2 = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${tokenOutro}`);

    expect(
      lista2.body.find((n) => n.chave === notificacao.chave),
    ).toBeDefined();
  });
});
