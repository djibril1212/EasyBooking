"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Room } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { generateTimeSlots, getTodayString } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    date: getTodayString(),
    start_time: "09:00",
    end_time: "10:00",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const timeSlots = generateTimeSlots();
  const timeOptions = timeSlots.map((slot) => ({
    value: slot,
    label: slot,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation côté client
    if (formData.start_time >= formData.end_time) {
      setError("L'heure de fin doit être après l'heure de début");
      setIsLoading(false);
      return;
    }

    const today = getTodayString();
    if (formData.date < today) {
      setError("Vous ne pouvez pas réserver une date passée");
      setIsLoading(false);
      return;
    }

    // Récupérer l'utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté pour réserver");
      setIsLoading(false);
      return;
    }

    // Vérifier les chevauchements
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("room_id", room.id)
      .eq("date", formData.date)
      .eq("status", "upcoming");

    const hasOverlap = existingBookings?.some((booking) => {
      const existingStart = booking.start_time;
      const existingEnd = booking.end_time;
      const newStart = formData.start_time;
      const newEnd = formData.end_time;

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      setError("Ce créneau est déjà réservé");
      setIsLoading(false);
      return;
    }

    // Vérifier le nombre de réservations de l'utilisateur
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "upcoming");

    if (count && count >= 3) {
      setError("Vous avez atteint le maximum de 3 réservations actives");
      setIsLoading(false);
      return;
    }

    // Créer la réservation
    const { error: insertError } = await supabase.from("bookings").insert({
      user_id: user.id,
      room_id: room.id,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      status: "upcoming",
    });

    if (insertError) {
      setError("Une erreur est survenue lors de la réservation");
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    setTimeout(() => {
      onClose();
      setSuccess(false);
      router.push("/bookings");
      router.refresh();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Réserver {room.name}
        </h2>
        <p className="text-gray-600 mb-6">Capacité : {room.capacity} personnes</p>

        {success ? (
          <Alert variant="success">
            Réservation confirmée ! Redirection en cours...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              id="date"
              name="date"
              type="date"
              label="Date"
              value={formData.date}
              onChange={handleChange}
              min={getTodayString()}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                id="start_time"
                name="start_time"
                label="Heure de début"
                value={formData.start_time}
                onChange={handleChange}
                options={timeOptions}
              />

              <Select
                id="end_time"
                name="end_time"
                label="Heure de fin"
                value={formData.end_time}
                onChange={handleChange}
                options={timeOptions}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1">
                Confirmer
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
