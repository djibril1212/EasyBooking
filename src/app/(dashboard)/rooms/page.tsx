import { createClient } from "@/lib/supabase/server";
import { Room } from "@/types";
import RoomCard from "./RoomCard";
import { Search, Filter, Building2, Sparkles } from "lucide-react";

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-100 px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Réservation en temps réel</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Salles disponibles</h1>
            <p className="text-lg text-gray-600">
              Découvrez nos espaces et choisissez la salle parfaite pour votre réunion
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">{rooms?.length || 0}</div>
              <div className="text-sm text-gray-100">Salles disponibles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une salle..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
            <Filter className="h-5 w-5" />
            Filtres
          </button>
        </div>
      </div>

      {/* Rooms Grid */}
      {!rooms || rooms.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Aucune salle disponible
          </h3>
          <p className="text-gray-600 text-lg">
            Les salles seront bientôt ajoutées à notre plateforme.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(rooms as Room[]).map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
