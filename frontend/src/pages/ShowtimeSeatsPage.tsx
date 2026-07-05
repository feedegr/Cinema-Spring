import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShowtime } from "../hooks/useShowtime";
import { useSeatAvailability } from "../hooks/useSeatAvailability";
import { useCreateBooking } from "../hooks/useCreateBooking";
import type { SeatAvailability } from "../types/SeatAvailability";

// Todavia no hay login: el frontend reserva "como" este usuario de prueba
// (sembrado en data.sql). Se reemplaza cuando exista autenticacion real.
const TEST_USER_ID = 1;

function formatDateTime(startTime: string) {
  return new Date(startTime).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function groupByRow(seats: SeatAvailability[]) {
  const rows = new Map<string, SeatAvailability[]>();
  for (const seat of seats) {
    const row = rows.get(seat.seatRow) ?? [];
    row.push(seat);
    rows.set(seat.seatRow, row);
  }
  return [...rows.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function ShowtimeSeatsPage() {
  const { id } = useParams<{ id: string }>();
  const showtimeId = Number(id);

  const { data: showtime, isLoading: loadingShowtime, isError: errorShowtime } = useShowtime(showtimeId);
  const { data: seats, isLoading: loadingSeats, isError: errorSeats } = useSeatAvailability(showtimeId);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const booking = useCreateBooking(showtimeId);

  function toggleSeat(seat: SeatAvailability) {
    if (seat.occupied) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        next.add(seat.id);
      }
      return next;
    });
  }

  function handleReserve() {
    booking.mutate(
      { userId: TEST_USER_ID, showtimeId, seatIds: [...selectedIds] },
      { onSuccess: () => setSelectedIds(new Set()) }
    );
  }

  if (loadingShowtime || loadingSeats) return <p className="text-muted">Cargando butacas...</p>;
  if (errorShowtime || errorSeats || !showtime)
    return (
      <p className="text-velvet-light">
        No pudimos cargar esta función. Probá de nuevo en un momento.
      </p>
    );

  return (
    <div className="flex flex-col items-center text-center">
      <Link
        to={`/showtimes?cinemaId=${showtime.room.cinema?.id ?? ""}`}
        className="self-start text-xs uppercase tracking-widest text-muted hover:text-marquee"
      >
        ← Volver a funciones
      </Link>

      <h1 className="mt-2 font-display text-4xl tracking-wide text-screen">
        {showtime.movie.title}
      </h1>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
        {showtime.room.cinema?.name} · {showtime.room.name} · {formatDateTime(showtime.startTime)}
      </p>

      <div className="mt-8 flex justify-center gap-6 text-xs uppercase tracking-widest text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-available" /> Disponible
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-occupied" /> Ocupada
        </span>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        {groupByRow(seats ?? []).map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-4 font-display text-lg text-muted">{row}</span>
            <div className="flex flex-wrap justify-center gap-2">
              {rowSeats
                .sort((a, b) => a.number - b.number)
                .map((seat) => {
                  const selected = selectedIds.has(seat.id);
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={seat.occupied}
                      onClick={() => toggleSeat(seat)}
                      title={`${seat.seatRow}${seat.number} - ${seat.occupied ? "Ocupada" : "Disponible"}`}
                      className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-curtain transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee ${
                        seat.occupied || selected ? "bg-occupied" : "bg-available hover:bg-available-dim"
                      } ${seat.occupied ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={handleReserve}
          disabled={booking.isPending}
          className="mt-8 rounded-full bg-marquee px-6 py-2 text-sm font-semibold uppercase tracking-widest text-curtain transition-colors hover:bg-marquee-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee focus-visible:ring-offset-2 focus-visible:ring-offset-curtain disabled:opacity-50"
        >
          {booking.isPending
            ? "Reservando..."
            : `Reservar ${selectedIds.size} butaca${selectedIds.size > 1 ? "s" : ""}`}
        </button>
      )}

      {booking.isSuccess && (
        <p className="mt-4 text-sm text-available">¡Reserva confirmada!</p>
      )}
      {booking.isError && (
        <p className="mt-4 text-sm text-occupied">{(booking.error as Error).message}</p>
      )}
    </div>
  );
}
