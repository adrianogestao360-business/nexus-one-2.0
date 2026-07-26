import { createContext, useContext, useState } from "react";

import api from "../services/api";

const AuthContext = createContext({});

function getStoredUser() {
  const storedUser = localStorage.getItem("@NexusOne:user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("@NexusOne:user");
    return null;
  }
}

function getStoredAccessToken() {
  return localStorage.getItem("@NexusOne:accessToken");
}

function clearStoredSession() {
  localStorage.removeItem("@NexusOne:user");
  localStorage.removeItem("@NexusOne:accessToken");
  localStorage.removeItem("@NexusOne:refreshToken");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [accessToken, setAccessToken] = useState(getStoredAccessToken);

  async function signIn(email, senha) {
    clearStoredSession();
    setUser(null);
    setAccessToken(null);

    const response = await api.post("/auth/login", {
      email,
      senha,
    });

    const {
      usuario,
      accessToken: newAccessToken,
      refreshToken,
    } = response.data;

    localStorage.setItem(
      "@NexusOne:user",
      JSON.stringify(usuario),
    );

    localStorage.setItem(
      "@NexusOne:accessToken",
      newAccessToken,
    );

    localStorage.setItem(
      "@NexusOne:refreshToken",
      refreshToken,
    );

    setUser(usuario);
    setAccessToken(newAccessToken);
  }

  function signOut() {
    clearStoredSession();
    setUser(null);
    setAccessToken(null);
  }

  async function listarEmpresasDisponiveis() {
    const response = await api.get("/auth/minhas-empresas");
    return response.data;
  }

  async function trocarEmpresa(empresaId) {
    const response = await api.post("/auth/trocar-empresa", { empresaId });

    const {
      usuario,
      accessToken: newAccessToken,
      refreshToken,
    } = response.data;

    localStorage.setItem("@NexusOne:user", JSON.stringify(usuario));
    localStorage.setItem("@NexusOne:accessToken", newAccessToken);
    localStorage.setItem("@NexusOne:refreshToken", refreshToken);

    setUser(usuario);
    setAccessToken(newAccessToken);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        signIn,
        signOut,
        listarEmpresasDisponiveis,
        trocarEmpresa,
        authenticated: Boolean(user && accessToken),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}