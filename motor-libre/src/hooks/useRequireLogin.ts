import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";

// Devuelve una función que comprueba la sesión: si no hay, avisa y lleva al login
// (que vuelve a la página actual al terminar) y devuelve false.
export function useRequireLogin(): () => boolean {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (user) {
      return true;
    }

    showToast("Inicia sesión o crea una cuenta para reservar.", "info");
    navigate("/login", { state: { from: location.pathname } });
    return false;
  }, [user, showToast, navigate, location.pathname]);
}
