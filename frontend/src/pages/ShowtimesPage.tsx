import { Link, useSearchParams } from "react-router-dom";
import type { Language } from "../types/Showtime";
import { useShowtimes } from "../hooks/useShowtimes";

function formatDate(startTime: string) {
  return new Date(startTime).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function formatTime(startTime: string) {
  return new Date(startTime).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const LANGUAGE_LABELS: Record<Language, string> = {
  DOBLADA: "Doblada",
  SUBTITULADA: "Subtitulada",
};

export function ShowtimesPage() {
  const { data: showtimes, isLoading, isError } = useShowtimes();
  const [searchParams] = useSearchParams();
  const cinemaId = searchParams.get("cinemaId");

  if (isLoading) return <p className="text-muted">Cargando funciones...</p>;
  if (isError)
    return (
      <p className="text-velvet-light">
        No pudimos cargar las funciones. Probá de nuevo en un momento.
      </p>
    );

  const filtered = cinemaId
    ? showtimes?.filter((s) => String(s.room.cinema?.id) === cinemaId)
    : showtimes;

  const cinemaName = cinemaId
    ? filtered?.[0]?.room.cinema?.name
    : undefined;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-4xl tracking-wide text-screen">
          {cinemaName ? `Funciones en ${cinemaName}` : "Funciones"}
        </h1>
        {cinemaId && (
          <Link
            to="/showtimes"
            className="text-xs uppercase tracking-widest text-muted hover:text-marquee"
          >
            Ver todos los cines
          </Link>
        )}
      </div>

      {filtered && filtered.length === 0 && (
        <p className="mt-8 text-muted">Este cine no tiene funciones cargadas.</p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {filtered?.map((showtime) => (
          <li
            key={showtime.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-curtain-light p-4"
          >
            <div className="flex items-center gap-5">
              <span className="font-display text-3xl tracking-wide text-marquee">
                {formatTime(showtime.startTime)}
              </span>
              <div>
                <p className="font-display text-xl tracking-wide text-screen">
                  {showtime.movie.title}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted">
                  {showtime.room.cinema?.name} · {showtime.room.name} ·{" "}
                  {formatDate(showtime.startTime)}
                </p>
              </div>
            </div>
            {showtime.language && (
              <span className="rounded-full border border-velvet-light px-3 py-1 text-xs uppercase tracking-widest text-velvet-light">
                {LANGUAGE_LABELS[showtime.language]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
