jest.mock("../src/integrations/anthropic/AnthropicClient", () => ({
  enviarMensagem: jest.fn(),
}));

const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");
const AnthropicClient = require("../src/integrations/anthropic/AnthropicClient");

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.ANTHROPIC_API_KEY;
});

describe("Nexus AI - resumo", () => {
  test("resumo reflete dados reais da empresa", async () => {
    const { token } = await criarEmpresaComAdmin();

    await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "IA-01", descricao: "Produto sem estoque", estoque: 0 });

    const veiculo = await request(app)
      .post("/veiculos")
      .set("Authorization", `Bearer ${token}`)
      .send({ placa: "IA0001", modelo: "Van IA" });

    await prisma.veiculo.update({
      where: { id: veiculo.body.id },
      data: { status: "manutencao" },
    });

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Acima do Limite" });

    await prisma.cliente.update({
      where: { id: cliente.body.id },
      data: { limiteCredito: 100 },
    });

    await request(app)
      .post("/titulos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "receber",
        descricao: "Título acima do limite",
        valor: 500,
        vencimento: new Date().toISOString().slice(0, 10),
        clienteId: cliente.body.id,
      });

    const response = await request(app)
      .get("/ia/resumo")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.produtosSemEstoque).toBe(1);
    expect(response.body.veiculosEmManutencao).toBe(1);
    expect(response.body.clientesAcimaDoLimite).toBe(1);
    expect(response.body.clientesAcimaDoLimiteDetalhe[0].nome).toBe(
      "Cliente Acima do Limite",
    );
  });
});

describe("Nexus AI - plano de ação", () => {
  test("sem ANTHROPIC_API_KEY configurada retorna 400 claro", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/ia/plano-de-acao")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("ANTHROPIC_API_KEY");
    expect(AnthropicClient.enviarMensagem).not.toHaveBeenCalled();
  });

  test("com API key configurada e IA mockada, retorna o plano gerado", async () => {
    const { token } = await criarEmpresaComAdmin();
    process.env.ANTHROPIC_API_KEY = "chave-de-teste";

    AnthropicClient.enviarMensagem.mockResolvedValue(
      "1. Priorize os pedidos aguardando separação.",
    );

    const response = await request(app)
      .post("/ia/plano-de-acao")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.plano).toContain("pedidos aguardando separação");
    expect(AnthropicClient.enviarMensagem).toHaveBeenCalledTimes(1);

    const [prompt, config] = AnthropicClient.enviarMensagem.mock.calls[0];
    expect(prompt).toContain("Pedidos aguardando separação");
    expect(config.apiKey).toBe("chave-de-teste");
  });
});
