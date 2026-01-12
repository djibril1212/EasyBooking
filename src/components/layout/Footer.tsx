import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="font-bold text-2xl">EasyBooking</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Votre plateforme de réservation de salles simple et efficace.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="/rooms" className="text-gray-400 hover:text-white transition-colors">
                  Voir les salles
                </a>
              </li>
              <li>
                <a href="/bookings" className="text-gray-400 hover:text-white transition-colors">
                  Mes réservations
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Connexion
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>contact@easybooking.fr</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Github className="w-4 h-4" />
                <a href="https://github.com" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} EasyBooking. TP Tests Logiciels.
            </p>
            <p className="text-gray-400 text-sm flex items-center gap-1">
              Fait avec <Heart className="w-4 h-4 text-red-500 fill-red-500" /> par l'équipe EasyBooking
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
