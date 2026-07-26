const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarEntregaViaExpedicao(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Frota" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "FR-01", descricao: "Produto Frota", preco: 10, estoque: 5 });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 2 }],
    });

  const separacoes = await request(app)
    .get("/separacoes")
    .set("Authorization", `Bearer ${token}`);
  const separacao = separacoes.body.find((s) => s.vendaId === venda.body.id);

  await request(app)
    .post(`/separacoes/${separacao.id}/assumir`)
    .set("Authorization", `Bearer ${token}`);

  const detalhada = await request(app)
    .get(`/separacoes/${separacao.id}`)
    .set("Authorization", `Bearer ${token}`);

  for (const item of detalhada.body.itens) {
    await request(app)
      .patch(`/separacoes/${separacao.id}/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ separado: true });
  }

  await request(app)
    .post(`/separacoes/${separacao.id}/concluir`)
    .set("Authorization", `Bearer ${token}`);

  const veiculo = await request(app)
    .post("/veiculos")
    .set("Authorization", `Bearer ${token}`)
    .send({ placa: "FRT1234", modelo: "Caminhão" });

  const motorista = await request(app)
    .post("/motoristas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Motorista Frota" });

  await request(app)
    .post(`/separacoes/${separacao.id}/expedir`)
    .set("Authorization", `Bearer ${token}`)
    .send({ veiculoId: veiculo.body.id, motoristaId: motorista.body.id });

  const entregas = await request(app)
    .get("/entregas")
    .set("Authorization", `Bearer ${token}`);

  return entregas.body.find((e) => e.separacaoId === separacao.id);
}

describe("Frota", () => {
  test("CRUD de veículos e motoristas", async () => {
    const { token } = await criarEmpresaComAdmin();

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "ABC1234", modelo: "Van", capacidade: "1000kg" });
    expect(veiculo.status).toBe(201);

    const atualizado = await request(app)
      .put(`/veiculos/${veiculo.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "ABC1234", modelo: "Van Editada" });
    expect(atualizado.status).toBe(200);
    expect(atualizado.body.modelo).toBe("Van Editada");

    const desativado = await request(app)
      .delete(`/veiculos/${veiculo.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(desativado.status).toBe(204);

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "João" });
    expect(motorista.status).toBe(201);
  });

  test("expedição de separação cria entrega em rota", async () => {
    const { token } = await criarEmpresaComAdmin();
    const entrega = await criarEntregaViaExpedicao(token);

    expect(entrega).toBeDefined();
    expect(entrega.status).toBe("em_rota");
  });

  test("confirmar entrega muda status para entregue", async () => {
    const { token } = await criarEmpresaComAdmin();
    const entrega = await criarEntregaViaExpedicao(token);

    const confirmada = await request(app)
      .post(`/entregas/${entrega.id}/confirmar`)
      .set("Authorization", `Bearer ${token}`);

    expect(confirmada.status).toBe(200);
    expect(confirmada.body.status).toBe("entregue");
  });

  test("confirmar entrega já entregue retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const entrega = await criarEntregaViaExpedicao(token);

    await request(app)
      .post(`/entregas/${entrega.id}/confirmar`)
      .set("Authorization", `Bearer ${token}`);

    const segundaTentativa = await request(app)
      .post(`/entregas/${entrega.id}/confirmar`)
      .set("Authorization", `Bearer ${token}`);

    expect(segundaTentativa.status).toBe(400);
  });
});
