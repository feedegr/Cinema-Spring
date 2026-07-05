import { Link } from "react-router-dom";
import { useCinemas } from "../hooks/useCinemas";
import { useRooms } from "../hooks/useRooms";

export function CinemasPage() {
  const { data: cinemas, isLoading: loadingCinemas, isError: errorCinemas } = useCinemas();
  const { data: rooms, isLoading: loadingRooms, isError: errorRooms } = useRooms();

  if (loadingCinemas || loadingRooms) return <p className="text-muted">Cargando cines...</p>;
  if (errorCinemas || errorRooms)
    return (
      <p className="text-velvet-light">
        No pudimos cargar los cines. Probá de nuevo en un momento.
      </p>
    );

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide text-screen">Cines</h1>
      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cinemas?.map((cinema) => {
          const cinemaRooms = rooms?.filter((room) => room.cinema?.id === cinema.id) ?? [];

          return (
            <li key={cinema.id}>
              <Link
                to={`/showtimes?cinemaId=${cinema.id}`}
                className="block rounded-lg bg-curtain-light p-5 transition-colors hover:bg-curtain-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marquee"
              >
                <h2 className="font-display text-2xl tracking-wide text-screen">
                  {cinema.name}
                </h2>
                {cinema.address && (
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted">
                    {cinema.address}
                  </p>
                )}
                {cinemaRooms.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {cinemaRooms.map((room) => (
                      <li
                        key={room.id}
                        className="rounded-full bg-velvet px-3 py-1 text-xs uppercase tracking-widest text-screen"
                      >
                        {room.name}
                        {room.capacity ? ` · ${room.capacity} butacas` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
