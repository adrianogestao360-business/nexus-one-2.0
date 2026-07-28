const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarCompra(token, quantidade = 20, precoUnitario = 8) {
  const fornecedor = await request(app)
    .post("/fornecedores")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Fornecedor Conferência" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `CF-${Date.now()}-${Math.random()}`,
      descricao: "Produto Conferência",
      preco: 10,
    });

  const compra = await request(app)
    .post("/compras")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fornecedorId: fornecedor.body.id,
      itens: [{ produtoId: produto.body.id, quantidade, precoUnitario }],
    });

  return { compra: compra.body, produto: produto.body };
}

async function buscarProduto(token, id) {
  const response = await request(app)
    .get(`/produtos/${id}`)
    .set("Authorization", `Bearer ${token}`);
  return response.body;
}

describe("Conferência de recebimento", () => {
  test("abrir conferência cria um item com a quantidadePedida da compra", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 30);

    const response = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("aberta");
    expect(response.body.itens).toHaveLength(1);
    expect(response.body.itens[0].produtoId).toBe(produto.id);
    expect(response.body.itens[0].quantidadePedida).toBe(30);
    expect(response.body.itens[0].quantidadeRecebida).toBeNull();
  });

  test("abrir conferência para compra inexistente retorna 404", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/compras/999999/conferencia")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(404);
  });

  test("abrir conferência para compra cancelada é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra } = await criarCompra(token, 10);

    await request(app)
      .delete(`/compras/${compra.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test("não é possível abrir uma segunda conferência enquanto a primeira está aberta", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra } = await criarCompra(token, 10);

    await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const response = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test("concluir sem divergência não gera movimento de ajuste nem altera o estoque", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 20);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const item = conferencia.body.itens[0];

    await request(app)
      .put(`/conferencias/${conferencia.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeRecebida: 20 });

    const concluir = await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    expect(concluir.status).toBe(200);
    expect(concluir.body.status).toBe("concluida");

    const produtoAtualizado = await buscarProduto(token, produto.id);
    expect(produtoAtualizado.estoque).toBe(20);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajustes = movimentos.body.filter(
      (m) => m.origem === "conferencia_recebimento",
    );
    expect(ajustes).toHaveLength(0);
  });

  test("concluir com sobra gera entrada de ajuste e aumenta o estoque", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 20);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const item = conferencia.body.itens[0];

    await request(app)
      .put(`/conferencias/${conferencia.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeRecebida: 25 });

    await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.id);
    expect(produtoAtualizado.estoque).toBe(25);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajuste = movimentos.body.find(
      (m) => m.origem === "conferencia_recebimento",
    );
    expect(ajuste.tipo).toBe("entrada");
    expect(ajuste.quantidade).toBe(5);
  });

  test("concluir com falta gera saída de ajuste e reduz o estoque", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 20);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const item = conferencia.body.itens[0];

    await request(app)
      .put(`/conferencias/${conferencia.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeRecebida: 14 });

    await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.id);
    expect(produtoAtualizado.estoque).toBe(14);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajuste = movimentos.body.find(
      (m) => m.origem === "conferencia_recebimento",
    );
    expect(ajuste.tipo).toBe("saida");
    expect(ajuste.quantidade).toBe(6);
  });

  test("item não conferido é ignorado no fechamento", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 12);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.id);
    expect(produtoAtualizado.estoque).toBe(12);
  });

  test("concluir uma conferência já concluída é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra } = await criarCompra(token, 10);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("registrar recebimento em conferência já concluída é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra } = await criarCompra(token, 10);

    const conferencia = await request(app)
      .post(`/compras/${compra.id}/conferencia`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    const item = conferencia.body.itens[0];

    await request(app)
      .post(`/conferencias/${conferencia.body.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .put(`/conferencias/${conferencia.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeRecebida: 5 });

    expect(response.status).toBe(400);
  });

  test("usuário sem compras.gerenciar recebe 403 ao abrir conferência", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await request(app)
      .post("/compras/1/conferencia")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(403);
  });
});
