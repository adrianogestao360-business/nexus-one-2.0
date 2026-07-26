const request = require("supertest");

const {
  app,
  prisma,
  criarEmpresaComAdmin,
  adicionarUsuario,
} = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarVendaComSeparacao(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente WMS" });

  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "WMS-01", descricao: "Produto WMS", preco: 10, estoque: 20 });

  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.body.id,
      itens: [{ produtoId: produto.body.id, quantidade: 3 }],
    });

  const lista = await request(app)
    .get("/separacoes")
    .set("Authorization", `Bearer ${token}`);

  const separacao = lista.body.find((s) => s.vendaId === venda.body.id);

  return { venda: venda.body, separacao };
}

describe("WMS", () => {
  test("criar zona e localização", async () => {
    const { token } = await criarEmpresaComAdmin();

    const zona = await request(app)
      .post("/zonas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Zona A" });
    expect(zona.status).toBe(201);

    const localizacao = await request(app)
      .post("/localizacoes")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "B1", zonaId: zona.body.id });
    expect(localizacao.status).toBe(201);
    expect(localizacao.body.zonaId).toBe(zona.body.id);
  });

  test("venda gera separação pendente automaticamente", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacao } = await criarVendaComSeparacao(token);

    expect(separacao).toBeDefined();
    expect(separacao.status).toBe("pendente");
  });

  test("fluxo completo: assumir → marcar itens → concluir → expedir", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacao } = await criarVendaComSeparacao(token);

    const assumida = await request(app)
      .post(`/separacoes/${separacao.id}/assumir`)
      .set("Authorization", `Bearer ${token}`);
    expect(assumida.status).toBe(200);
    expect(assumida.body.status).toBe("em_separacao");

    for (const item of assumida.body.itens) {
      const marcado = await request(app)
        .patch(`/separacoes/${separacao.id}/itens/${item.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ separado: true });
      expect(marcado.status).toBe(200);
    }

    const concluida = await request(app)
      .post(`/separacoes/${separacao.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);
    expect(concluida.status).toBe(200);
    expect(concluida.body.status).toBe("separado");

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "WMS1234", modelo: "Van" });

    const motorista = await request(app)
      .post("/motoristas")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Motorista Teste" });

    const expedida = await request(app)
      .post(`/separacoes/${separacao.id}/expedir`)
      .set("Authorization", `Bearer ${token}`)
      .send({ veiculoId: veiculo.body.id, motoristaId: motorista.body.id });

    expect(expedida.status).toBe(200);
    expect(expedida.body.status).toBe("expedido");
  });

  test("concluir com itens pendentes retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { separacao } = await criarVendaComSeparacao(token);

    await request(app)
      .post(`/separacoes/${separacao.id}/assumir`)
      .set("Authorization", `Bearer ${token}`);

    const concluida = await request(app)
      .post(`/separacoes/${separacao.id}/concluir`)
      .set("Authorization", `Bearer ${token}`);

    expect(concluida.status).toBe(400);
  });

  test("exclusividade: um segundo usuário não pode agir numa separação assumida por outro", async () => {
    const { token, empresa, papel } = await criarEmpresaComAdmin();
    const colega = await adicionarUsuario(empresa, papel);

    const { separacao } = await criarVendaComSeparacao(token);

    await request(app)
      .post(`/separacoes/${separacao.id}/assumir`)
      .set("Authorization", `Bearer ${token}`);

    const tentativaColega = await request(app)
      .post(`/separacoes/${separacao.id}/concluir`)
      .set("Authorization", `Bearer ${colega.token}`);

    expect(tentativaColega.status).toBe(403);

    // um segundo "assumir" também deve ser bloqueado, pois já não está mais pendente
    const segundoAssumir = await request(app)
      .post(`/separacoes/${separacao.id}/assumir`)
      .set("Authorization", `Bearer ${colega.token}`);

    expect(segundoAssumir.status).toBe(409);
  });
});
