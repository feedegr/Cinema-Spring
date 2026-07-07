import { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

interface AuthModalProps {
  mode: Mode;
  onClose: () => void;
}

const TITLES: Record<Mode, string> = {
  login: "Iniciar sesión",
  signup: "Crear cuenta",
};

const SUBMIT_LABELS: Record<Mode, string> = {
  login: "Entrar",
  signup: "Crear cuenta",
};

export function AuthModal({ mode, onClose }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClasses =
    "w-full rounded-md border border-velvet bg-curtain px-3 py-2 text-sm text-screen placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-marquee";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-3xl tracking-wide text-screen">{TITLES[mode]}</h2>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        {mode === "signup" && (
          <input
            type="text"
            required
            placeholder="Nombre"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClasses}
          />
        )}
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClasses}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClasses}
        />

        {error && <p className="text-sm text-occupied">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-full bg-marquee px-6 py-2 text-sm font-semibold uppercase tracking-widest text-curtain transition-colors hover:bg-marquee-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee focus-visible:ring-offset-2 focus-visible:ring-offset-curtain-light disabled:opacity-50"
        >
          {isSubmitting ? "Un momento..." : SUBMIT_LABELS[mode]}
        </button>
      </form>
    </Modal>
  );
}
