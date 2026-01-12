import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rooms/:id/availability?date=YYYY-MM-DD
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Le paramètre date est requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Récupérer les réservations pour cette salle et cette date
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .eq("room_id", id)
      .eq("date", date)
      .eq("status", "upcoming");

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des disponibilités" },
        { status: 500 }
      );
    }

    // Générer les créneaux horaires (8h-20h)
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Vérifier si le créneau est disponible
      const isBooked = bookings?.some((booking) => {
        return startTime < booking.end_time && endTime > booking.start_time;
      });

      slots.push({
        start: startTime,
        end: endTime,
        available: !isBooked,
      });
    }

    return NextResponse.json({ data: slots });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
