import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rooms - Liste des salles
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: rooms, error } = await supabase
      .from("rooms")
      .select("*")
      .order("name");

    if (error) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des salles" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: rooms });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
