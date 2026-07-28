const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarSeparacaoPronta(token, { peso, quantidade = 3 } = {}) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Romaneio" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: `RM-${Date.now()}-${Math.random()}`,
      descricao: "Produto Romaneio",
      preco: 10,
      estoque: 20,
      peso,
    });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade }],
    });

  const lista = await request(app)
    .get("/separacoes")
    .set("Authorization", `Bearer ${token}`);

  const separacao = lista.body.find((s) => s.vendaId === venda.body.id);

  await request(app)
    .post(`/separacoes/${separacao.id}/assumir`)
    .set("Authorization", `Bearer ${token}`);

  for (const item of separacao.itens) {
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
    .send({ placa: `RM${Math.floor(Math.random() * 10000)}`, modelo: "Van" });

  const motorista = await request(app)
    .post("/motoristas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Motorista Romaneio" });

  return {
    separacaoId: separacao.id,
    produto: produto.body,
    veiculoId: veiculo.body.id,
    motoristaId: motorista.body.id,
  };
}

describe("Romaneio de expedição", () => {
  test("expedir sem informar volumes gera romaneio com volumes = 1", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      token,
    );

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId });

    expect(expedida.status).toBe(200);
    expect(expedida.body.romaneio).toBeDefined();
    expect(expedida.body.romaneio.volumes).toBe(1);
  });

  test("expedir com volumes explícito grava o valor informado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      token,
    );

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId, volumes: 4 });

    expect(expedida.body.romaneio.volumes).toBe(4);
  });

  test("pesoTotal do romaneio é peso do produto vezes quantidade", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      token,
      { peso: 2.5, quantidade: 4 },
    );

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId });

    expect(Number(expedida.body.romaneio.pesoTotal)).toBe(10);
  });

  test("produto sem peso definido gera romaneio com pesoTotal zero, sem quebrar", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      token,
    );

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId });

    expect(expedida.status).toBe(200);
    expect(Number(expedida.body.romaneio.pesoTotal)).toBe(0);
  });

  test("GET /romaneios/:id retorna detalhe com itens da separação", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, produto, veiculoId, motoristaId } =
      await criarSeparacaoPronta(token, { peso: 1, quantidade: 2 });

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId });

    const response = await request(app)
      .get(`/romaneios/${expedida.body.romaneio.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.separacao.itens[0].produto.id).toBe(produto.id);
    expect(response.body.veiculo.id).toBe(veiculoId);
    expect(response.body.motorista.id).toBe(motoristaId);
  });

  test("GET /romaneios lista os romaneios da empresa", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      token,
    );

    await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId, motoristaId });

    const response = await request(app)
      .get("/romaneios")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("romaneio de outra empresa não é encontrado", async () => {
    const { token: tokenA } = await criarEmpresaComAdmin();
    const { token: tokenB } = await criarEmpresaComAdmin();
    const { separacaoId, veiculoId, motoristaId } = await criarSeparacaoPronta(
      tokenA,
    );

    const expedida = await request(app)
      .post(`/separacoes/${separacaoId}/expedir`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ veiculoId, motoristaId });

    const response = await request(app)
      .get(`/romaneios/${expedida.body.romaneio.id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(response.status).toBe(404);
  });
});
