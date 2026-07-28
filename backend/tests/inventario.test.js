const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProdutoComEstoque(token, estoque = 20) {
  return request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `INV-${Date.now()}-${Math.random()}`,
      descricao: "Produto Inventário",
      preco: 10,
      estoque,
    });
}

async function abrirInventario(token, dados = {}) {
  return request(app)
    .post("/inventarios")
    .set("Authorization", `Bearer ${token}`)
    .send(dados);
}

async function buscarProduto(token, id) {
  const response = await request(app)
    .get(`/produtos/${id}`)
    .set("Authorization", `Bearer ${token}`);
  return response.body;
}

describe("Inventário físico", () => {
  test("abrir inventário sem nenhum saldo de estoque é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await abrirInventario(token, { tipo: "geral" });

    expect(response.status).toBe(400);
  });

  test("abrir inventário geral cria um item por produto/localização com saldo, com quantidadeSistema correta", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProdutoComEstoque(token, 30);

    const response = await abrirInventario(token, { tipo: "geral" });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("aberto");
    expect(response.body.itens).toHaveLength(1);
    expect(response.body.itens[0].produtoId).toBe(produto.body.id);
    expect(response.body.itens[0].quantidadeSistema).toBe(30);
    expect(response.body.itens[0].quantidadeContada).toBeNull();
  });

  test("abrir inventário filtrado por produtoId inclui só aquele produto", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produtoA = await criarProdutoComEstoque(token, 10);
    await criarProdutoComEstoque(token, 15);

    const response = await abrirInventario(token, {
      tipo: "rotativo",
      produtoId: produtoA.body.id,
    });

    expect(response.status).toBe(201);
    expect(response.body.itens).toHaveLength(1);
    expect(response.body.itens[0].produtoId).toBe(produtoA.body.id);
  });

  test("registrar contagem em inventário fechado é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarProdutoComEstoque(token, 10);
    const inventario = await abrirInventario(token, { tipo: "geral" });

    await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const item = inventario.body.itens[0];

    const response = await request(app)
      .put(`/inventarios/${inventario.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeContada: 10 });

    expect(response.status).toBe(400);
  });

  test("fechar inventário sem divergência não gera movimento de ajuste", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProdutoComEstoque(token, 20);
    const inventario = await abrirInventario(token, { tipo: "geral" });
    const item = inventario.body.itens[0];

    await request(app)
      .put(`/inventarios/${inventario.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeContada: 20 });

    const fecharResponse = await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    expect(fecharResponse.status).toBe(200);
    expect(fecharResponse.body.status).toBe("fechado");

    const produtoAtualizado = await buscarProduto(token, produto.body.id);
    expect(produtoAtualizado.estoque).toBe(20);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajustes = movimentos.body.filter(
      (m) => m.origem === "ajuste_inventario",
    );
    expect(ajustes).toHaveLength(0);
  });

  test("fechar inventário com contagem maior que o sistema gera entrada de ajuste e aumenta o estoque", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProdutoComEstoque(token, 20);
    const inventario = await abrirInventario(token, { tipo: "geral" });
    const item = inventario.body.itens[0];

    await request(app)
      .put(`/inventarios/${inventario.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeContada: 35 });

    await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.body.id);
    expect(produtoAtualizado.estoque).toBe(35);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajuste = movimentos.body.find(
      (m) => m.origem === "ajuste_inventario",
    );
    expect(ajuste.tipo).toBe("entrada");
    expect(ajuste.quantidade).toBe(15);
  });

  test("fechar inventário com contagem menor que o sistema gera saída de ajuste e reduz o estoque", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProdutoComEstoque(token, 20);
    const inventario = await abrirInventario(token, { tipo: "geral" });
    const item = inventario.body.itens[0];

    await request(app)
      .put(`/inventarios/${inventario.body.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantidadeContada: 6 });

    await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.body.id);
    expect(produtoAtualizado.estoque).toBe(6);

    const movimentos = await request(app)
      .get(`/movimentos-estoque?produtoId=${produto.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const ajuste = movimentos.body.find(
      (m) => m.origem === "ajuste_inventario",
    );
    expect(ajuste.tipo).toBe("saida");
    expect(ajuste.quantidade).toBe(14);
  });

  test("item não contado é ignorado no fechamento", async () => {
    const { token } = await criarEmpresaComAdmin();

    const produto = await criarProdutoComEstoque(token, 12);
    const inventario = await abrirInventario(token, { tipo: "geral" });

    await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const produtoAtualizado = await buscarProduto(token, produto.body.id);
    expect(produtoAtualizado.estoque).toBe(12);
  });

  test("fechar um inventário já fechado é rejeitado", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarProdutoComEstoque(token, 5);
    const inventario = await abrirInventario(token, { tipo: "geral" });

    await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post(`/inventarios/${inventario.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  test("usuário sem estoque.gerenciar recebe 403 ao abrir inventário", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await abrirInventario(token, { tipo: "geral" });

    expect(response.status).toBe(403);
  });
});
