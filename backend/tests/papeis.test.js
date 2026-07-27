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

describe("Papéis - exclusão", () => {
  test("exclui papel sem usuários vinculados", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papel = await request(app)
      .post("/papeis")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Vendedor" });

    const resposta = await request(app)
      .delete(`/papeis/${papel.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(204);

    const listagem = await request(app)
      .get("/papeis")
      .set("Authorization", `Bearer ${token}`);

    expect(listagem.body.some((p) => p.id === papel.body.id)).toBe(false);
  });

  test("não permite excluir papel com usuário vinculado", async () => {
    const { token, empresa, papel } = await criarEmpresaComAdmin();

    await adicionarUsuario(empresa, papel);

    const resposta = await request(app)
      .delete(`/papeis/${papel.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(resposta.status).toBe(400);

    const listagem = await request(app)
      .get("/papeis")
      .set("Authorization", `Bearer ${token}`);

    expect(listagem.body.some((p) => p.id === papel.id)).toBe(true);
  });

  test("excluir papel de outra empresa retorna 404", async () => {
    const empresaA = await criarEmpresaComAdmin();
    const empresaB = await criarEmpresaComAdmin();

    const resposta = await request(app)
      .delete(`/papeis/${empresaA.papel.id}`)
      .set("Authorization", `Bearer ${empresaB.token}`);

    expect(resposta.status).toBe(404);
  });

  test("excluir papel gera log de auditoria", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papel = await request(app)
      .post("/papeis")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Financeiro" });

    await request(app)
      .delete(`/papeis/${papel.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    const logs = await request(app)
      .get("/auditoria")
      .set("Authorization", `Bearer ${token}`);

    expect(
      logs.body.some(
        (l) => l.acao === "papel.excluir" && l.entidadeId === papel.body.id,
      ),
    ).toBe(true);
  });

  test("usuário sem papeis.gerenciar recebe 403 ao excluir", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papel = await request(app)
      .post("/papeis")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Sem Permissão" });

    const semPermissao = await criarEmpresaComAdmin([]);

    const resposta = await request(app)
      .delete(`/papeis/${papel.body.id}`)
      .set("Authorization", `Bearer ${semPermissao.token}`);

    expect(resposta.status).toBe(403);
  });
});
