import type { Movie } from "./Movie";
import type { Room } from "./Room";

export type Language = "DOBLADA" | "SUBTITULADA";

export interface Showtime {
  id: number;
  startTime: string;
  language: Language | null;
  movie: Movie;
  room: Room;
}
