const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

function mesAnoAtual() {
  const agora = new Date();
  return { mes: agora.getMonth() + 1, ano: agora.getFullYear() };
}

async function criarVenda(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Meta" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "MV-01", descricao: "Produto Meta", preco: 100, estoque: 50 });

  return request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 2 }],
    });
}

describe("Metas de venda - CRUD", () => {
  test("cria meta para vendedor válido com realizado inicial zero", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    const response = await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: usuario.id,
        mes,
        ano,
        valorMeta: 1000,
        percentualComissao: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.realizado).toBe(0);
    expect(response.body.comissao).toBe(0);
  });

  test("não permite duas metas para o mesmo vendedor no mesmo mês/ano", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({ usuarioId: usuario.id, mes, ano, valorMeta: 1000, percentualComissao: 5 });

    const resposta = await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({ usuarioId: usuario.id, mes, ano, valorMeta: 2000, percentualComissao: 3 });

    expect(resposta.status).toBe(400);
  });

  test("criar meta para vendedor de outra empresa retorna 404", async () => {
    const { token } = await criarEmpresaComAdmin();
    const outraEmpresa = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    const resposta = await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: outraEmpresa.usuario.id,
        mes,
        ano,
        valorMeta: 1000,
        percentualComissao: 5,
      });

    expect(resposta.status).toBe(404);
  });

  test("excluir meta remove da listagem", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    const meta = await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({ usuarioId: usuario.id, mes, ano, valorMeta: 1000, percentualComissao: 5 });

    const exclusao = await request(app)
      .delete(`/metas-vendas/${meta.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(exclusao.status).toBe(204);

    const listagem = await request(app)
      .get("/metas-vendas")
      .set("Authorization", `Bearer ${token}`);

    expect(listagem.body.some((m) => m.id === meta.body.id)).toBe(false);
  });
});

describe("Metas de venda - cálculo de realizado e comissão", () => {
  test("venda confirmada do vendedor conta para o realizado e gera comissão", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: usuario.id,
        mes,
        ano,
        valorMeta: 100,
        percentualComissao: 10,
      });

    const venda = await criarVenda(token);
    expect(Number(venda.body.total)).toBe(200);
    expect(venda.body.vendedorId).toBe(usuario.id);

    const listagem = await request(app)
      .get("/metas-vendas")
      .set("Authorization", `Bearer ${token}`);

    const meta = listagem.body.find((m) => m.usuarioId === usuario.id);

    expect(meta.realizado).toBe(200);
    expect(meta.comissao).toBe(20);
    expect(meta.percentualAtingido).toBe(200);
  });

  test("venda cancelada não conta para o realizado", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: usuario.id,
        mes,
        ano,
        valorMeta: 100,
        percentualComissao: 10,
      });

    const venda = await criarVenda(token);

    await request(app)
      .delete(`/vendas/${venda.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const listagem = await request(app)
      .get("/metas-vendas")
      .set("Authorization", `Bearer ${token}`);

    const meta = listagem.body.find((m) => m.usuarioId === usuario.id);

    expect(meta.realizado).toBe(0);
    expect(meta.comissao).toBe(0);
  });

  test("atualizar percentual de comissão recalcula a comissão", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();
    const { mes, ano } = mesAnoAtual();

    const meta = await request(app)
      .post("/metas-vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: usuario.id,
        mes,
        ano,
        valorMeta: 100,
        percentualComissao: 10,
      });

    await criarVenda(token);

    const atualizada = await request(app)
      .put(`/metas-vendas/${meta.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        usuarioId: usuario.id,
        mes,
        ano,
        valorMeta: 100,
        percentualComissao: 20,
      });

    expect(atualizada.status).toBe(200);
    expect(atualizada.body.comissao).toBe(40);
  });
});
