import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBooking } from "../api/client";

export function useCreateBooking(showtimeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSettled: () => {
      // Se invalida siempre (exito o error): si otro usuario reservo una butaca justo
      // antes, el mapa que tenia en pantalla quedo desactualizado de cualquier forma.
      queryClient.invalidateQueries({ queryKey: ["seatAvailability", showtimeId] });
    },
  });
}
