const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auditoria", () => {
  test("login bem-sucedido gera log de auditoria", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(logs.status).toBe(200);
    expect(
      logs.body.some((l) => l.acao === "login" && l.usuarioId === usuario.id),
    ).toBe(true);
  });

  test("login com senha errada gera log 'login_falhou'", async () => {
    const { token, usuario } = await criarEmpresaComAdmin();

    await request(app)
      .post("/auth/login")
      .send({ email: usuario.email, senha: "SenhaErrada" });

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(
      logs.body.some(
        (l) => l.acao === "login_falhou" && l.usuarioId === usuario.id,
      ),
    ).toBe(true);
  });

  test("criar e cancelar venda geram logs de auditoria", async () => {
    const { token } = await criarEmpresaComAdmin();

    const cliente = await request(app)
      .post("/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Cliente Auditoria" });

    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "AUD-01", descricao: "Produto Auditoria", preco: 10, estoque: 10 });

    const venda = await request(app)
      .post("/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        clienteId: cliente.body.id,
        itens: [{ produtoId: produto.body.id, quantidade: 2 }],
      });

    await request(app)
      .delete(`/vendas/${venda.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(
      logs.body.some(
        (l) => l.acao === "venda.criar" && l.entidadeId === venda.body.id,
      ),
    ).toBe(true);
    expect(
      logs.body.some(
        (l) => l.acao === "venda.cancelar" && l.entidadeId === venda.body.id,
      ),
    ).toBe(true);
  });

  test("criar e cancelar compra geram logs de auditoria", async () => {
    const { token } = await criarEmpresaComAdmin();

    const fornecedor = await request(app)
      .post("/fornecedores")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Fornecedor Auditoria" });

    const produto = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "AUD-02", descricao: "Produto Auditoria 2", preco: 10 });

    const compra = await request(app)
      .post("/compras")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fornecedorId: fornecedor.body.id,
        itens: [{ produtoId: produto.body.id, quantidade: 5, precoUnitario: 10 }],
      });

    await request(app)
      .delete(`/compras/${compra.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(
      logs.body.some(
        (l) => l.acao === "compra.criar" && l.entidadeId === compra.body.id,
      ),
    ).toBe(true);
    expect(
      logs.body.some(
        (l) => l.acao === "compra.cancelar" && l.entidadeId === compra.body.id,
      ),
    ).toBe(true);
  });

  test("alterar permissões de um papel gera log de auditoria", async () => {
    const { token, papel } = await criarEmpresaComAdmin();

    const permissoes = await request(app)
      .get("/permissoes")
      .set("Authorization", `Bearer ${token}`);

    const permissaoId = permissoes.body[0].id;

    await request(app)
      .put(`/papeis/${papel.id}/permissoes`)
      .set("Authorization", `Bearer ${token}`)
      .send({ permissaoIds: [permissaoId] });

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(
      logs.body.some(
        (l) =>
          l.acao === "papel.permissoes.alterar" && l.entidadeId === papel.id,
      ),
    ).toBe(true);
  });

  test("logs são isolados por empresa", async () => {
    const empresaA = await criarEmpresaComAdmin();
    const empresaB = await criarEmpresaComAdmin();

    const logsB = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${empresaB.token}`);

    expect(
      logsB.body.some((l) => l.usuarioId === empresaA.usuario.id),
    ).toBe(false);
  });

  test("usuário sem a permissão auditoria.visualizar recebe 403", async () => {
    const { token } = await criarEmpresaComAdmin([]);

    const response = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});
