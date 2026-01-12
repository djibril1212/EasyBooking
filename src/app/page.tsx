import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import { Calendar, Clock, CheckCircle2, Users, Sparkles, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header user={user ? { email: user.email! } : null} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8 animate-fade-in">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">Plateforme de réservation moderne</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Réservez vos salles
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
                  en toute simplicité
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto animate-fade-in leading-relaxed">
                Consultez la disponibilité en temps réel, réservez instantanément
                et gérez toutes vos réservations en un seul endroit.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in">
                {user ? (
                  <Link href="/rooms">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                      Voir les salles disponibles
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300">
                        Commencer gratuitement
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-white border-2 border-white hover:bg-white/10 backdrop-blur-sm"
                      >
                        Se connecter
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {[
                  { label: "Salles disponibles", value: "10+" },
                  { label: "Réservations actives", value: "50+" },
                  { label: "Utilisateurs satisfaits", value: "100+" },
                  { label: "Disponibilité", value: "24/7" }
                ].map((stat, i) => (
                  <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Une solution complète
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tout ce dont vous avez besoin pour gérer vos réservations de salles
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Calendar,
                  title: "Voir les salles",
                  description: "Consultez toutes les salles disponibles avec leurs équipements, capacités et photos en temps réel.",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: Clock,
                  title: "Réserver facilement",
                  description: "Choisissez votre créneau horaire et réservez instantanément avec confirmation immédiate.",
                  color: "from-indigo-500 to-indigo-600"
                },
                {
                  icon: CheckCircle2,
                  title: "Gérer vos réservations",
                  description: "Consultez, modifiez ou annulez vos réservations à tout moment depuis votre tableau de bord.",
                  color: "from-purple-500 to-purple-600"
                }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={i} 
                    className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2"
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-gray-600">
                Réservez une salle en 3 étapes simples
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>
              
              {[
                {
                  step: "01",
                  title: "Créez votre compte",
                  description: "Inscription rapide et gratuite en moins d'une minute"
                },
                {
                  step: "02",
                  title: "Choisissez votre salle",
                  description: "Parcourez les salles et sélectionnez celle qui vous convient"
                },
                {
                  step: "03",
                  title: "Confirmez la réservation",
                  description: "Validez votre créneau et recevez une confirmation instantanée"
                }
              ].map((step, i) => (
                <div key={i} className="relative text-center">
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse opacity-20"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                      <span className="text-4xl font-bold text-white">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <Users className="w-16 h-16 mx-auto mb-6 text-blue-200" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prêt à commencer ?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Rejoignez des centaines d'utilisateurs qui font confiance à EasyBooking
                pour gérer leurs réservations de salles.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:scale-105 transition-transform">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
