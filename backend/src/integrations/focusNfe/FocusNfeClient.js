const axios = require("axios");

const BASE_URLS = {
  homologacao: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br",
};

class FocusNfeClient {
  #cliente({ token, ambiente }) {
    return axios.create({
      baseURL: BASE_URLS[ambiente] || BASE_URLS.homologacao,
      auth: {
        username: token,
        password: "",
      },
      timeout: 15000,
    });
  }

  async emitirNfe(ref, payload, { token, ambiente }) {
    const cliente = this.#cliente({ token, ambiente });

    const response = await cliente.post(`/v2/nfe?ref=${ref}`, payload);

    return response.data;
  }

  async consultarNfe(ref, { token, ambiente }) {
    const cliente = this.#cliente({ token, ambiente });

    const response = await cliente.get(`/v2/nfe/${ref}`);

    return response.data;
  }

  async cancelarNfe(ref, justificativa, { token, ambiente }) {
    const cliente = this.#cliente({ token, ambiente });

    const response = await cliente.delete(`/v2/nfe/${ref}`, {
      data: { justificativa },
    });

    return response.data;
  }
}

module.exports = new FocusNfeClient();
