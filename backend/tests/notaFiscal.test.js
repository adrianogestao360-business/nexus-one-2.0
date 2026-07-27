jest.mock("../src/integrations/focusNfe/FocusNfeClient", () => ({
  emitirNfe: jest.fn(),
  consultarNfe: jest.fn(),
  cancelarNfe: jest.fn(),
}));

const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");
const FocusNfeClient = require("../src/integrations/focusNfe/FocusNfeClient");

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(() => {
  jest.clearAllMocks();
});

async function configurarTokenFiscal(token, empresaId) {
  await request(app)
    .put(`/empresas/${empresaId}/integracao-fiscal`)
    .set("Authorization", `Bearer ${token}`)
    .send({ token: "token-teste-123", ambiente: "homologacao" });
}

async function criarClienteFiscalCompleto(token) {
  const response = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({
      nome: "Cliente NF Completo",
      documento: "12345678900",
      tipoDocumento: "fisica",
      logradouro: "Rua das Flores",
      numero: "100",
      bairro: "Centro",
      municipio: "São Paulo",
      codigoMunicipioIBGE: "3550308",
      uf: "SP",
      cep: "01000-000",
    });

  return response.body;
}

async function criarProdutoFiscalCompleto(token, codigo = "NF-01") {
  const response = await request(app)
    .post("/produtos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      codigo,
      descricao: "Produto NF",
      preco: 10,
      estoque: 5,
      ncm: "12345678",
      cfop: "5102",
    });

  return response.body;
}

async function criarVendaComNota(token, cliente, produto) {
  const venda = await request(app)
    .post("/vendas")
    .set("Authorization", `Bearer ${token}`)
    .send({
      clienteId: cliente.id,
      itens: [{ produtoId: produto.id, quantidade: 1 }],
    });

  const notas = await request(app)
    .get("/notas-fiscais")
    .set("Authorization", `Bearer ${token}`);

  return notas.body.find((n) => n.vendaId === venda.body.id);
}

describe("Nota Fiscal - venda (saída, via Focus NFe)", () => {
  test("venda gera nota fiscal pendente automaticamente", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token);
    const nota = await criarVendaComNota(token, cliente, produto);

    expect(nota).toBeDefined();
    expect(nota.status).toBe("pendente");
    expect(nota.tipo).toBe("saida");
  });

  test("emitir sem token do Focus NFe configurado retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-02");
    const nota = await criarVendaComNota(token, cliente, produto);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(FocusNfeClient.emitirNfe).not.toHaveBeenCalled();
  });

  test("emitir com cliente sem dados fiscais completos retorna 400", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const clienteIncompleto = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Sem Endereço" });

    const produto = await criarProdutoFiscalCompleto(token, "NF-03");
    const nota = await criarVendaComNota(token, clienteIncompleto.body, produto);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Dados fiscais incompletos");
    expect(FocusNfeClient.emitirNfe).not.toHaveBeenCalled();
  });

  test("emitir com dados completos chama o Focus NFe e fica processando_autorizacao", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-04");
    const nota = await criarVendaComNota(token, cliente, produto);

    FocusNfeClient.emitirNfe.mockResolvedValue({
      status: "processando_autorizacao",
    });

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(202);
    expect(response.body.status).toBe("processando_autorizacao");
    expect(response.body.ref).toBeTruthy();
    expect(FocusNfeClient.emitirNfe).toHaveBeenCalledTimes(1);

    const [, payload] = FocusNfeClient.emitirNfe.mock.calls[0];
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].ncm).toBe("12345678");
    expect(payload.cpf_destinatario).toBe("12345678900");
  });

  test("emitir uma nota que não está mais pendente retorna 400", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-05");
    const nota = await criarVendaComNota(token, cliente, produto);

    FocusNfeClient.emitirNfe.mockResolvedValue({
      status: "processando_autorizacao",
    });

    await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    const segundaEmissao = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    expect(segundaEmissao.status).toBe(400);
  });

  test("atualizar status consulta o Focus NFe e grava autorização", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-06");
    const nota = await criarVendaComNota(token, cliente, produto);

    FocusNfeClient.emitirNfe.mockResolvedValue({
      status: "processando_autorizacao",
    });

    await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    FocusNfeClient.consultarNfe.mockResolvedValue({
      status: "autorizado",
      chave_nfe: "1".repeat(44),
      protocolo_autorizacao: "135240000012345",
      caminho_xml_nota_fiscal: "https://focusnfe/xml.xml",
      caminho_danfe: "https://focusnfe/danfe.pdf",
    });

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/atualizar-status`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("autorizado");
    expect(response.body.chaveAcesso).toBe("1".repeat(44));
    expect(response.body.danfeUrl).toBe("https://focusnfe/danfe.pdf");
  });

  test("atualizar status quando o Focus NFe rejeita grava o motivo", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-07");
    const nota = await criarVendaComNota(token, cliente, produto);

    FocusNfeClient.emitirNfe.mockResolvedValue({
      status: "processando_autorizacao",
    });

    await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    FocusNfeClient.consultarNfe.mockResolvedValue({
      status: "erro_autorizacao",
      mensagem_sefaz: "Rejeição: CFOP inválido para a operação",
    });

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/atualizar-status`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("erro_autorizacao");
    expect(response.body.motivoStatus).toContain("CFOP inválido");
  });

  test("cancelar sem justificativa ou com justificativa curta retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-08");
    const nota = await criarVendaComNota(token, cliente, produto);

    const semJustificativa = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`);
    expect(semJustificativa.status).toBe(400);

    const justificativaCurta = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ justificativa: "curta demais" });
    expect(justificativaCurta.status).toBe(400);

    expect(FocusNfeClient.cancelarNfe).not.toHaveBeenCalled();
  });

  test("cancelar nota pendente (nunca emitida) com justificativa válida cancela localmente", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-09");
    const nota = await criarVendaComNota(token, cliente, produto);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ justificativa: "Cancelamento solicitado pelo cliente" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("cancelado");
    expect(FocusNfeClient.cancelarNfe).not.toHaveBeenCalled();
  });

  test("cancelar nota já emitida chama o Focus NFe", async () => {
    const { token, empresa } = await criarEmpresaComAdmin();
    await configurarTokenFiscal(token, empresa.id);

    const cliente = await criarClienteFiscalCompleto(token);
    const produto = await criarProdutoFiscalCompleto(token, "NF-10");
    const nota = await criarVendaComNota(token, cliente, produto);

    FocusNfeClient.emitirNfe.mockResolvedValue({
      status: "processando_autorizacao",
    });
    await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    FocusNfeClient.cancelarNfe.mockResolvedValue({ status: "cancelado" });

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ justificativa: "Cancelamento solicitado pelo cliente" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("cancelado");
    expect(FocusNfeClient.cancelarNfe).toHaveBeenCalledTimes(1);

    const segundoCancelamento = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`)
      .send({ justificativa: "Segunda tentativa de cancelamento" });

    expect(segundoCancelamento.status).toBe(400);
  });
});

describe("Nota Fiscal - compra (entrada, simulada)", () => {
  async function criarCompraComNota(token) {
    const fornecedor = await request(app)
      .post("/fornecedores")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Fornecedor NF" });

    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "NF-ENT-01", descricao: "Produto NF Entrada", preco: 10 });

    const compra = await request(app)
      .post("/compras")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fornecedorId: fornecedor.body.id,
        itens: [
          { produtoId: produto.body.id, quantidade: 5, precoUnitario: 10 },
        ],
      });

    const notas = await request(app)
      .get("/notas-fiscais")
      .set("Authorization", `Bearer ${token}`);

    return notas.body.find((n) => n.compraId === compra.body.id);
  }

  test("emitir nota de entrada continua simulado, sem chamar o Focus NFe", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarCompraComNota(token);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/emitir`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(202);
    expect(response.body.status).toBe("emitida");
    expect(response.body.numero).toMatch(/^SIM-/);
    expect(FocusNfeClient.emitirNfe).not.toHaveBeenCalled();
  });

  test("cancelar nota de entrada não exige justificativa", async () => {
    const { token } = await criarEmpresaComAdmin();
    const nota = await criarCompraComNota(token);

    const response = await request(app)
      .post(`/notas-fiscais/${nota.id}/cancelar`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("cancelada");
    expect(FocusNfeClient.cancelarNfe).not.toHaveBeenCalled();
  });
});
