const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth", () => {
  test("login com credenciais válidas retorna token e permissões", async () => {
    const { usuario, senha } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/auth/login")
      .send({ email: usuario.email, senha });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.usuario.empresaId).toBe(usuario.empresaId);
    expect(response.body.usuario.permissoes).toEqual(
      expect.arrayContaining(["produtos.gerenciar", "vendas.gerenciar"]),
    );
  });

  test("login com senha errada retorna 401", async () => {
    const { usuario } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/auth/login")
      .send({ email: usuario.email, senha: "SenhaErrada" });

    expect(response.status).toBe(401);
  });

  test("rota protegida sem token retorna 401", async () => {
    const response = await request(app).get("/produtos");

    expect(response.status).toBe(401);
  });

  test("rota protegida sem a permissão necessária retorna 403", async () => {
    const { token } = await criarEmpresaComAdmin([]); // sem nenhuma permissão

    const response = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "X", descricao: "X", preco: 1 });

    expect(response.status).toBe(403);
  });

  test("dados são isolados por empresa", async () => {
    const empresaA = await criarEmpresaComAdmin();
    const empresaB = await criarEmpresaComAdmin();

    await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${empresaA.token}`)
      .send({ codigo: "ISO-A", descricao: "Produto A", preco: 10 });

    const listaB = await request(app)
      .get("/produtos")
      .set("Authorization", `Bearer ${empresaB.token}`);

    expect(listaB.body.some((p) => p.codigo === "ISO-A")).toBe(false);
  });

  describe("multi-empresa", () => {
    test("usuário sem papel em outra empresa não consegue trocar para ela", async () => {
      const { token } = await criarEmpresaComAdmin();
      const outraEmpresa = await criarEmpresaComAdmin();

      const response = await request(app)
        .post("/auth/trocar-empresa")
        .set("Authorization", `Bearer ${token}`)
        .send({ empresaId: outraEmpresa.empresa.id });

      expect(response.status).toBe(403);
    });

    test("usuário com papel em duas empresas troca de contexto com sucesso e isolamento se mantém", async () => {
      const { usuario, empresa: empresaCasa, token } = await criarEmpresaComAdmin();

      const empresaB = await prisma.empresa.create({
        data: {
          razaoSocial: "Empresa B Multi",
          nomeFantasia: "Empresa B",
          cnpj: `TEST-B-${Date.now()}`,
        },
      });

      const papelB = await prisma.papel.create({
        data: { nome: "Administrador", empresaId: empresaB.id },
      });

      const permissao = await prisma.permissao.upsert({
        where: { codigo: "produtos.gerenciar" },
        update: {},
        create: { codigo: "produtos.gerenciar" },
      });

      await prisma.papelPermissao.create({
        data: { papelId: papelB.id, permissaoId: permissao.id },
      });

      await prisma.usuarioPapel.create({
        data: { usuarioId: usuario.id, papelId: papelB.id },
      });

      const minhasEmpresas = await request(app)
        .get("/auth/minhas-empresas")
        .set("Authorization", `Bearer ${token}`);

      expect(minhasEmpresas.body.map((e) => e.id)).toEqual(
        expect.arrayContaining([empresaCasa.id, empresaB.id]),
      );

      const troca = await request(app)
        .post("/auth/trocar-empresa")
        .set("Authorization", `Bearer ${token}`)
        .send({ empresaId: empresaB.id });

      expect(troca.status).toBe(200);
      expect(troca.body.usuario.empresaId).toBe(empresaB.id);
      // só tinha produtos.gerenciar atribuído na empresa B, nada mais
      expect(troca.body.usuario.permissoes).toEqual(["produtos.gerenciar"]);

      await request(app)
        .post("/produtos")
        .set("Authorization", `Bearer ${troca.body.accessToken}`)
        .send({ codigo: "B-01", descricao: "Produto da B", preco: 5 });

      const produtosCasa = await request(app)
        .get("/produtos")
        .set("Authorization", `Bearer ${token}`);

      expect(produtosCasa.body.some((p) => p.codigo === "B-01")).toBe(false);
    });
  });
});
