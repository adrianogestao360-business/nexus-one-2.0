const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarPapel(token, nome) {
  const response = await request(app)
    .post("/papeis")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome });

  return response.body;
}

describe("Usuários - múltiplos papéis", () => {
  test("cria usuário com múltiplos papéis", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papelA = await criarPapel(token, "Vendedor");
    const papelB = await criarPapel(token, "Financeiro");

    const response = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Multi Papel",
        email: `multi-${Date.now()}@teste.com`,
        senha: "Senha@123",
        papelIds: [papelA.id, papelB.id],
      });

    expect(response.status).toBe(201);
    expect(response.body.papeis).toHaveLength(2);
    expect(response.body.papeis.map((p) => p.id).sort()).toEqual(
      [papelA.id, papelB.id].sort(),
    );
  });

  test("atualizar usuário substitui completamente a lista de papéis", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papelA = await criarPapel(token, "Papel A");
    const papelB = await criarPapel(token, "Papel B");
    const papelC = await criarPapel(token, "Papel C");

    const usuario = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Trocando Papel",
        email: `trocando-${Date.now()}@teste.com`,
        senha: "Senha@123",
        papelIds: [papelA.id, papelB.id],
      });

    const atualizado = await request(app)
      .put(`/usuarios/${usuario.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Trocando Papel",
        email: usuario.body.email,
        papelIds: [papelC.id],
      });

    expect(atualizado.status).toBe(200);
    expect(atualizado.body.papeis).toHaveLength(1);
    expect(atualizado.body.papeis[0].id).toBe(papelC.id);
  });

  test("atualizar usuário com papelIds vazio remove todos os papéis", async () => {
    const { token } = await criarEmpresaComAdmin();

    const papelA = await criarPapel(token, "Papel Removível");

    const usuario = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Sem Papel",
        email: `sempapel-${Date.now()}@teste.com`,
        senha: "Senha@123",
        papelIds: [papelA.id],
      });

    const atualizado = await request(app)
      .put(`/usuarios/${usuario.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Sem Papel",
        email: usuario.body.email,
        papelIds: [],
      });

    expect(atualizado.status).toBe(200);
    expect(atualizado.body.papeis).toHaveLength(0);
  });

  test("criar usuário com papel de outra empresa retorna 404", async () => {
    const { token } = await criarEmpresaComAdmin();
    const outraEmpresa = await criarEmpresaComAdmin();
    const papelDeOutraEmpresa = await criarPapel(
      outraEmpresa.token,
      "Papel Externo",
    );

    const response = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Inválido",
        email: `invalido-${Date.now()}@teste.com`,
        senha: "Senha@123",
        papelIds: [papelDeOutraEmpresa.id],
      });

    expect(response.status).toBe(404);
  });

  test("criar usuário com papelIds que não é uma lista retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuário Payload Errado",
        email: `payload-${Date.now()}@teste.com`,
        senha: "Senha@123",
        papelIds: "não-é-array",
      });

    expect(response.status).toBe(400);
  });
});
