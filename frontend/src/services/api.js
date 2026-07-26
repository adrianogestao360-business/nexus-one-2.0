import axios from "axios";

const STORAGE_ACCESS_TOKEN = "@NexusOne:accessToken";
const STORAGE_REFRESH_TOKEN = "@NexusOne:refreshToken";
const STORAGE_USER = "@NexusOne:user";

const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function clearStoredSession() {
  localStorage.removeItem(STORAGE_USER);
  localStorage.removeItem(STORAGE_ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_REFRESH_TOKEN);
}

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem(STORAGE_ACCESS_TOKEN);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise = null;

function renovarSessao() {
  const refreshToken = localStorage.getItem(STORAGE_REFRESH_TOKEN);

  if (!refreshToken) {
    return Promise.reject(new Error("Sem refresh token."));
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken })
      .then((response) => {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(STORAGE_ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_REFRESH_TOKEN, newRefreshToken);

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isAuthRoute =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/refresh");

    if (response?.status !== 401 || isAuthRoute || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      const accessToken = await renovarSessao();

      config.headers.Authorization = `Bearer ${accessToken}`;

      return api(config);
    } catch {
      clearStoredSession();
      window.location.href = "/";

      return Promise.reject(error);
    }
  },
);

export default api;
