"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Lock, ShieldCheck, ChevronsRight, ChevronsLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  
  const { signIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2800); // La introducción épica dura casi 3 segundos
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError("Credenciales incorrectas o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-zinc-50"
      style={{ perspective: "1000px" }}
    >
      {/* Partículas de fondo (solo decorativo durante la intro, adaptado para fondo blanco) */}
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showIntro ? (
          // ==============================
          // FASE 1: ANIMACIÓN 3D DE INTRO CON FLECHAS GOLPEANDO
          // ==============================
          <motion.div
            key="intro"
            className="absolute z-20 flex flex-col items-center justify-center"
            exit={{ scale: 0.8, opacity: 0, y: -100, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          >
            <div className="relative flex items-center justify-center">
              
              {/* Flecha Izquierda Golpeando */}
              <motion.div
                className="absolute right-1/2 mr-12 text-indigo-500"
                initial={{ x: -400, opacity: 0, scale: 2 }}
                animate={{ x: -10, opacity: [0, 1, 0], scale: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
              >
                <ChevronsRight className="w-24 h-24" />
              </motion.div>

              {/* Flecha Derecha Golpeando */}
              <motion.div
                className="absolute left-1/2 ml-12 text-indigo-500"
                initial={{ x: 400, opacity: 0, scale: 2 }}
                animate={{ x: 10, opacity: [0, 1, 0], scale: 1 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
              >
                <ChevronsLeft className="w-24 h-24" />
              </motion.div>

              {/* Logo (Aparece justo cuando las flechas impactan) */}
              <motion.div
                initial={{ scale: 0, rotateY: -180, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1.8, rotateY: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ 
                  delay: 0.35, // Espera el impacto
                  duration: 1.2, 
                  type: "spring", 
                  bounce: 0.6 
                }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotateZ: [0, 2, -2, 0]
                  }}
                  transition={{ delay: 0.5, repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <img 
                    src="/logo.png" 
                    alt="SysKardex" 
                    className="h-32 w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Texto de carga con flechas golpeando continuamente */}
            <motion.div 
              className="mt-12 flex items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div animate={{ x: [-15, 0, -15] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeIn" }}>
                <ChevronsRight className="h-6 w-6 text-indigo-600" />
              </motion.div>
              
              <span className="text-zinc-800 font-mono text-sm tracking-widest uppercase font-black">Iniciando Sistema</span>
              
              <motion.div animate={{ x: [15, 0, 15] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeIn" }}>
                <ChevronsLeft className="h-6 w-6 text-indigo-600" />
              </motion.div>
            </motion.div>
          </motion.div>

        ) : (

          // ==============================
          // FASE 2: FORMULARIO DE LOGIN
          // ==============================
          <motion.div 
            key="form"
            className="relative z-20 w-full max-w-sm"
            initial={{ opacity: 0, rotateX: 45, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8">
              
              <div className="flex flex-col items-center text-center mb-8">
                <motion.img 
                  src="/logo.png" 
                  alt="SysKardex" 
                  className="h-28 w-auto object-contain drop-shadow-md"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.form 
                onSubmit={handleSubmit} 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1, 
                    transition: { staggerChildren: 0.15, delayChildren: 0.5 } 
                  }
                }}
              >
                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="admin@syskardex.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">Contraseña</label>
                  <input
                    type="password"
                    required
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-lg px-4 py-3 text-sm font-bold shadow-lg hover:bg-zinc-800 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-70 disabled:hover:scale-100 active:scale-95"
                  >
                    {loading ? (
                      <span className="animate-pulse flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Desencriptando...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" /> Entrar al Sistema
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
