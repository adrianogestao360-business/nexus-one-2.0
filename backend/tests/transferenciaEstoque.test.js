const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarProdutoELocalizacaoDestino(token, estoqueInicial = 30) {
  const produto = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo: "TR-01",
      descricao: "Produto Transferência",
      preco: 10,
      estoque: estoqueInicial,
    });

  const destino = await request(app)
    .post("/localizacoes")
    .set("Authorization", `Bearer ${token}`)
    .send({ codigo: "DEST-1" });

  const saldos = await request(app)
    .get(`/estoque-localizacoes?produtoId=${produto.body.id}`)
    .set("Authorization", `Bearer ${token}`);
  const geralId = saldos.body[0].localizacaoId;

  return { produto: produto.body, geralId, destinoId: destino.body.id };
}

describe("Transferência de estoque", () => {
  test("transferir move o saldo entre localizações sem alterar o total do produto", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, geralId, destinoId } =
      await criarProdutoELocalizacaoDestino(token, 30);

    const response = await request(app)
      .post("/movimentos-estoque/transferir")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoOrigemId: geralId,
        localizacaoDestinoId: destinoId,
        quantidade: 12,
      });

    expect(response.status).toBe(201);
    expect(response.body.movimentoSaida.localizacaoId).toBe(geralId);
    expect(response.body.movimentoSaida.tipo).toBe("saida");
    expect(response.body.movimentoEntrada.localizacaoId).toBe(destinoId);
    expect(response.body.movimentoEntrada.tipo).toBe("entrada");

    const produtoAtualizado = await request(app)
      .get(`/produtos/${produto.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(produtoAtualizado.body.estoque).toBe(30);

    const saldos = await request(app)
      .get(`/estoque-localizacoes?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);

    const saldoGeral = saldos.body.find((s) => s.localizacaoId === geralId);
    const saldoDestino = saldos.body.find((s) => s.localizacaoId === destinoId);

    expect(saldoGeral.quantidade).toBe(18);
    expect(saldoDestino.quantidade).toBe(12);
  });

  test("transferir mais do que o saldo de origem retorna 400 e não altera nada", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, geralId, destinoId } =
      await criarProdutoELocalizacaoDestino(token, 10);

    const response = await request(app)
      .post("/movimentos-estoque/transferir")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoOrigemId: geralId,
        localizacaoDestinoId: destinoId,
        quantidade: 20,
      });

    expect(response.status).toBe(400);

    const saldos = await request(app)
      .get(`/estoque-localizacoes?produtoId=${produto.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(saldos.body.find((s) => s.localizacaoId === geralId).quantidade).toBe(10);
  });

  test("origem igual ao destino retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const { produto, geralId } = await criarProdutoELocalizacaoDestino(token, 10);

    const response = await request(app)
      .post("/movimentos-estoque/transferir")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoOrigemId: geralId,
        localizacaoDestinoId: geralId,
        quantidade: 5,
      });

    expect(response.status).toBe(400);
  });

  test("localização de outra empresa retorna 404 (isolamento)", async () => {
    const { token } = await criarEmpresaComAdmin();
    const outraEmpresa = await criarEmpresaComAdmin();

    const { produto, geralId } = await criarProdutoELocalizacaoDestino(token, 10);

    const localizacaoDeOutraEmpresa = await request(app)
      .post("/localizacoes")
      .set("Authorization", `Bearer ${outraEmpresa.token}`)
      .send({ codigo: "ALHEIA" });

    const response = await request(app)
      .post("/movimentos-estoque/transferir")
      .set("Authorization", `Bearer ${token}`)
      .send({
        produtoId: produto.id,
        localizacaoOrigemId: geralId,
        localizacaoDestinoId: localizacaoDeOutraEmpresa.body.id,
        quantidade: 5,
      });

    expect(response.status).toBe(404);
  });
});
