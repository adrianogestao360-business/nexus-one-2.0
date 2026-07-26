const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarVendaComNota(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente NF" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "NF-01", descricao: "Produto NF", preco: 10, estoque: 5 });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 1 }],
    });

  const notas = await request(app)
    .get("/notas-fiscais")
    .set("Authorization", `Bearer ${token}`);

  return notas.body.find((n) => n.vendaId === venda.body.id);
}

describe("Nota Fiscal", () => {
  test("venda gera nota fiscal pendente automaticamente", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarVendaComNota(token);

    expect(nota).toBeDefined();
    expect(nota.status).toBe("pendente");
  });

  test("emitir sem número retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarVendaComNota(token);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  test("emitir com número muda status para emitida", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarVendaComNota(token);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ numero: "NF-0001" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("emitida");
    expect(response.body.numero).toBe("NF-0001");
  });

  test("emitir uma nota já emitida retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarVendaComNota(token);

    await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ numero: "NF-0002" });

    const segundaEmissao = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ numero: "NF-0003" });

    expect(segundaEmissao.status).toBe(400);
  });

  test("cancelar nota fiscal e depois tentar cancelar de novo retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarVendaComNota(token);

    const cancelamento = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelamento.status).toBe(200);
    expect(cancelamento.body.status).toBe("cancelada");

    const segundoCancelamento = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`);

    expect(segundoCancelamento.status).toBe(400);
  });
});
