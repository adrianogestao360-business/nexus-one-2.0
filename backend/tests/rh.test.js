const request = require("supertest");

const { app, prisma, criarEmpresaComAdmin } = require("./helpers/testApp");

afterAll(async () => {
  await prisma.$disconnect();
});

async function criarCargo(token, nome = "Analista") {
  const response = await request(app)
    .post("/cargos")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome });

  return response.body;
}

async function criarFuncionario(token, dados = {}) {
  const response = await request(app)
    .post("/funcionarios")
    .set("Authorization", `Bearer ${token}`)
    .send({ nome: "Funcionário Teste", salarioBase: 3000, ...dados });

  return response.body;
}

describe("RH - Cargos", () => {
  test("cria e lista cargo", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cargo = await criarCargo(token, "Vendedor");

    expect(cargo.nome).toBe("Vendedor");

    const listagem = await request(app)
      .get("/cargos")
      .set("Authorization", `Bearer ${token}`);

    expect(listagem.status).toBe(200);
    expect(listagem.body.some((item) => item.id === cargo.id)).toBe(true);
  });

  test("criar cargo sem nome retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/cargos")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });
});

describe("RH - Funcionários", () => {
  test("cria funcionário vinculado a um cargo", async () => {
    const { token } = await criarEmpresaComAdmin();
    const cargo = await criarCargo(token);

    const funcionario = await criarFuncionario(token, {
      nome: "Maria Silva",
      salarioBase: 2500,
      cargoId: cargo.id,
    });

    expect(funcionario.nome).toBe("Maria Silva");
    expect(funcionario.cargo.id).toBe(cargo.id);
  });

  test("criar funcionário com cargo de outra empresa retorna 404", async () => {
    const { token } = await criarEmpresaComAdmin();
    const outraEmpresa = await criarEmpresaComAdmin();
    const cargoDeOutraEmpresa = await criarCargo(outraEmpresa.token);

    const response = await request(app)
      .post("/funcionarios")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Funcionário",
        salarioBase: 2000,
        cargoId: cargoDeOutraEmpresa.id,
      });

    expect(response.status).toBe(404);
  });

  test("criar funcionário sem salário base retorna 400", async () => {
    const { token } = await criarEmpresaComAdmin();

    const response = await request(app)
      .post("/funcionarios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nome: "Sem Salário" });

    expect(response.status).toBe(400);
  });

  test("desativar funcionário funciona", async () => {
    const { token } = await criarEmpresaComAdmin();
    const funcionario = await criarFuncionario(token);

    const response = await request(app)
      .delete(`/funcionarios/${funcionario.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(204);
  });
});

describe("RH - Folha de pagamento", () => {
  test("criar folha gera 1 item por funcionário ativo com proventos = salarioBase", async () => {
    const { token } = await criarEmpresaComAdmin();

    await criarFuncionario(token, { nome: "Ativo 1", salarioBase: 3000 });
    await criarFuncionario(token, { nome: "Ativo 2", salarioBase: 4000 });

    const response = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 3, ano: 2027 });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("aberta");
    expect(response.body.itens).toHaveLength(2);
    expect(Number(response.body.itens[0].valorLiquido)).toBe(
      Number(response.body.itens[0].proventos),
    );
  });

  test("funcionário desativado não entra na folha gerada depois", async () => {
    const { token } = await criarEmpresaComAdmin();

    const funcionario = await criarFuncionario(token, { salarioBase: 1000 });

    await request(app)
      .delete(`/funcionarios/${funcionario.id}`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 4, ano: 2027 });

    expect(response.status).toBe(400);
  });

  test("não permite duas folhas para o mesmo mês/ano", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarFuncionario(token);

    await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 5, ano: 2027 });

    const response = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 5, ano: 2027 });

    expect(response.status).toBe(400);
  });

  test("atualizar item recalcula valorLíquido", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarFuncionario(token, { salarioBase: 2000 });

    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 6, ano: 2027 });

    const item = folha.body.itens[0];

    const response = await request(app)
      .put(`/folhas-pagamento/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ proventos: 2200, descontos: 300 });

    expect(response.status).toBe(200);
    expect(Number(response.body.valorLiquido)).toBe(1900);
  });

  test("fechar folha gera 1 título 'pagar' por item e muda status", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarFuncionario(token, { nome: "Pago 1", salarioBase: 1500 });
    await criarFuncionario(token, { nome: "Pago 2", salarioBase: 2500 });

    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 7, ano: 2027 });

    const response = await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("fechada");

    const titulos = await request(app)
      .get("/titulos")
      .query({ tipo: "pagar" })
      .set("Authorization", `Bearer ${token}`);

    const titulosDaFolha = titulos.body.filter((titulo) =>
      titulo.descricao.startsWith("Folha 07/2027"),
    );

    expect(titulosDaFolha).toHaveLength(2);
    expect(titulosDaFolha.map((t) => Number(t.valor)).sort()).toEqual([
      1500, 2500,
    ]);
  });

  test("não permite editar item de folha já fechada", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarFuncionario(token, { salarioBase: 1000 });

    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 8, ano: 2027 });

    await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const item = folha.body.itens[0];

    const response = await request(app)
      .put(`/folhas-pagamento/itens/${item.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ proventos: 999 });

    expect(response.status).toBe(400);
  });

  test("não permite fechar folha já fechada", async () => {
    const { token } = await criarEmpresaComAdmin();
    await criarFuncionario(token, { salarioBase: 1000 });

    const folha = await request(app)
      .post("/folhas-pagamento")
      .set("Authorization", `Bearer ${token}`)
      .send({ mes: 9, ano: 2027 });

    await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post(`/folhas-pagamento/${folha.body.id}/fechar`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
