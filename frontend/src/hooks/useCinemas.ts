import { useQuery } from "@tanstack/react-query";
import { getCinemas } from "../api/client";

export function useCinemas() {
  return useQuery({ queryKey: ["cinemas"], queryFn: getCinemas });
}
