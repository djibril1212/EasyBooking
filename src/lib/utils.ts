import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formater une date en français
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Formater l'heure
export function formatTime(time: string): string {
  return time.slice(0, 5); // "14:00:00" -> "14:00"
}

// Générer les créneaux horaires (8h-20h par tranches d'1h)
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// Vérifier si une date est dans le futur
export function isFutureDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) >= today;
}

// Obtenir la date d'aujourd'hui au format YYYY-MM-DD
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}
