import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { PasswordField } from "../components/auth/authCard";
import { DOCUMENT_TYPES } from "../constants/documentTypes";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";


const MIN_PASSWORD_LENGTH = 8;

export function ProfilePage() {
  const { user, profile, updateProfile, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [nombre, setNombre] = useState(profile.nombre ?? "");
  const [celular, setCelular] = useState(profile.celular ?? "");
  const [tipoDocumento, setTipoDocumento] = useState(
    profile.tipoDocumento ?? DOCUMENT_TYPES[0].value
  );
  const [documento, setDocumento] = useState(profile.documento ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleProfile = async (event: FormEvent) => {
    event.preventDefault();
    setProfileError("");
    setSavingProfile(true);

    try {
      await updateProfile({
        nombre: nombre.trim(),
        celular: celular.trim(),
        tipoDocumento,
        documento: documento.trim(),
      });
      showToast("Perfil actualizado.", "success");
    } catch (caught) {
      setProfileError(caught instanceof Error ? caught.message : "No se pudo guardar el perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setSavingPassword(true);

    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      showToast("Contraseña actualizada.", "success");
    } catch (caught) {
      setPasswordError(
        caught instanceof Error ? caught.message : "No se pudo cambiar la contraseña."
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const initial = (profile.nombre ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <main className="container py-4 profile-page">
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">
          {initial}
        </div>
        <div>
          <h1 className="page-title mb-0">{profile.nombre || "Mi cuenta"}</h1>
          <p className="profile-header__email">{user?.email}</p>
        </div>
        <Link to="/reservas" className="btn btn-outline-primary ms-auto">
          <i className="bi bi-bag-check" aria-hidden="true" /> Mis reservas
        </Link>
      </header>

      <div className="profile-grid">
        <section className="profile-card">
          <h2>Datos personales</h2>
          <p className="profile-card__help">
            Se usarán para rellenar automáticamente tus reservas.
          </p>

          <form className="auth-form" onSubmit={handleProfile}>
            <div className="auth-field">
              <label htmlFor="profile-nombre">Nombre completo</label>
              <input
                id="profile-nombre"
                className="form-control"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="profile-celular">Celular</label>
              <input
                id="profile-celular"
                className="form-control"
                type="tel"
                value={celular}
                onChange={(event) => setCelular(event.target.value)}
              />
            </div>

            <div className="profile-row">
              <div className="auth-field">
                <label htmlFor="profile-tipo-documento">Tipo de documento</label>
                <select
                  id="profile-tipo-documento"
                  className="form-select"
                  value={tipoDocumento}
                  onChange={(event) => setTipoDocumento(event.target.value)}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label htmlFor="profile-documento">Número de documento</label>
                <input
                  id="profile-documento"
                  className="form-control"
                  value={documento}
                  onChange={(event) => setDocumento(event.target.value)}
                />
              </div>
            </div>

            {profileError && (
              <p className="auth-alert auth-alert--error" role="alert">
                {profileError}
              </p>
            )}

            <button type="submit" className="btn btn-primary auth-form__submit" disabled={savingProfile}>
              {savingProfile ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <h2>Seguridad</h2>
          <p className="profile-card__help">Cambia la contraseña de tu cuenta.</p>

          <form className="auth-form" onSubmit={handlePassword}>
            <PasswordField
              id="profile-password"
              label="Contraseña nueva"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
            />
            <PasswordField
              id="profile-confirm"
              label="Confirmar contraseña"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />

            {passwordError && (
              <p className="auth-alert auth-alert--error" role="alert">
                {passwordError}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-outline-primary auth-form__submit"
              disabled={savingPassword}
            >
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
