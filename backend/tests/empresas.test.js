const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");
const {
  CODIGOS_PERMISSOES_PADRAO,
} = require("../src/constants/permissoes");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Empresas - provisionamento automático", () => {
  test("criar empresa provisiona papel Administrador com todas as permissões", async () => {
    const { token } = await criarEmpresaComAdmin();

    const novaEmpresa = await request(app)
      .post("/empresas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        razaoSocial: "Nova Empresa Ltda",
        nomeFantasia: "Nova Empresa",
        cnpj: `CNPJ-${Date.now()}`,
      });

    expect(novaEmpresa.status).toBe(201);

    const papeis = await prisma.papel.findMany({
      where: { empresaId: novaEmpresa.body.id },
      include: { papelPermissoes: { include: { permissao: true } } },
    });

    expect(papeis).toHaveLength(1);
    expect(papeis[0].nome).toBe("Administrador");

    const codigos = papeis[0].papelPermissoes.map(
      (item) => item.permissao.codigo,
    );

    for (const codigo of CODIGOS_PERMISSOES_PADRAO) {
      expect(codigos).toContain(codigo);
    }
  });

  test("primeiro usuário da empresa nova consegue ser vinculado ao papel Administrador provisionado", async () => {
    const { token } = await criarEmpresaComAdmin();

    const novaEmpresa = await request(app)
      .post("/empresas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        razaoSocial: "Empresa Onboarding Ltda",
        nomeFantasia: "Onboarding",
        cnpj: `CNPJ-${Date.now()}-2`,
      });

    const papel = await prisma.papel.findFirst({
      where: { empresaId: novaEmpresa.body.id },
    });

    const usuario = await prisma.usuario.create({
      data: {
        nome: "Primeiro Admin",
        email: `primeiro-${Date.now()}@teste.com`,
        senha: "hash-fake",
        empresaId: novaEmpresa.body.id,
        usuarioPapeis: {
          create: { papelId: papel.id },
        },
      },
      include: { usuarioPapeis: true },
    });

    expect(usuario.usuarioPapeis).toHaveLength(1);
    expect(usuario.usuarioPapeis[0].papelId).toBe(papel.id);
  });
});
