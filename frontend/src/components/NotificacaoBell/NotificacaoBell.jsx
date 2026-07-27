import { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";

import notificacaoService from "../../services/notificacaoService";

const INTERVALO_ATUALIZACAO_MS = 30000;

function NotificacaoBell() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const intervalRef = useRef(null);

  async function carregar() {
    try {
      const dados = await notificacaoService.listar();
      setNotificacoes(dados);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }

  useEffect(() => {
    carregar();

    intervalRef.current = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  async function dispensar(chave) {
    try {
      await notificacaoService.marcarComoLida(chave);
      setNotificacoes((old) => old.filter((item) => item.chave !== chave));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }

  return (
    <Box>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Badge badgeContent={notificacoes.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: { width: 380, maxHeight: 480 },
          },
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, py: 1 }}>
          Notificações
        </Typography>

        <Divider />

        {notificacoes.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2 }}
          >
            Nenhuma notificação no momento.
          </Typography>
        )}

        <List dense disablePadding>
          {notificacoes.map((notificacao) => (
            <ListItem
              key={notificacao.chave}
              divider
              secondaryAction={
                <IconButton
                  size="small"
                  onClick={() => dispensar(notificacao.chave)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    color={
                      notificacao.severidade === "error"
                        ? "error"
                        : "text.primary"
                    }
                  >
                    {notificacao.mensagem}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </Box>
  );
}

export default NotificacaoBell;
