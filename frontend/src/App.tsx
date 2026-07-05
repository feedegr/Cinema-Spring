import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { MoviesPage } from "./pages/MoviesPage";
import { CinemasPage } from "./pages/CinemasPage";
import { ShowtimesPage } from "./pages/ShowtimesPage";
import { ShowtimeSeatsPage } from "./pages/ShowtimeSeatsPage";
import { CheckoutPage } from "./pages/CheckoutPage";

const NAV_LINKS = [
  { to: "/", label: "Peliculas" },
  { to: "/cinemas", label: "Cines" },
  { to: "/showtimes", label: "Funciones" },
];

function App() {
  return (
    <BrowserRouter>
      <header className="bg-curtain-light">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-display text-3xl tracking-wide text-marquee">
            CINE
          </span>
          <nav className="flex gap-8">
            {NAV_LINKS.map((link) => (
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
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
