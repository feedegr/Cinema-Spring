export interface Movie {
  id: number;
  title: string;
  durationMinutes: number | null;
  genre: string | null;
  synopsis: string | null;
  posterUrl: string | null;
}
