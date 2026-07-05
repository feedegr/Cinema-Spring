import { useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useShowtime } from "../hooks/useShowtime";
import { useSeatAvailability } from "../hooks/useSeatAvailability";
import { useCreateBooking } from "../hooks/useCreateBooking";

// Cuanto se muestra la pantalla de confirmacion antes de mandar sola al home.
const REDIRECT_DELAY_MS = 2500;

// Todavia no hay login: el frontend reserva "como" este usuario de prueba
// (sembrado en data.sql). Se reemplaza cuando exista autenticacion real.
const TEST_USER_ID = 1;

// Precio ficticio, solo para mostrar un total en el resumen - no existe un campo
// de precio en el modelo (Movie/Showtime), no se persiste en ningun lado.
const PRICE_PER_SEAT = 3000;

function formatDateTime(startTime: string) {
  return new Date(startTime).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(amount: number) {
  return amount.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const showtimeId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();
  const seatIds: number[] = location.state?.seatIds ?? [];

  const { data: showtime, isLoading: loadingShowtime, isError: errorShowtime } = useShowtime(showtimeId);
  const { data: seats, isLoading: loadingSeats, isError: errorSeats } = useSeatAvailability(showtimeId);
  const booking = useCreateBooking(showtimeId);

  useEffect(() => {
    if (!booking.isSuccess) return;
    const timer = setTimeout(() => navigate("/"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [booking.isSuccess, navigate]);

  if (seatIds.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-muted">No hay butacas seleccionadas para pagar.</p>
        <Link to={`/showtimes/${showtimeId}/seats`} className="text-xs uppercase tracking-widest text-marquee">
          ← Elegir butacas
        </Link>
      </div>
    );
  }

  if (loadingShowtime || loadingSeats) return <p className="text-muted">Cargando resumen...</p>;
  if (errorShowtime || errorSeats || !showtime)
    return (
      <p className="text-velvet-light">
        No pudimos cargar el resumen. Probá de nuevo en un momento.
      </p>
    );

  const selectedSeats = (seats ?? []).filter((seat) => seatIds.includes(seat.id));
  const total = selectedSeats.length * PRICE_PER_SEAT;

  function handlePay() {
    booking.mutate({ userId: TEST_USER_ID, showtimeId, seatIds });
  }

  if (booking.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-4xl tracking-wide text-available">¡Pago exitoso!</h1>
        <p className="text-muted">Tu reserva para {showtime.movie.title} quedó confirmada.</p>
        <p className="text-xs uppercase tracking-widest text-muted">Volviendo al inicio...</p>
        <Link to="/" className="mt-2 text-xs uppercase tracking-widest text-marquee">
          Ir ahora
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-screen">Confirmar y pagar</h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-muted">
          {showtime.movie.title} · {showtime.room.cinema?.name} · {showtime.room.name} ·{" "}
          {formatDateTime(showtime.startTime)}
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg bg-curtain-light p-6">
        <p className="text-xs uppercase tracking-widest text-muted">Butacas</p>
        <p className="mt-1 font-display text-2xl tracking-wide text-screen">
          {selectedSeats
            .sort((a, b) => a.seatRow.localeCompare(b.seatRow) || a.number - b.number)
            .map((seat) => `${seat.seatRow}${seat.number}`)
            .join(", ")}
        </p>

        <div className="film-strip mt-4 bg-marquee-dim" />

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>{selectedSeats.length} × {formatPrice(PRICE_PER_SEAT)}</span>
          <span className="font-display text-2xl tracking-wide text-marquee">{formatPrice(total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={booking.isPending}
        className="rounded-full bg-marquee px-8 py-3 text-sm font-semibold uppercase tracking-widest text-curtain transition-colors hover:bg-marquee-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee focus-visible:ring-offset-2 focus-visible:ring-offset-curtain disabled:opacity-50"
      >
        {booking.isPending ? "Procesando pago..." : `Pagar ${formatPrice(total)}`}
      </button>

      {booking.isError && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-occupied">{(booking.error as Error).message}</p>
          <Link
            to={`/showtimes/${showtimeId}/seats`}
            className="text-xs uppercase tracking-widest text-muted hover:text-marquee"
          >
            ← Volver a elegir butacas
          </Link>
        </div>
      )}
    </div>
  );
}
