import { Link } from "react-router-dom";
import { useBookings } from "../hooks/useBookings";
import { useAuth } from "../context/AuthContext";
import type { Language } from "../types/Showtime";

const LANGUAGE_LABELS: Record<Language, string> = {
  DOBLADA: "Doblada",
  SUBTITULADA: "Subtitulada",
};

function formatDateTime(startTime: string) {
  return new Date(startTime).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatBookedAt(bookedAt: string) {
  return new Date(bookedAt).toLocaleDateString("es-AR", {
    dateStyle: "medium",
  });
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const { data: bookings, isLoading, isError } = useBookings(user?.id);

  if (!user) {
    return (
      <div className="flex flex-col items-start gap-2">
        <p className="text-muted">Iniciá sesión para ver tus reservas.</p>
      </div>
    );
  }

  if (isLoading) return <p className="text-muted">Cargando tus reservas...</p>;
  if (isError)
    return (
      <p className="text-velvet-light">
        No pudimos cargar tus reservas. Probá de nuevo en un momento.
      </p>
    );

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide text-screen">Mis reservas</h1>

      {bookings && bookings.length === 0 && (
        <div className="mt-8 flex flex-col items-start gap-2">
          <p className="text-muted">Todavía no hiciste ninguna reserva.</p>
          <Link to="/" className="text-xs uppercase tracking-widest text-marquee">
            Ver cartelera
          </Link>
        </div>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {bookings?.map((booking) => {
          const seats = [...booking.seats].sort(
            (a, b) => a.seatRow.localeCompare(b.seatRow) || a.number - b.number
          );

          return (
            <li key={booking.id} className="rounded-lg bg-curtain-light p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl tracking-wide text-screen">
                  {booking.showtime.movie.title}
                </h2>
                {booking.showtime.language && (
                  <span className="rounded-full border border-velvet-light px-3 py-1 text-xs uppercase tracking-widest text-velvet-light">
                    {LANGUAGE_LABELS[booking.showtime.language]}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                {booking.showtime.room.cinema?.name} · {booking.showtime.room.name} ·{" "}
                {formatDateTime(booking.showtime.startTime)}
              </p>

              <div className="film-strip mt-4 bg-marquee-dim" />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-screen">
                  Butacas:{" "}
                  <span className="font-display text-lg tracking-wide text-marquee">
                    {seats.map((seat) => `${seat.seatRow}${seat.number}`).join(", ")}
                  </span>
                </p>
                <p className="text-xs uppercase tracking-widest text-muted">
                  Reservado el {formatBookedAt(booking.bookedAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
