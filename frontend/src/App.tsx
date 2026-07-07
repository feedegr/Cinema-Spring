import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { MoviesPage } from "./pages/MoviesPage";
import { CinemasPage } from "./pages/CinemasPage";
import { ShowtimesPage } from "./pages/ShowtimesPage";
import { ShowtimeSeatsPage } from "./pages/ShowtimeSeatsPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Peliculas" },
  { to: "/cinemas", label: "Cines" },
  { to: "/showtimes", label: "Funciones" },
];

function App() {
  const { user, logout } = useAuth();
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  const navLinks = user ? [...NAV_LINKS, { to: "/mis-reservas", label: "Mis reservas" }] : NAV_LINKS;

  return (
    <BrowserRouter>
      <header className="bg-curtain-light">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-display text-3xl tracking-wide text-marquee">
            CINE
          </span>
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-sm text-sm font-medium uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee focus-visible:ring-offset-2 focus-visible:ring-offset-curtain-light ${
                    isActive ? "text-marquee" : "text-muted hover:text-screen"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-widest text-muted">
                {user.name}
                {user.role === "ADMIN" && (
                  <span className="ml-2 rounded-full border border-marquee px-2 py-0.5 text-marquee">
                    Admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-xs uppercase tracking-widest text-muted hover:text-marquee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setAuthModal("login")}
                className="text-xs font-semibold uppercase tracking-widest text-muted hover:text-marquee focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthModal("signup")}
                className="rounded-full bg-marquee px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-curtain transition-colors hover:bg-marquee-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee focus-visible:ring-offset-2 focus-visible:ring-offset-curtain-light"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
        <div className="film-strip bg-marquee-dim" />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/cinemas" element={<CinemasPage />} />
          <Route path="/showtimes" element={<ShowtimesPage />} />
          <Route path="/showtimes/:id/seats" element={<ShowtimeSeatsPage />} />
          <Route path="/showtimes/:id/checkout" element={<CheckoutPage />} />
          <Route path="/mis-reservas" element={<MyBookingsPage />} />
        </Routes>
      </main>

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </BrowserRouter>
  );
}

export default App;
