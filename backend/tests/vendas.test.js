const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarClienteEProduto(token, estoque = 20) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Teste" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "V-01", descricao: "Produto Venda", preco: 10, estoque });

  return { cliente: cliente.body, produto: produto.body };
}

describe("Vendas", () => {
  test("criar venda simples debita estoque e gera 1 título", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { cliente, produto } = await criarClienteEProduto(token);

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.id,
        itens: [{ produtoId: produto.id, quantidade: 5 }],
      });

    expect(venda.status).toBe(201);
    expect(venda.body.total).toBe("50");

    const produtoAtualizado = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(produtoAtualizado.body.estoque).toBe(15);

    const titulos = await request(app)
      .get(`/titulos?tipo=receber`)
      .set("Authorization", `Bearer ${token}`);

    expect(titulos.body).toHaveLength(1);
    expect(titulos.body[0].vendaId).toBe(venda.body.id);
  });

  test("criar venda parcelada gera N títulos cuja soma bate com o total", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { cliente, produto } = await criarClienteEProduto(token);

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.id,
        itens: [{ produtoId: produto.id, quantidade: 10 }],
        parcelas: 3,
      });

    expect(venda.status).toBe(201);

    const titulos = await request(app)
      .get(`/titulos?tipo=receber`)
      .set("Authorization", `Bearer ${token}`);

    const daVenda = titulos.body.filter((t) => t.vendaId === venda.body.id);
    expect(daVenda).toHaveLength(3);

    const somaParcelas = daVenda.reduce((soma, t) => soma + Number(t.valor), 0);
    expect(somaParcelas).toBeCloseTo(100, 2);
  });

  test("venda com quantidade maior que o estoque retorna 400 e não debita nada", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { cliente, produto } = await criarClienteEProduto(token, 5);

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.id,
        itens: [{ produtoId: produto.id, quantidade: 10 }],
      });

    expect(venda.status).toBe(400);

    const produtoInalterado = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(produtoInalterado.body.estoque).toBe(5);
  });

  test("cancelar venda reverte o estoque e cancela o título", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { cliente, produto } = await criarClienteEProduto(token, 20);

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.id,
        itens: [{ produtoId: produto.id, quantidade: 8 }],
      });

    const cancelamento = await request(app)
      .delete(`/vendas/${venda.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelamento.status).toBe(204);

    const produtoRevertido = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(produtoRevertido.body.estoque).toBe(20);

    const titulos = await request(app)
      .get(`/titulos?tipo=receber`)
      .set("Authorization", `Bearer ${token}`);

    const titulo = titulos.body.find((t) => t.vendaId === venda.body.id);
    expect(titulo.status).toBe("cancelada");
  });
});
