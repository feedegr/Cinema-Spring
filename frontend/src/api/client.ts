import type { Movie } from "../types/Movie";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/api/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}
