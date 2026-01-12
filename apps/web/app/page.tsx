'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">ShopyLink</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</Link>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">Precios</Link>
            <Link href="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">Iniciar Sesión</Link>
            <Link href="/signup" className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md active:scale-95">
              Empieza Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Venta Simplificada</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
              Tu tienda en WhatsApp <br />
              <span className="text-blue-600">lista en minutos</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
              La plataforma más rápida y sencilla para digitalizar tu catálogo y gestionar pedidos directamente desde WhatsApp. Sin complicaciones, solo ventas.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
                Crear mi tienda ahora <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl text-lg font-semibold hover:bg-gray-50 transition-all">
                Ver demo en vivo
              </Link>
            </motion.div>

            {/* Mockup Preview */}
            <motion.div
              variants={itemVariants}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-20 relative mx-auto max-w-5xl"
            >
              <div className="bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-3xl p-4 md:p-8 border border-white shadow-2xl">
                <div className="bg-white rounded-2xl shadow-lg aspect-video flex items-center justify-center text-gray-400 font-medium overflow-hidden border border-gray-100">
                  {/* Placeholder for Dashboard Image */}
                  <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="text-blue-600 w-8 h-8" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">3min</h3>
              <p className="text-gray-500">Tiempo promedio de setup</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">+40%</h3>
              <p className="text-gray-500">Incremento en conversión</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">0%</h3>
              <p className="text-gray-500">Comisiones por venta</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <h2 className="text-sm uppercase tracking-widest font-bold text-blue-600 mb-4">Todo lo que necesitas</h2>
          <p className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Diseñado para vender más</p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Eliminamos las barreras entre tu producto y tu cliente.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <MessageSquare className="text-green-500" />,
              title: "Checkout vía WhatsApp",
              desc: "Recibe pedidos detallados directamente en tu chat. No pierdas ni un solo cliente."
            },
            {
              icon: <Clock className="text-blue-500" />,
              title: "Inventario en Tiempo Real",
              desc: "Gestiona tu stock automáticamente. ShopyLink descuenta unidades tras cada pedido."
            },
            {
              icon: <Zap className="text-yellow-500" />,
              title: "Carga Masiva",
              desc: "Sube todos tus productos en segundos. Catálogos listos sin esfuerzo manual."
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-xl transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA Section */}
      <section className="bg-blue-600 py-32 rounded-[3rem] mx-4 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8">Únete a la revolución <br /> del Social Commerce</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">Empieza hoy mismo tu prueba gratuita de 14 días. No requiere tarjeta de crédito.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-2xl text-xl font-bold hover:bg-blue-50 transition-all shadow-xl active:scale-95">
            Empieza ahora <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <footer className="py-12 text-center text-gray-500 text-sm">
        <p>&copy; 2026 ShopyLink. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
