import type { Cinema } from "./Cinema";

export interface Room {
  id: number;
  name: string;
  capacity: number | null;
  cinema: Cinema | null;
}
