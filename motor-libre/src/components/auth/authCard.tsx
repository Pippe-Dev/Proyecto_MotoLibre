import { useState } from "react";

import { useAuth } from "../../context/authContext";


interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const { configured } = useAuth();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__brand" aria-hidden="true">
          <i className="bi bi-person-circle" />
        </div>
        <h1 className="auth-card__title">{title}</h1>
        <p className="auth-card__subtitle">{subtitle}</p>

        {!configured && (
          <p className="auth-alert auth-alert--error" role="alert">
            Supabase no está configurado. Define <code>VITE_SUPABASE_URL</code> y{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> en el archivo <code>.env</code> y reinicia
            el servidor.
          </p>
        )}

        {children}

        {footer && <div className="auth-card__footer">{footer}</div>}
      </section>
    </main>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  hint?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <i className="bi bi-lock" aria-hidden="true" />
        <input
          id={id}
          className="form-control"
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          className="auth-field__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true" />
        </button>
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}
