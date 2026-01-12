import { z } from "zod";

export const bookingSchema = z.object({
  room_id: z.string().uuid("ID de salle invalide"),
  date: z.string().min(1, "La date est requise"),
  start_time: z.string().min(1, "L'heure de début est requise"),
  end_time: z.string().min(1, "L'heure de fin est requise"),
}).refine((data) => {
  const start = data.start_time;
  const end = data.end_time;
  return start < end;
}, {
  message: "L'heure de fin doit être après l'heure de début",
  path: ["end_time"],
});

export type BookingInput = z.infer<typeof bookingSchema>;
