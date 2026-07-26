const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProdutoEmDuasLocalizacoes(token) {
  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "L-01", descricao: "Produto Localização", preco: 10, estoque: 30 });

  const localizacaoA = await request(app)
    .post("/localizacoes")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "A1" });

  // move 20 unidades da GERAL para a localização A1, deixando 10 na GERAL e 20 na A1
  const geralList = await request(app)
    .get(`/estoque-localizacoes?produtoId=${produto.body.id}`)
    .set("Authorization", `Bearer ${token}`);
  const geralId = geralList.body[0].localizacaoId;

  await request(app)
    .post("/movimentos-estoque")
    .set("Authorization", `Bearer ${token}`)
    .send({
      produtoId: produto.body.id,
      tipo: "saida",
      quantidade: 20,
      motivo: "Transferência para A1",
      localizacaoId: geralId,
    });

  await request(app)
    .post("/movimentos-estoque")
    .set("Authorization", `Bearer ${token}`)
    .send({
      produtoId: produto.body.id,
      tipo: "entrada",
      quantidade: 20,
      motivo: "Transferência de GERAL",
      localizacaoId: localizacaoA.body.id,
    });

  return { produto: produto.body, geralId, localizacaoAId: localizacaoA.body.id };
}

describe("Estoque por localização", () => {
  test("venda que excede uma localização específica consome automaticamente de mais de uma", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, geralId, localizacaoAId } =
      await criarProdutoEmDuasLocalizacoes(token);
    // saldo: GERAL=10, A1=20, total=30

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Multi Localização" });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.id, quantidade: 25 }],
      });

    expect(venda.status).toBe(201);
    expect(venda.body.movimentos).toHaveLength(2);

    const movimentoGeral = venda.body.movimentos.find(
      (m) => m.localizacaoId === geralId,
    );
    const movimentoA1 = venda.body.movimentos.find(
      (m) => m.localizacaoId === localizacaoAId,
    );

    expect(movimentoGeral.quantidade).toBe(10);
    expect(movimentoA1.quantidade).toBe(15);

    const saldos = await request(app)
      .get(`/estoque-localizacoes?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saldoGeral = saldos.body.find((s) => s.localizacaoId === geralId);
    const saldoA1 = saldos.body.find((s) => s.localizacaoId === localizacaoAId);

    expect(saldoGeral.quantidade).toBe(0);
    expect(saldoA1.quantidade).toBe(5);
  });

  test("cancelar venda multi-localização devolve exatamente para cada localização de origem", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, geralId, localizacaoAId } =
      await criarProdutoEmDuasLocalizacoes(token);

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Cancelamento" });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.id, quantidade: 25 }],
      });

    await request(app)
      .delete(`/vendas/${venda.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saldos = await request(app)
      .get(`/estoque-localizacoes?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saldoGeral = saldos.body.find((s) => s.localizacaoId === geralId);
    const saldoA1 = saldos.body.find((s) => s.localizacaoId === localizacaoAId);

    expect(saldoGeral.quantidade).toBe(10);
    expect(saldoA1.quantidade).toBe(20);
  });

  test("saída manual maior que o saldo de uma localização específica retorna 400, mesmo com saldo total suficiente em outra", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoAId } =
      await criarProdutoEmDuasLocalizacoes(token);
    // A1 tem 20, GERAL tem 10, total 30 — pedir 25 só da A1 deve falhar

    const response = await request(app)
      .post("/movimentos-estoque")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        tipo: "saida",
        quantidade: 25,
        motivo: "Teste saldo insuficiente",
        localizacaoId: localizacaoAId,
      });

    expect(response.status).toBe(400);
  });
});
