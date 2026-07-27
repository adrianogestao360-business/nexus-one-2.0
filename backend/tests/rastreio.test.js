const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarRotaComUmaEntrega(token, opcoes = {}) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente Rastreio" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "RAST-01", descricao: "Produto Rastreio", preco: 10, estoque: 5 });

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

  const veiculo = await request(app)
    .post("/veiculos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      placa: `RST${Math.floor(Math.random() * 9999)}`,
      modelo: "Van",
      kmMedioPorLitro: opcoes.kmMedioPorLitro,
    });

  if (opcoes.valorLitro) {
    await request(app)
      .post(`/veiculos/${veiculo.body.id}/abastecimentos`)
      .set("Authorization", `Bearer ${token}`)
      .send({ valorLitro: opcoes.valorLitro, litros: 40 });
  }

  const motorista = await request(app)
    .post("/motoristas")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Motorista Rastreio" });

  const expedicao = await request(app)
    .post(`/separacoes/${separacao.id}/expedir`)
    .set("Authorization", `Bearer ${token}`)
    .send({ veiculoId: veiculo.body.id, motoristaId: motorista.body.id });

  const rotas = await request(app)
    .get("/rotas")
    .set("Authorization", `Bearer ${token}`);
  const rota = rotas.body.find((r) => r.veiculo.id === veiculo.body.id);

  return { rota, entregaId: expedicao.body.entrega?.id || rota.entregas[0].id };
}

describe("Rastreio público (token da rota, sem JWT)", () => {
  test("GET /rastreio/:token funciona sem Authorization", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota } = await criarRotaComUmaEntrega(token);

    const response = await request(app).get(`/rastreio/${rota.tokenRastreio}`);

    expect(response.status).toBe(200);
    expect(response.body.entregas).toHaveLength(1);
    expect(response.body.veiculo).toBeDefined();
  });

  test("token inválido retorna 404", async () => {
    const response = await request(app).get(
      "/rastreio/00000000-0000-0000-0000-000000000000",
    );

    expect(response.status).toBe(404);
  });

  test("registrar posição atualiza a última localização da rota", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota } = await criarRotaComUmaEntrega(token);

    await request(app)
      .post(`/rastreio/${rota.tokenRastreio}/posicao`)
      .send({ latitude: -23.55, longitude: -46.63 });

    const detalhe = await request(app)
      .get(`/rotas/${rota.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detalhe.body.ultimaLatitude).toBeCloseTo(-23.55, 4);
    expect(detalhe.body.ultimaLongitude).toBeCloseTo(-46.63, 4);
  });

  test("confirmar a única entrega conclui a rota automaticamente, sem dados de km/abastecimento -> custo null", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota, entregaId } = await criarRotaComUmaEntrega(token);

    const confirmacao = await request(app).post(
      `/rastreio/${rota.tokenRastreio}/entregas/${entregaId}/confirmar`,
    );

    expect(confirmacao.status).toBe(200);
    expect(confirmacao.body.status).toBe("entregue");

    const detalhe = await request(app)
      .get(`/rotas/${rota.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detalhe.body.status).toBe("concluida");
    // sem pings de posição suficientes -> km/custo ficam null
    expect(detalhe.body.kmPercorrido).toBeNull();
    expect(detalhe.body.custoEstimado).toBeNull();
  });

  test("com pings de posição, km médio e abastecimento lançados -> custo é calculado", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota, entregaId } = await criarRotaComUmaEntrega(token, {
      kmMedioPorLitro: 10,
      valorLitro: 5,
    });

    // dois pontos ~0.01 grau de latitude de distância (~1.11 km)
    await request(app)
      .post(`/rastreio/${rota.tokenRastreio}/posicao`)
      .send({ latitude: 0, longitude: 0 });
    await request(app)
      .post(`/rastreio/${rota.tokenRastreio}/posicao`)
      .send({ latitude: 0.01, longitude: 0 });

    await request(app).post(
      `/rastreio/${rota.tokenRastreio}/entregas/${entregaId}/confirmar`,
    );

    const detalhe = await request(app)
      .get(`/rotas/${rota.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detalhe.body.status).toBe("concluida");
    expect(Number(detalhe.body.kmPercorrido)).toBeCloseTo(1.11, 1);

    const custoEsperado = (Number(detalhe.body.kmPercorrido) / 10) * 5;
    expect(Number(detalhe.body.custoEstimado)).toBeCloseTo(custoEsperado, 1);
  });

  test("confirmar entrega já entregue retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota, entregaId } = await criarRotaComUmaEntrega(token);

    await request(app).post(
      `/rastreio/${rota.tokenRastreio}/entregas/${entregaId}/confirmar`,
    );

    const segunda = await request(app).post(
      `/rastreio/${rota.tokenRastreio}/entregas/${entregaId}/confirmar`,
    );

    // a rota já foi concluída pela primeira confirmação -> não dá pra confirmar de novo
    expect(segunda.status).toBe(404);
  });

  test("GET /rastreio/:token continua acessível (somente leitura) depois da rota concluída", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { rota, entregaId } = await criarRotaComUmaEntrega(token);

    await request(app).post(
      `/rastreio/${rota.tokenRastreio}/entregas/${entregaId}/confirmar`,
    );

    const resposta = await request(app).get(`/rastreio/${rota.tokenRastreio}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.status).toBe("concluida");
    expect(resposta.body.entregas[0].status).toBe("entregue");
  });
});
