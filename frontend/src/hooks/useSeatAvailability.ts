import { useQuery } from "@tanstack/react-query";
import { getSeatAvailability } from "../api/client";

export function useSeatAvailability(showtimeId: number) {
  return useQuery({
    queryKey: ["seatAvailability", showtimeId],
    queryFn: () => getSeatAvailability(showtimeId),
  });
}
