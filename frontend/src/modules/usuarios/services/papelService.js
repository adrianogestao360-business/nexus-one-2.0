import api from "../../../services/api";

const papelService = {
  listar: async () => {
    const response = await api.get("/papeis");
    return response.data;
  },
};

export default papelService;
