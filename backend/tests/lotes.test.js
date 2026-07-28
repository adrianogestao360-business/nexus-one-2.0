const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProduto(token, controlaLote = true) {
  return request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `LOTE-${Date.now()}-${Math.random()}`,
      descricao: "Produto Lote",
      preco: 10,
      controlaLote,
    });
}

async function movimentar(token, dados) {
  return request(app)
    .post("/movimentos-estoque")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo: "entrada",
      quantidade: 10,
      motivo: "Recebimento",
      ...dados,
    });
}

describe("Lote e validade", () => {
  test("produto com controlaLote exige loteNumero na entrada", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    const response = await movimentar(token, {
      produtoId: produto.body.id,
      tipo: "entrada",
      quantidade: 5,
    });

    expect(response.status).toBe(400);
  });

  test("entrada com loteNumero cria um novo lote com a quantidade e validade informadas", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    const response = await movimentar(token, {
      produtoId: produto.body.id,
      tipo: "entrada",
      quantidade: 20,
      loteNumero: "L001",
      loteValidade: "2027-01-01",
    });

    expect(response.status).toBe(201);
    expect(response.body.loteId).toBeDefined();

    const lotes = await request(app)
      .get(`/lotes?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(lotes.body).toHaveLength(1);
    expect(lotes.body[0].numero).toBe("L001");
    expect(lotes.body[0].quantidade).toBe(20);
  });

  test("segunda entrada com o mesmo número de lote acumula na mesma linha", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 20,
      loteNumero: "L002",
      loteValidade: "2027-01-01",
    });

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 15,
      loteNumero: "L002",
    });

    const lotes = await request(app)
      .get(`/lotes?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(lotes.body).toHaveLength(1);
    expect(lotes.body[0].quantidade).toBe(35);
  });

  test("saída com número de lote inexistente é rejeitada", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 50,
      loteNumero: "L-EXISTENTE",
      loteValidade: "2027-01-01",
    });

    const response = await movimentar(token, {
      produtoId: produto.body.id,
      tipo: "saida",
      quantidade: 5,
      loteNumero: "INEXISTENTE",
    });

    expect(response.status).toBe(404);
  });

  test("saída maior que o saldo do lote é rejeitada", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 10,
      loteNumero: "L003",
      loteValidade: "2027-01-01",
    });

    const response = await movimentar(token, {
      produtoId: produto.body.id,
      tipo: "saida",
      quantidade: 999,
      loteNumero: "L003",
    });

    expect(response.status).toBe(400);
  });

  test("saída válida decrementa a quantidade do lote", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 10,
      loteNumero: "L004",
      loteValidade: "2027-01-01",
    });

    await movimentar(token, {
      produtoId: produto.body.id,
      tipo: "saida",
      quantidade: 4,
      loteNumero: "L004",
    });

    const lotes = await request(app)
      .get(`/lotes?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(lotes.body[0].quantidade).toBe(6);
  });

  test("produto sem controlaLote não exige loteNumero e não cria lote", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, false);

    const response = await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 8,
    });

    expect(response.status).toBe(201);
    expect(response.body.loteId).toBeNull();

    const lotes = await request(app)
      .get(`/lotes?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(lotes.body).toHaveLength(0);
  });

  test("notificações alertam lote já vencido, mas não lote com validade distante", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProduto(token, true);

    const vencido = new Date();
    vencido.setDate(vencido.getDate() - 1);

    const distante = new Date();
    distante.setDate(distante.getDate() + 60);

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 10,
      loteNumero: "JA-VENCEU",
      loteValidade: vencido.toISOString().slice(0, 10),
    });

    await movimentar(token, {
      produtoId: produto.body.id,
      quantidade: 10,
      loteNumero: "DISTANTE",
      loteValidade: distante.toISOString().slice(0, 10),
    });

    const response = await request(app)
      .get("/notificacoes")
      .set("Authorization", `Bearer ${token}`);

    const mensagens = response.body.map((item) => item.mensagem).join(" | ");

    expect(mensagens).toContain("JA-VENCEU");
    expect(mensagens).not.toContain("DISTANTE");
  });
});
