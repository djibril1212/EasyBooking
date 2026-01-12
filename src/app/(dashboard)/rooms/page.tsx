import { createClient } from "@/lib/supabase/server";
import { Room } from "@/types";
import RoomCard from "./RoomCard";

export default async function RoomsPage() {
  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .order("name");

  if (error) {
    console.error("Erreur lors de la récupération des salles:", error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Salles disponibles</h1>
        <p className="mt-2 text-gray-600">
          Sélectionnez une salle pour voir ses disponibilités et réserver
        </p>
      </div>

      {!rooms || rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune salle disponible
          </h3>
          <p className="text-gray-500">
            Les salles seront bientôt ajoutées.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(rooms as Room[]).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
