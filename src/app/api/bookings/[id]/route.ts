import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE /api/bookings/:id - Annuler une réservation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Vérifier que la réservation appartient à l'utilisateur
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    if (booking.status !== "upcoming") {
      return NextResponse.json(
        { error: "Cette réservation ne peut pas être annulée" },
        { status: 400 }
      );
    }

    // Vérifier que c'est au moins 2h avant le créneau
    const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
    const now = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;

    if (bookingDateTime.getTime() - now.getTime() < twoHoursInMs) {
      return NextResponse.json(
        { error: "Annulation possible jusqu'à 2h avant le créneau" },
        { status: 400 }
      );
    }

    // Annuler la réservation
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: "Erreur lors de l'annulation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Réservation annulée" });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
