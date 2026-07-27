const axios = require("axios");

const BASE_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

class AnthropicClient {
  async enviarMensagem(prompt, { apiKey, model }) {
    const response = await axios.post(
      BASE_URL,
      {
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
          "content-type": "application/json",
        },
        timeout: 30000,
      },
    );

    return response.data.content?.[0]?.text || "";
  }
}

module.exports = new AnthropicClient();
