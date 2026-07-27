const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarSeparacaoPronta(token, sufixo) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: `Cliente Rota ${sufixo}` });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `ROTA-${sufixo}`,
      descricao: `Produto Rota ${sufixo}`,
      preco: 10,
      estoque: 5,
    });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 1 }],
    });

  const lista = await request(app)
    .get("/separacoes")
    .set("Authorization", `Bearer ${token}`);
  const separacao = lista.body.find((s) => s.vendaId === venda.body.id);

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

  return separacao.id;
}

describe("Rota (despacho em lote / múltiplas entregas)", () => {
  test("despachar 2 separações prontas num mesmo veículo/motorista cria 1 rota com 2 entregas", async () => {
    const { token } = await criarEmpresaComAdmin();

    const separacaoId1 = await criarSeparacaoPronta(token, "A");
    const separacaoId2 = await criarSeparacaoPronta(token, "B");

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "ROTA123", modelo: "Van" });

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Motorista Rota" });

    const rota = await request(app)
      .post("/rotas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        veiculoId: veiculo.body.id,
        motoristaId: motorista.body.id,
        separacaoIds: [separacaoId1, separacaoId2],
      });

    expect(rota.status).toBe(201);
    expect(rota.body.entregas).toHaveLength(2);
    expect(rota.body.tokenRastreio).toBeDefined();
    expect(rota.body.status).toBe("em_andamento");
  });

  test("despachar uma separação que não está 'separado' retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Rota Pendente" });

    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "ROTA-P", descricao: "Produto Pendente", preco: 10, estoque: 5 });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.body.id, quantidade: 1 }],
      });

    const lista = await request(app)
      .get("/separacoes")
      .set("Authorization", `Bearer ${token}`);
    const separacaoPendente = lista.body.find((s) => s.vendaId === venda.body.id);

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "ROTA456", modelo: "Van" });

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Motorista Rota 2" });

    const rota = await request(app)
      .post("/rotas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        veiculoId: veiculo.body.id,
        motoristaId: motorista.body.id,
        separacaoIds: [separacaoPendente.id],
      });

    expect(rota.status).toBe(400);
  });

  test("fluxo antigo POST /separacoes/:id/expedir continua funcionando e também cria uma rota", async () => {
    const { token } = await criarEmpresaComAdmin();
    const separacaoId = await criarSeparacaoPronta(token, "C");

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "ROTA789", modelo: "Van" });

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Motorista Rota 3" });

    const expedicao = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId: veiculo.body.id, motoristaId: motorista.body.id });

    expect(expedicao.status).toBe(200);

    const rotas = await request(app)
      .get("/rotas")
      .set("Authorization", `Bearer ${token}`);

    expect(
      rotas.body.some(
        (r) => r.entregas.length === 1 && r.veiculo.id === veiculo.body.id,
      ),
    ).toBe(true);
  });

  test("rotas são isoladas por empresa", async () => {
    const empresaA = await criarEmpresaComAdmin();
    const empresaB = await criarEmpresaComAdmin();

    await criarSeparacaoPronta(empresaA.token, "ISO");

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${empresaA.token}`)
      .send({ placa: "ISO1234", modelo: "Van" });

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${empresaA.token}`)
      .send({ nome: "Motorista Isolamento" });

    const lista = await request(app)
      .get("/separacoes")
      .set("Authorization", `Bearer ${empresaA.token}`);
    const separacao = lista.body.find((s) => s.status === "separado");

    await request(app)
      .post("/rotas")
      .set("Authorization", `Bearer ${empresaA.token}`)
      .send({
        veiculoId: veiculo.body.id,
        motoristaId: motorista.body.id,
        separacaoIds: [separacao.id],
      });

    const rotasB = await request(app)
      .get("/rotas")
      .set("Authorization", `Bearer ${empresaB.token}`);

    expect(rotasB.body).toHaveLength(0);
  });
});
