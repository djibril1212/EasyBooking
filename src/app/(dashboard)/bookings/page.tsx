import { createClient } from "@/lib/supabase/server";
import { Booking } from "@/types";
import BookingCard from "./BookingCard";

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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Réservations</h1>
        <p className="mt-2 text-gray-600">
          Gérez vos réservations de salles
        </p>
      </div>

      {/* Réservations à venir */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          À venir ({upcomingBookings.length})
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-md">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500">Aucune réservation à venir</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Historique ({pastBookings.length})
        </h2>

        {pastBookings.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl shadow-md">
            <p className="text-gray-500">Aucun historique</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
