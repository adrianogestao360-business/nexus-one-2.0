const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProdutoComEstoque(token, estoque = 20) {
  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `BR-${Date.now()}-${Math.random()}`,
      descricao: "Produto Bloqueio Reserva",
      preco: 10,
      estoque,
    });

  const estoques = await request(app)
    .get(`/estoque-localizacoes?produtoId=${produto.body.id}`)
    .set("Authorization", `Bearer ${token}`);

  return { produto: produto.body, localizacaoId: estoques.body[0].localizacaoId };
}

async function buscarEstoqueLocalizacao(token, produtoId) {
  const response = await request(app)
    .get(`/estoque-localizacoes?produtoId=${produtoId}`)
    .set("Authorization", `Bearer ${token}`);
  return response.body[0];
}

describe("Bloqueio, desbloqueio, reserva e liberação de reserva", () => {
  test("bloquear reduz disponível sem alterar a quantidade física total", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 30);

    const response = await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 10, motivo: "Suspeita de avaria" });

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe("bloqueio");

    const estoque = await buscarEstoqueLocalizacao(token, produto.id);
    expect(estoque.quantidade).toBe(30);
    expect(estoque.quantidadeBloqueada).toBe(10);
  });

  test("bloquear mais que o disponível é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 10);

    const response = await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 15, motivo: "Teste" });

    expect(response.status).toBe(400);
  });

  test("desbloquear devolve a quantidade para disponível", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 20);

    await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 12, motivo: "Bloqueio" });

    const response = await request(app)
      .post("/movimentos-estoque/desbloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 5, motivo: "Liberado após inspeção" });

    expect(response.status).toBe(201);
    expect(response.body.tipo).toBe("desbloqueio");

    const estoque = await buscarEstoqueLocalizacao(token, produto.id);
    expect(estoque.quantidadeBloqueada).toBe(7);
  });

  test("desbloquear mais do que está bloqueado é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 20);

    await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 3, motivo: "Bloqueio" });

    const response = await request(app)
      .post("/movimentos-estoque/desbloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 10, motivo: "Excede" });

    expect(response.status).toBe(400);
  });

  test("reservar reduz disponível e liberar reserva devolve", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 25);

    await request(app)
      .post("/movimentos-estoque/reservar")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 8, motivo: "Pedido em elaboração" });

    let estoque = await buscarEstoqueLocalizacao(token, produto.id);
    expect(estoque.quantidadeReservada).toBe(8);

    const liberar = await request(app)
      .post("/movimentos-estoque/liberar-reserva")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 8, motivo: "Pedido cancelado" });

    expect(liberar.status).toBe(201);
    expect(liberar.body.tipo).toBe("liberacao_reserva");

    estoque = await buscarEstoqueLocalizacao(token, produto.id);
    expect(estoque.quantidadeReservada).toBe(0);
  });

  test("reservar mais que o disponível (considerando já bloqueado) é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 10);

    await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 6, motivo: "Bloqueio" });

    const response = await request(app)
      .post("/movimentos-estoque/reservar")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 5, motivo: "Reserva" });

    expect(response.status).toBe(400);
  });

  test("venda não consegue consumir estoque bloqueado (fica indisponível para auto-seleção)", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 10);

    await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: produto.id, localizacaoId, quantidade: 8, motivo: "Bloqueio total quase" });

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Bloqueio" });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.id, quantidade: 5 }],
      });

    expect(venda.status).toBe(409);
  });

  test("venda continua funcionando normalmente sem bloqueio/reserva", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto } = await criarProdutoComEstoque(token, 10);

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Normal" });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.id, quantidade: 5 }],
      });

    expect(venda.status).toBe(201);
  });

  test("movimento manual de saída aceita origem avaria/perda", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 15);

    const response = await request(app)
      .post("/movimentos-estoque")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoId,
        tipo: "saida",
        quantidade: 3,
        motivo: "Caixa amassada",
        origem: "avaria",
      });

    expect(response.status).toBe(201);
    expect(response.body.origem).toBe("avaria");
  });

  test("origem inválida em movimento manual cai para manual", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, localizacaoId } = await criarProdutoComEstoque(token, 15);

    const response = await request(app)
      .post("/movimentos-estoque")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoId,
        tipo: "saida",
        quantidade: 2,
        motivo: "Teste",
        origem: "qualquer-coisa",
      });

    expect(response.body.origem).toBe("manual");
  });

  test("usuário sem estoque.gerenciar recebe 403 ao bloquear", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await request(app)
      .post("/movimentos-estoque/bloquear")
      .set("Authorization", `Bearer ${token}`)
      .send({ produtoId: 1, localizacaoId: 1, quantidade: 1, motivo: "x" });

    expect(response.status).toBe(403);
  });
});
