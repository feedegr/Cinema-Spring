import { useRef } from "react";
import { useMovies } from "../hooks/useMovies";

const SCROLL_AMOUNT = 300;

export function MoviesPage() {
  const { data: movies, isLoading, isError } = useMovies();
  const trackRef = useRef<HTMLUListElement>(null);

  if (isLoading) return <p className="text-muted">Cargando cartelera...</p>;
  if (isError)
    return (
      <p className="text-velvet-light">
        No pudimos cargar la cartelera. Probá de nuevo en un momento.
      </p>
    );

  function scroll(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * SCROLL_AMOUNT, behavior: "smooth" });
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-4xl tracking-wide text-screen">
          En cartelera
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="rounded-full bg-curtain-light p-2 text-screen transition-colors hover:bg-curtain-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Siguiente"
            className="rounded-full bg-curtain-light p-2 text-screen transition-colors hover:bg-curtain-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
      >
        {movies?.map((movie) => (
          <li
            key={movie.id}
            className="group w-64 shrink-0 snap-start overflow-hidden rounded-lg bg-curtain-light shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="aspect-2/3 overflow-hidden bg-curtain-lighter">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted">
                  Sin poster
                </div>
              )}
            </div>
            <div className="film-strip bg-marquee-dim" />
            <div className="p-4">
              <h2 className="font-display text-2xl tracking-wide text-screen">
                {movie.title}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                {movie.genre}
                {movie.durationMinutes ? ` · ${movie.durationMinutes} min` : ""}
              </p>
              {movie.synopsis && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
                  {movie.synopsis}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
