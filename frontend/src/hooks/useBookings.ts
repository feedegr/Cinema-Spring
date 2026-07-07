import { useQuery } from "@tanstack/react-query";
import { getBookingsByUser } from "../api/client";

export function useBookings(userId: number | undefined) {
  return useQuery({
    queryKey: ["bookings", userId],
    queryFn: () => getBookingsByUser(userId as number),
    enabled: userId != null,
  });
}
