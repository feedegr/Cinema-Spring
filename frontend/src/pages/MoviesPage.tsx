import { useMovies } from "../hooks/useMovies";

export function MoviesPage() {
  const { data: movies, isLoading, isError } = useMovies();

  if (isLoading) return <p>Cargando peliculas...</p>;
  if (isError) return <p>Error al cargar peliculas.</p>;

  return (
    <div>
      <h1>Peliculas</h1>
      <ul>
        {movies?.map((movie) => (
          <li key={movie.id}>
            {movie.title} {movie.durationMinutes ? `(${movie.durationMinutes} min)` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
