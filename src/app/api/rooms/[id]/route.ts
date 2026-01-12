import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rooms/:id - Détail d'une salle
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: room, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !room) {
      return NextResponse.json(
        { error: "Salle non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: room });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
