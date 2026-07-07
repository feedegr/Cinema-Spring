import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as api from "../api/client";
import type { User } from "../types/User";

const STORAGE_KEY = "cine_auth_user";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Sesion "basica": no hay JWT ni token todavia (TODO en el roadmap), asi que lo unico
// que se persiste es el usuario devuelto por login/signup (sin password, el backend
// nunca lo manda). Alcanza para que la UI recuerde quien esta logueado entre refrescos.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  async function login(email: string, password: string) {
    setUser(await api.login(email, password));
  }

  async function signup(name: string, email: string, password: string) {
    setUser(await api.signup(name, email, password));
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
