import type { Seat } from "./Seat";
import type { Showtime } from "./Showtime";
import type { User } from "./User";

export interface Booking {
  id: number;
  bookedAt: string;
  user: User;
  showtime: Showtime;
  seats: Seat[];
}
