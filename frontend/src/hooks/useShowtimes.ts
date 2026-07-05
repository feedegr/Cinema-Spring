import { useQuery } from "@tanstack/react-query";
import { getShowtimes } from "../api/client";

export function useShowtimes() {
  return useQuery({ queryKey: ["showtimes"], queryFn: getShowtimes });
}
