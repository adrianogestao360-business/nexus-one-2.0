const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarVendaCancelada(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Relatório" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "REL-01", descricao: "Produto Relatório", preco: 10, estoque: 10 });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 2 }],
    });

  await request(app)
    .delete(`/vendas/${venda.body.id}`)
    .set("Authorization", `Bearer ${token}`);

  return venda.body;
}

describe("Relatórios: filtros", () => {
  test("GET /vendas?status=cancelada retorna só as canceladas", async () => {
    const { token } = await criarEmpresaComAdmin();

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Ativo" });

    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "REL-02", descricao: "Produto Ativo", preco: 10, estoque: 10 });

    await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.body.id, quantidade: 1 }],
      });

    const vendaCancelada = await criarVendaCancelada(token);

    const response = await request(app)
      .get("/vendas?status=cancelada")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.every((v) => v.status === "cancelada")).toBe(true);
    expect(response.body.some((v) => v.id === vendaCancelada.id)).toBe(true);
  });

  test("GET /vendas com período fora do range não retorna nada", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarVendaCancelada(token);

    const response = await request(app)
      .get("/vendas?dataInicio=2000-01-01&dataFim=2000-01-31")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test("GET /vendas com período de hoje retorna a venda criada", async () => {
    const { token } = await criarEmpresaComAdmin();
    const venda = await criarVendaCancelada(token);

    // data de "hoje" no calendário local (não UTC) — o filtro do backend
    // interpreta dataInicio/dataFim como data local, igual a um usuário
    // digitando a data num formulário
    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;

    const response = await request(app)
      .get(`/vendas?dataInicio=${hoje}&dataFim=${hoje}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.some((v) => v.id === venda.id)).toBe(true);
  });

  test("GET /titulos combina tipo + status + período", async () => {
    const { token } = await criarEmpresaComAdmin();

    const titulo = await request(app)
      .post("/titulos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "pagar",
        descricao: "Título Relatório",
        valor: 100,
        vencimento: "2026-08-15",
      });

    const agora = new Date();
    const hoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(agora.getDate()).padStart(2, "0")}`;

    const response = await request(app)
      .get(
        `/titulos?tipo=pagar&status=aberta&dataInicio=${hoje}&dataFim=2026-12-31`,
      )
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.some((t) => t.id === titulo.body.id)).toBe(true);
    expect(
      response.body.every((t) => t.tipo === "pagar" && t.status === "aberta"),
    ).toBe(true);
  });
});
