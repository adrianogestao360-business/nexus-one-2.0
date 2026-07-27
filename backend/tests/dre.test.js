const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarVenda(token, valor = 100) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente DRE" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: `DRE-V-${Date.now()}-${Math.random()}`, descricao: "Produto DRE", preco: valor, estoque: 10 });

  return request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 1 }],
    });
}

async function criarCompra(token, valor = 50) {
  const fornecedor = await request(app)
    .post("/fornecedores")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Fornecedor DRE" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: `DRE-C-${Date.now()}-${Math.random()}`, descricao: "Produto DRE Compra", preco: 10 });

  return request(app)
    .post("/compras")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fornecedorId: fornecedor.body.id,
      itens: [
        { produtoId: produto.body.id, quantidade: 1, precoUnitario: valor },
      ],
    });
}

async function criarTituloAvulso(token, valor = 30) {
  const fornecedor = await request(app)
    .post("/fornecedores")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Fornecedor Titulo Avulso" });

  return request(app)
    .post("/titulos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      tipo: "pagar",
      descricao: "Despesa avulsa DRE",
      valor,
      vencimento: new Date().toISOString().slice(0, 10),
      fornecedorId: fornecedor.body.id,
    });
}

async function obterDre(token, query = "") {
  return request(app)
    .get(`/relatorios/dre${query}`)
    .set("Authorization", `Bearer ${token}`);
}

describe("DRE simplificado", () => {
  test("sem nenhum dado, todos os valores ficam zerados", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await obterDre(token);

    expect(response.status).toBe(200);
    expect(response.body.receitaBruta).toBe(0);
    expect(response.body.custoMercadorias).toBe(0);
    expect(response.body.despesasPessoal).toBe(0);
    expect(response.body.outrasDespesasOperacionais).toBe(0);
    expect(response.body.lucroLiquido).toBe(0);
  });

  test("venda confirmada soma na receita bruta; venda cancelada não conta", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarVenda(token, 100);
    const vendaCancelada = await criarVenda(token, 999);
    await request(app)
      .delete(`/vendas/${vendaCancelada.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await obterDre(token);

    expect(response.body.receitaBruta).toBe(100);
  });

  test("compra soma no custo de mercadorias e reduz o lucro bruto", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarVenda(token, 200);
    await criarCompra(token, 60);

    const response = await obterDre(token);

    expect(response.body.receitaBruta).toBe(200);
    expect(response.body.custoMercadorias).toBe(60);
    expect(response.body.lucroBruto).toBe(140);
  });

  test("título gerado pela compra não é contado de novo em outras despesas", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarCompra(token, 80);

    const response = await obterDre(token);

    expect(response.body.custoMercadorias).toBe(80);
    expect(response.body.outrasDespesasOperacionais).toBe(0);
  });

  test("título avulso (sem venda/compra/folha) soma em outras despesas operacionais", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarTituloAvulso(token, 45);

    const response = await obterDre(token);

    expect(response.body.outrasDespesasOperacionais).toBe(45);
  });

  test("folha de pagamento fechada soma em despesas com pessoal e não duplica em outras despesas", async () => {
    const { token } = await criarEmpresaComAdmin();

    await request(app)
      .post("/funcionarios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Funcionario DRE", salarioBase: 1000 });

    const agora = new Date();
    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: agora.getMonth() + 1, ano: agora.getFullYear() });

    await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const response = await obterDre(token);

    expect(response.body.despesasPessoal).toBe(1000);
    expect(response.body.outrasDespesasOperacionais).toBe(0);
  });

  test("lucro líquido é receita menos custo, pessoal e outras despesas", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarVenda(token, 1000);
    await criarCompra(token, 200);
    await criarTituloAvulso(token, 100);

    await request(app)
      .post("/funcionarios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Funcionario DRE 2", salarioBase: 300 });

    const agora = new Date();
    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: agora.getMonth() + 1, ano: agora.getFullYear() });

    await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const response = await obterDre(token);

    expect(response.body.receitaBruta).toBe(1000);
    expect(response.body.custoMercadorias).toBe(200);
    expect(response.body.despesasPessoal).toBe(300);
    expect(response.body.outrasDespesasOperacionais).toBe(100);
    expect(response.body.lucroLiquido).toBe(400);
  });

  test("filtro de período exclui vendas fora do intervalo", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarVenda(token, 500);

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataFutura = amanha.toISOString().slice(0, 10);

    const response = await obterDre(
      token,
      `?dataInicio=${dataFutura}&dataFim=${dataFutura}`,
    );

    expect(response.body.receitaBruta).toBe(0);
  });

  test("usuário sem financeiro.gerenciar recebe 403", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await obterDre(token);

    expect(response.status).toBe(403);
  });
});
