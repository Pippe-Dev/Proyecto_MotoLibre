import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/authContext";

// Protege rutas que exigen sesión. Al redirigir al login recuerda a dónde
// quería ir el usuario para volver allí después de iniciar sesión.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="container py-5" aria-busy="true">
        <div className="skeleton skeleton--card" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

// Para login/registro: si ya hay sesión no tiene sentido mostrarlos.
export function GuestOnlyRoute() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
