const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarVenda(token, quantidade = 5, preco = 10) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Devolução" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `DEV-V-${Date.now()}-${Math.random()}`,
      descricao: "Produto Devolução",
      preco,
      estoque: 20,
    });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade }],
    });

  return { venda: venda.body, produto: produto.body };
}

async function criarCompra(token, quantidade = 5, preco = 10) {
  const fornecedor = await request(app)
    .post("/fornecedores")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Fornecedor Devolução" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `DEV-C-${Date.now()}-${Math.random()}`,
      descricao: "Produto Devolução Compra",
      preco,
    });

  const compra = await request(app)
    .post("/compras")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fornecedorId: fornecedor.body.id,
      itens: [
        { produtoId: produto.body.id, quantidade, precoUnitario: preco },
      ],
    });

  return { compra: compra.body, produto: produto.body };
}

describe("Devolução de venda", () => {
  test("devolução total: estoque volta e título a pagar é gerado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token, 5, 10);

    const estoqueAntes = await request(app)
      .get("/produtos")
      .set("Authorization", `Bearer ${token}`);
    const produtoAntes = estoqueAntes.body.find((p) => p.id === produto.id);
    expect(produtoAntes.estoque).toBe(15);

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Produto com defeito",
        itens: [{ produtoId: produto.id, quantidade: 5 }],
      });

    expect(response.status).toBe(201);
    expect(Number(response.body.valorTotal)).toBe(50);

    const estoqueDepois = await request(app)
      .get("/produtos")
      .set("Authorization", `Bearer ${token}`);
    const produtoDepois = estoqueDepois.body.find((p) => p.id === produto.id);
    expect(produtoDepois.estoque).toBe(20);

    const titulos = await request(app)
      .get("/titulos")
      .query({ tipo: "pagar" })
      .set("Authorization", `Bearer ${token}`);
    expect(
      titulos.body.some(
        (t) =>
          t.descricao === `Devolução Venda #${venda.id}` &&
          Number(t.valor) === 50,
      ),
    ).toBe(true);
  });

  test("devolução parcial funciona e pode ser complementada depois", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token, 10, 5);

    const primeira = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Devolução parcial 1",
        itens: [{ produtoId: produto.id, quantidade: 4 }],
      });
    expect(primeira.status).toBe(201);

    const segunda = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Devolução parcial 2",
        itens: [{ produtoId: produto.id, quantidade: 6 }],
      });
    expect(segunda.status).toBe(201);
  });

  test("devolver mais do que foi vendido retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token, 3, 10);

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Tentativa inválida",
        itens: [{ produtoId: produto.id, quantidade: 4 }],
      });

    expect(response.status).toBe(400);
  });

  test("devolver além do saldo já parcialmente devolvido retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token, 5, 10);

    await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Primeira devolução",
        itens: [{ produtoId: produto.id, quantidade: 4 }],
      });

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Segunda devolução excedente",
        itens: [{ produtoId: produto.id, quantidade: 2 }],
      });

    expect(response.status).toBe(400);
  });

  test("devolução sem motivo retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token);

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({ itens: [{ produtoId: produto.id, quantidade: 1 }] });

    expect(response.status).toBe(400);
  });

  test("devolução de venda cancelada retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto } = await criarVenda(token);

    await request(app)
      .delete(`/vendas/${venda.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Tentativa em venda cancelada",
        itens: [{ produtoId: produto.id, quantidade: 1 }],
      });

    expect(response.status).toBe(400);
  });

  test("devolução de produto que não pertence à venda retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda } = await criarVenda(token);

    const outroProduto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: `DEV-OUTRO-${Date.now()}`, descricao: "Outro Produto", preco: 10, estoque: 5 });

    const response = await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Produto errado",
        itens: [{ produtoId: outroProduto.body.id, quantidade: 1 }],
      });

    expect(response.status).toBe(400);
  });
});

describe("Devolução de compra", () => {
  test("devolução de compra debita estoque e gera título a receber", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 5, 20);

    const response = await request(app)
      .post(`/compras/${compra.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Produto fora da especificação",
        itens: [{ produtoId: produto.id, quantidade: 2 }],
      });

    expect(response.status).toBe(201);
    expect(Number(response.body.valorTotal)).toBe(40);

    const produtos = await request(app)
      .get("/produtos")
      .set("Authorization", `Bearer ${token}`);
    const produtoDepois = produtos.body.find((p) => p.id === produto.id);
    expect(produtoDepois.estoque).toBe(3);

    const titulos = await request(app)
      .get("/titulos")
      .query({ tipo: "receber" })
      .set("Authorization", `Bearer ${token}`);
    expect(
      titulos.body.some(
        (t) =>
          t.descricao === `Devolução Compra #${compra.id}` &&
          Number(t.valor) === 40,
      ),
    ).toBe(true);
  });

  test("devolver mais do que foi comprado retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { compra, produto } = await criarCompra(token, 3, 10);

    const response = await request(app)
      .post(`/compras/${compra.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Tentativa inválida",
        itens: [{ produtoId: produto.id, quantidade: 4 }],
      });

    expect(response.status).toBe(400);
  });
});

describe("Listagem de devoluções", () => {
  test("GET /devolucoes lista devoluções de vendas e compras da empresa", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { venda, produto: produtoVenda } = await criarVenda(token, 2, 10);
    const { compra, produto: produtoCompra } = await criarCompra(token, 2, 10);

    await request(app)
      .post(`/vendas/${venda.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Devolução para listagem",
        itens: [{ produtoId: produtoVenda.id, quantidade: 1 }],
      });

    await request(app)
      .post(`/compras/${compra.id}/devolucoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivo: "Devolução para listagem",
        itens: [{ produtoId: produtoCompra.id, quantidade: 1 }],
      });

    const response = await request(app)
      .get("/devolucoes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.filter((d) => d.tipo === "venda")).toHaveLength(1);
    expect(response.body.filter((d) => d.tipo === "compra")).toHaveLength(1);
  });
});
