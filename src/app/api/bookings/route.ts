import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema } from "@/lib/validations/booking";

// GET /api/bookings - Mes réservations
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        room:rooms(*)
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des réservations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: bookings });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Créer une réservation
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    const result = bookingSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { room_id, date, start_time, end_time } = result.data;

    // Vérifier que la date est dans le futur
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas réserver une date passée" },
        { status: 400 }
      );
    }

    // Vérifier le nombre de réservations actives
    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "upcoming");

    if (count && count >= 3) {
      return NextResponse.json(
        { error: "Vous avez atteint le maximum de 3 réservations actives" },
        { status: 400 }
      );
    }

    // Vérifier les chevauchements
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("room_id", room_id)
      .eq("date", date)
      .eq("status", "upcoming");

    const hasOverlap = existingBookings?.some((booking) => {
      return start_time < booking.end_time && end_time > booking.start_time;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé" },
        { status: 409 }
      );
    }

    // Créer la réservation
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user.id,
        room_id,
        date,
        start_time,
        end_time,
        status: "upcoming",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la création de la réservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: booking }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
