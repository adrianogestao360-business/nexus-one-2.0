const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Produtos", () => {
  test("criar produto sem estoque inicial não gera EstoqueLocalizacao", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "P-01", descricao: "Produto sem estoque", preco: 10 });

    expect(response.status).toBe(201);
    expect(response.body.estoque).toBe(0);

    const estoques = await request(app)
      .get(`/estoque-localizacoes?produtoId=${response.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(estoques.body).toHaveLength(0);
  });

  test("criar produto com estoque inicial credita a localização GERAL", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        codigo: "P-02",
        descricao: "Produto com estoque",
        preco: 20,
        estoque: 50,
      });

    expect(response.status).toBe(201);
    expect(response.body.estoque).toBe(50);

    const estoques = await request(app)
      .get(`/estoque-localizacoes?produtoId=${response.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(estoques.body).toHaveLength(1);
    expect(estoques.body[0].localizacao.codigo).toBe("GERAL");
    expect(estoques.body[0].quantidade).toBe(50);
  });

  test("criar produto sem código ou descrição retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ preco: 10 });

    expect(response.status).toBe(400);
  });

  test("atualizar e desativar produto", async () => {
    const { token } = await criarEmpresaComAdmin();

    const criado = await request(app)
      .post("/produtos")
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "P-03", descricao: "Original", preco: 10 });

    const atualizado = await request(app)
      .put(`/produtos/${criado.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ codigo: "P-03", descricao: "Editado", preco: 15 });

    expect(atualizado.status).toBe(200);
    expect(atualizado.body.descricao).toBe("Editado");

    const desativado = await request(app)
      .delete(`/produtos/${criado.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(desativado.status).toBe(204);

    const busca = await request(app)
      .get(`/produtos/${criado.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(busca.body.ativo).toBe(false);
  });
});
