const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProdutoComLote(token, controlaLote = true) {
  return request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `FEFO-${Date.now()}-${Math.random()}`,
      descricao: "Produto FEFO",
      preco: 10,
      controlaLote,
    });
}

async function entradaComLote(token, produtoId, quantidade, loteNumero, loteValidade) {
  return request(app)
    .post("/movimentos-estoque")
    .set("Authorization", `Bearer ${token}`)
    .send({
      produtoId,
      tipo: "entrada",
      quantidade,
      motivo: "Recebimento",
      loteNumero,
      loteValidade,
    });
}

async function criarClienteEVenda(token, produtoId, quantidade) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente FEFO" });

  return request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId, quantidade }],
    });
}

async function listarLotes(token, produtoId) {
  const response = await request(app)
    .get(`/lotes?produtoId=${produtoId}`)
    .set("Authorization", `Bearer ${token}`);
  return response.body;
}

describe("FIFO/FEFO automático na venda", () => {
  test("venda consome primeiro o lote com validade mais próxima (FEFO)", async () => {
    const { token } = await criarEmpresaComAdmin();
    const produto = await criarProdutoComLote(token);

    await entradaComLote(token, produto.body.id, 10, "DISTANTE", "2027-06-01");
    await entradaComLote(token, produto.body.id, 10, "PROXIMO", "2026-09-01");

    const venda = await criarClienteEVenda(token, produto.body.id, 5);
    expect(venda.status).toBe(201);

    const lotes = await listarLotes(token, produto.body.id);
    const proximo = lotes.find((l) => l.numero === "PROXIMO");
    const distante = lotes.find((l) => l.numero === "DISTANTE");

    expect(proximo.quantidade).toBe(5);
    expect(distante.quantidade).toBe(10);
  });

  test("quando o lote mais próximo não cobre tudo, consome o próximo também", async () => {
    const { token } = await criarEmpresaComAdmin();
    const produto = await criarProdutoComLote(token);

    await entradaComLote(token, produto.body.id, 10, "DISTANTE", "2027-06-01");
    await entradaComLote(token, produto.body.id, 4, "PROXIMO", "2026-09-01");

    const venda = await criarClienteEVenda(token, produto.body.id, 7);
    expect(venda.status).toBe(201);

    const lotes = await listarLotes(token, produto.body.id);
    const proximo = lotes.find((l) => l.numero === "PROXIMO");
    const distante = lotes.find((l) => l.numero === "DISTANTE");

    expect(proximo.quantidade).toBe(0);
    expect(distante.quantidade).toBe(7);
  });

  test("lote sem validade só é consumido depois dos lotes com validade", async () => {
    const { token } = await criarEmpresaComAdmin();
    const produto = await criarProdutoComLote(token);

    await entradaComLote(token, produto.body.id, 10, "SEM-VALIDADE", undefined);
    await entradaComLote(token, produto.body.id, 10, "COM-VALIDADE", "2026-09-01");

    const venda = await criarClienteEVenda(token, produto.body.id, 5);
    expect(venda.status).toBe(201);

    const lotes = await listarLotes(token, produto.body.id);
    const semValidade = lotes.find((l) => l.numero === "SEM-VALIDADE");
    const comValidade = lotes.find((l) => l.numero === "COM-VALIDADE");

    expect(comValidade.quantidade).toBe(5);
    expect(semValidade.quantidade).toBe(10);
  });

  test("quando o lote não cobre toda a quantidade, o restante sai sem lote (não bloqueia a venda)", async () => {
    const { token } = await criarEmpresaComAdmin();

    // estoque inicial do cadastro nunca cria lote, mesmo com controlaLote true
    // (só o fluxo de "Novo Movimento" cria lote) — simula estoque legado sem lote
    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        codigo: `FEFO-${Date.now()}-${Math.random()}`,
        descricao: "Produto FEFO Parcial",
        preco: 10,
        estoque: 3,
        controlaLote: true,
      });

    // 3 unidades novas entram já rastreadas por lote
    await entradaComLote(token, produto.body.id, 3, "PARCIAL", "2027-01-01");

    // vende as 6 (3 legadas sem lote + 3 do lote PARCIAL)
    const venda = await criarClienteEVenda(token, produto.body.id, 6);

    expect(venda.status).toBe(201);

    const lotes = await listarLotes(token, produto.body.id);
    expect(lotes.find((l) => l.numero === "PARCIAL").quantidade).toBe(0);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saidaVenda = movimentos.body.filter(
      (m) => m.origem === "venda" && m.tipo === "saida",
    );
    const semLote = saidaVenda.filter((m) => m.loteId === null);
    expect(semLote.length).toBeGreaterThan(0);
    expect(semLote.reduce((soma, m) => soma + m.quantidade, 0)).toBe(3);
  });

  test("cancelar a venda devolve a quantidade ao lote de origem", async () => {
    const { token } = await criarEmpresaComAdmin();
    const produto = await criarProdutoComLote(token);

    await entradaComLote(token, produto.body.id, 10, "L001", "2027-01-01");

    const venda = await criarClienteEVenda(token, produto.body.id, 4);

    let lotes = await listarLotes(token, produto.body.id);
    expect(lotes.find((l) => l.numero === "L001").quantidade).toBe(6);

    await request(app)
      .delete(`/vendas/${venda.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    lotes = await listarLotes(token, produto.body.id);
    expect(lotes.find((l) => l.numero === "L001").quantidade).toBe(10);
  });

  test("produto sem controlaLote continua vendendo normalmente, sem loteId", async () => {
    const { token } = await criarEmpresaComAdmin();
    const produto = await criarProdutoComLote(token, false);

    await request(app)
      .post("/movimentos-estoque")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.body.id,
        tipo: "entrada",
        quantidade: 10,
        motivo: "Recebimento sem lote",
      });

    const venda = await criarClienteEVenda(token, produto.body.id, 5);
    expect(venda.status).toBe(201);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saidaVenda = movimentos.body.find(
      (m) => m.origem === "venda" && m.tipo === "saida",
    );
    expect(saidaVenda.loteId).toBeNull();
  });
});
