const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarFornecedorEProduto(token) {
  const fornecedor = await request(app)
    .post("/fornecedores")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Fornecedor Teste" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "C-01", descricao: "Produto Compra", preco: 8 });

  return { fornecedor: fornecedor.body, produto: produto.body };
}

describe("Compras", () => {
  test("criar compra credita estoque na localização GERAL e gera título a pagar", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { fornecedor, produto } = await criarFornecedorEProduto(token);

    const compra = await request(app)
      .post("/compras")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fornecedorId: fornecedor.id,
        itens: [{ produtoId: produto.id, quantidade: 15, precoUnitario: 8 }],
      });

    expect(compra.status).toBe(201);

    const produtoAtualizado = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(produtoAtualizado.body.estoque).toBe(15);

    const titulos = await request(app)
      .get(`/titulos?tipo=pagar`)
      .set("Authorization", `Bearer ${token}`);

    expect(titulos.body.some((t) => t.compraId === compra.body.id)).toBe(true);
  });

  test("cancelar compra reverte o estoque e cancela o título", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { fornecedor, produto } = await criarFornecedorEProduto(token);

    const compra = await request(app)
      .post("/compras")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fornecedorId: fornecedor.id,
        itens: [{ produtoId: produto.id, quantidade: 12, precoUnitario: 8 }],
      });

    const cancelamento = await request(app)
      .delete(`/compras/${compra.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelamento.status).toBe(204);

    const produtoRevertido = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(produtoRevertido.body.estoque).toBe(0);
  });
});
