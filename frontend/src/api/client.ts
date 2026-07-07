import type { Booking } from "../types/Booking";
import type { Cinema } from "../types/Cinema";
import type { Movie } from "../types/Movie";
import type { Room } from "../types/Room";
import type { SeatAvailability } from "../types/SeatAvailability";
import type { Showtime } from "../types/Showtime";
import type { User } from "../types/User";

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

export async function getShowtime(id: number): Promise<Showtime> {
  const res = await fetch(`${API_URL}/api/showtimes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch showtime");
  return res.json();
}

export async function getSeatAvailability(showtimeId: number): Promise<SeatAvailability[]> {
  const res = await fetch(`${API_URL}/api/showtimes/${showtimeId}/seats`);
  if (!res.ok) throw new Error("Failed to fetch seat availability");
  return res.json();
}

export async function getBookingsByUser(userId: number): Promise<Booking[]> {
  const res = await fetch(`${API_URL}/api/bookings?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "No se pudo iniciar sesión");
  }
  return res.json();
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "No se pudo crear la cuenta");
  }
  return res.json();
}

export async function createBooking(payload: {
  userId: number;
  showtimeId: number;
  seatIds: number[];
}): Promise<Booking> {
  const res = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: { id: payload.userId },
      showtime: { id: payload.showtimeId },
      seats: payload.seatIds.map((id) => ({ id })),
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "No se pudo crear la reserva");
  }
  return res.json();
}
