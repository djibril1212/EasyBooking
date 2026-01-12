"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface BookingCardProps {
  booking: Booking & { room: Booking["room"] };
  canCancel: boolean;
}

export default function BookingCard({ booking, canCancel }: BookingCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const statusVariant = {
    upcoming: "success" as const,
    completed: "default" as const,
    cancelled: "danger" as const,
  };

  const statusLabel = {
    upcoming: "À venir",
    completed: "Terminée",
    cancelled: "Annulée",
  };

  const handleCancel = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (error) {
      console.error("Erreur lors de l'annulation:", error);
      setIsLoading(false);
      return;
    }

    router.refresh();
    setIsLoading(false);
    setShowConfirm(false);
  };

  return (
    <Card className={booking.status === "cancelled" ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {booking.room?.name || "Salle inconnue"}
          </h3>
          <Badge variant={statusVariant[booking.status]}>
            {statusLabel[booking.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="capitalize">{formatDate(booking.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </span>
          </div>
        </div>
      </CardContent>

      {canCancel && booking.status === "upcoming" && (
        <CardFooter>
          {showConfirm ? (
            <div className="w-full space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Confirmer l'annulation ?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  Non
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  isLoading={isLoading}
                  onClick={handleCancel}
                >
                  Oui, annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => setShowConfirm(true)}
            >
              Annuler la réservation
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
