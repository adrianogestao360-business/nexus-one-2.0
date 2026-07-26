const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarOportunidade(token) {
  const cliente = await request(app)
    .post("/clientes")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Cliente CRM" });

  const oportunidade = await request(app)
    .post("/oportunidades")
    .set("Authorization", `Bearer ${token}`)
    .send({ titulo: "Negócio Teste", clienteId: cliente.body.id, valor: 1000 });

  return oportunidade.body;
}

describe("CRM", () => {
  test("criar oportunidade começa no estágio 'novo'", async () => {
    const { token } = await criarEmpresaComAdmin();
    const oportunidade = await criarOportunidade(token);

    expect(oportunidade.estagio).toBe("novo");
  });

  test("mover para estágio válido funciona", async () => {
    const { token } = await criarEmpresaComAdmin();
    const oportunidade = await criarOportunidade(token);

    const response = await request(app)
      .patch(`/oportunidades/${oportunidade.id}/estagio`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estagio: "proposta" });

    expect(response.status).toBe(200);
    expect(response.body.estagio).toBe("proposta");
  });

  test("mover para estágio inválido retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const oportunidade = await criarOportunidade(token);

    const response = await request(app)
      .patch(`/oportunidades/${oportunidade.id}/estagio`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estagio: "nao-existe" });

    expect(response.status).toBe(400);
  });

  test("mover para 'perdido' sem motivo retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();
    const oportunidade = await criarOportunidade(token);

    const response = await request(app)
      .patch(`/oportunidades/${oportunidade.id}/estagio`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estagio: "perdido" });

    expect(response.status).toBe(400);
  });

  test("mover para 'perdido' com motivo funciona e grava o motivo", async () => {
    const { token } = await criarEmpresaComAdmin();
    const oportunidade = await criarOportunidade(token);

    const response = await request(app)
      .patch(`/oportunidades/${oportunidade.id}/estagio`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estagio: "perdido", motivoPerda: "Preço" });

    expect(response.status).toBe(200);
    expect(response.body.estagio).toBe("perdido");
    expect(response.body.motivoPerda).toBe("Preço");
  });
});
