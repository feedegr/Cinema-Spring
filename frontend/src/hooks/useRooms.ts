import { useQuery } from "@tanstack/react-query";
import { getRooms } from "../api/client";

export function useRooms() {
  return useQuery({ queryKey: ["rooms"], queryFn: getRooms });
}
