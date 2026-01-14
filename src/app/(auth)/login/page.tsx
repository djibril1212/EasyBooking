"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { LogIn, ArrowLeft, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGlobalError("");

    // Validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // Connexion avec Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setGlobalError("Email ou mot de passe incorrect");
      setIsLoading(false);
      return;
    }

    router.push("/rooms");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Back button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </Link>

        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            {/* Logo - Remplacez le contenu de cette div par votre logo */}
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              {/* <img src="/logo.png" alt="EasyBooking Logo" className="w-full h-full object-contain p-1" /> */}
              <span className="text-white font-bold text-3xl">E</span>
            </div>
            <span className="font-bold text-3xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              EasyBooking
            </span>
          </Link>
          
          <div className="inline-flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Connexion sécurisée</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Bon retour !
          </h2>
          <p className="text-gray-600">
            Connectez-vous pour accéder à vos réservations
          </p>
        </div>

        {/* Form */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-8 space-y-6 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          {globalError && <Alert variant="error">{globalError}</Alert>}

          <Input
            id="email"
            name="email"
            type="email"
            label="Adresse email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button 
            type="submit" 
            className="w-full group" 
            size="lg"
            isLoading={isLoading}
          >
            <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
            Se connecter
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Nouveau sur EasyBooking ?</span>
            </div>
          </div>

          <Link href="/register" className="block">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              Créer un compte
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
