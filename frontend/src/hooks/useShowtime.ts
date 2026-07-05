import { useQuery } from "@tanstack/react-query";
import { getShowtime } from "../api/client";

export function useShowtime(id: number) {
  return useQuery({ queryKey: ["showtime", id], queryFn: () => getShowtime(id) });
}
