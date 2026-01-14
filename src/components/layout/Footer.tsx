import { Github, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-secondary-700 via-secondary-800 to-secondary-900 text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                <img src="/logo.svg" alt="EasyBooking Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-2xl">EasyBooking</span>
            </div>
            <p className="text-gray-100 leading-relaxed">
              Votre plateforme de réservation de salles simple et efficace.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="/rooms" className="text-gray-100 hover:text-white transition-colors">
                  Voir les salles
                </a>
              </li>
              <li>
                <a href="/bookings" className="text-gray-100 hover:text-white transition-colors">
                  Mes réservations
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-100 hover:text-white transition-colors">
                  Connexion
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-100">
                <Mail className="w-4 h-4" />
                <span>contact@easybooking.fr</span>
              </li>
              <li className="flex items-center gap-2 text-gray-100">
                <Github className="w-4 h-4" />
                <a href="https://github.com" className="hover:text-white transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-500 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-100 text-sm">
              &copy; {new Date().getFullYear()} EasyBooking. TP Tests Logiciels.
            </p>
            <p className="text-gray-100 text-sm flex items-center gap-1">
              Fait avec <Heart className="w-4 h-4 text-white fill-white" /> par l'équipe EasyBooking
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
