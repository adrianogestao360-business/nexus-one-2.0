import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setMensagem("");

      await signIn(email, senha);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Erro no login:",
        error.response?.data || error.message,
      );

      setMensagem(
        error.response?.data?.message ||
          "Não foi possível realizar o login.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#0B1220",
      }}
    >
      <Card sx={{ width: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            mb={4}
          >
            Nexus One ERP
          </Typography>

          <TextField
            label="E-mail"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />

          <TextField
            label="Senha"
            type="password"
            fullWidth
            required
            margin="normal"
            value={senha}
            onChange={(event) =>
              setSenha(event.target.value)
            }
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              height: 48,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(mensagem)}
        autoHideDuration={5000}
        onClose={() => setMensagem("")}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          severity="error"
          onClose={() => setMensagem("")}
        >
          {mensagem}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Login;