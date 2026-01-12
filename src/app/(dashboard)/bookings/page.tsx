import { createClient } from "@/lib/supabase/server";
import { Booking } from "@/types";
import BookingCard from "./BookingCard";
import { Calendar, Clock, History, Sparkles } from "lucide-react";

export default async function BookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      room:rooms(*)
    `)
    .eq("user_id", user!.id)
    .order("date", { ascending: false });

  if (error) {
    console.error("Erreur lors de la récupération des réservations:", error);
  }

  // Séparer les réservations à venir et passées
  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings?.filter(
    (b) => b.date >= today && b.status === "upcoming"
  ) || [];
  const pastBookings = bookings?.filter(
    (b) => b.date < today || b.status !== "upcoming"
  ) || [];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Gestion des réservations</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
            <p className="text-lg text-gray-600">
              Consultez et gérez toutes vos réservations en un coup d'œil
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">{upcomingBookings.length}</div>
              <div className="text-sm text-green-100">À venir</div>
            </div>
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <div className="text-3xl font-bold">{pastBookings.length}</div>
              <div className="text-sm text-gray-100">Passées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Réservations à venir */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Réservations à venir
            </h2>
            <p className="text-gray-600">
              {upcomingBookings.length} {upcomingBookings.length > 1 ? 'réservations actives' : 'réservation active'}
            </p>
          </div>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-green-200">
            <Calendar className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune réservation à venir
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Commencez par réserver une salle pour votre prochaine réunion
            </p>
            <a
              href="/rooms"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Clock className="w-5 h-5" />
              Parcourir les salles
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking as Booking & { room: Booking["room"] }}
                canCancel
              />
            ))}
          </div>
        )}
      </section>

      {/* Historique */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <History className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Historique
            </h2>
            <p className="text-gray-600">
              {pastBookings.length} {pastBookings.length > 1 ? 'réservations terminées' : 'réservation terminée'}
            </p>
          </div>
        </div>

        {pastBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Aucun historique de réservation</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking as Booking & { room: Booking["room"] }}
                canCancel={false}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
