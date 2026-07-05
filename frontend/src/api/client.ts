import type { Cinema } from "../types/Cinema";
import type { Movie } from "../types/Movie";
import type { Room } from "../types/Room";
import type { Showtime } from "../types/Showtime";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/api/movies`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function getCinemas(): Promise<Cinema[]> {
  const res = await fetch(`${API_URL}/api/cinemas`);
  if (!res.ok) throw new Error("Failed to fetch cinemas");
  return res.json();
}

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_URL}/api/rooms`);
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

export async function getShowtimes(): Promise<Showtime[]> {
  const res = await fetch(`${API_URL}/api/showtimes`);
  if (!res.ok) throw new Error("Failed to fetch showtimes");
  return res.json();
}
