'use client'

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  MessageSquare,
  BarChart3,
  ChevronRight,
  Clock,
  ArrowRight,
  Package,
  Sparkles,
  TrendingUp,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ShopyLink</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Cómo Funciona</a>
            <Link href="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">Iniciar Sesión</Link>
            <Link href="/signup" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95">
              Empieza Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 transition-colors py-2">Funcionalidades</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-gray-600 hover:text-blue-600 transition-colors py-2">Cómo Funciona</a>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full px-5 py-3 text-blue-600 border border-blue-600 rounded-xl text-center font-bold hover:bg-blue-50 transition-all">
                Iniciar Sesión
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-center font-bold hover:shadow-lg transition-all">
                Empieza Gratis
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Prueba gratis </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              Tu tienda en WhatsApp <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">lista en minutos</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              La plataforma más <span className="font-bold text-gray-900">rápida y sencilla</span> para digitalizar tu catálogo y gestionar pedidos directamente desde WhatsApp.
              <span className="block mt-2 text-lg text-gray-500">Sin complicaciones, solo ventas.</span>
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link href="/signup" className="w-full sm:w-auto group px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-300/50 transition-all active:scale-95 flex items-center justify-center gap-2">
                Crear mi tienda ahora
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">3min</h3>
                <p className="text-gray-600 font-medium">Tiempo de setup</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">0%</h3>
                <p className="text-gray-600 font-medium">Comisiones</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">100%</h3>
                <p className="text-gray-600 font-medium">Gratis</p>
              </div>
            </motion.div>

            {/* Mockup Preview */}
            <motion.div
              variants={itemVariants}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="relative mx-auto max-w-6xl"
            >
              <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl p-1 shadow-2xl">
                <div className="bg-white rounded-[1.4rem] shadow-lg aspect-video flex items-center justify-center text-gray-400 font-medium overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col items-center justify-center gap-6 p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-200">
                      <BarChart3 className="text-white w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900 mb-2">Dashboard Intuitivo</p>
                      <p className="text-sm text-gray-500 max-w-md">Gestiona productos, pedidos e inventario desde un panel simple y poderoso</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Bento Box Style */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm uppercase tracking-widest font-bold text-blue-600 mb-4">Todo lo que necesitas</h2>
            <p className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Diseñado para <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">vender más</span></p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Eliminamos las barreras entre tu producto y tu cliente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="w-8 h-8" />,
                color: "from-green-500 to-emerald-500",
                title: "Checkout vía WhatsApp",
                desc: "Recibe pedidos detallados directamente en tu chat. No pierdas ni un solo cliente.",
                size: "md:col-span-1"
              },
              {
                icon: <Clock className="w-8 h-8" />,
                color: "from-blue-500 to-indigo-500",
                title: "Inventario en Tiempo Real",
                desc: "Gestiona tu stock automáticamente. ShopyLink descuenta unidades tras cada pedido.",
                size: "md:col-span-1"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                color: "from-yellow-500 to-orange-500",
                title: "Setup Instantáneo",
                desc: "Crea tu tienda en menos de 3 minutos. Sin configuraciones complicadas.",
                size: "md:col-span-1"
              },
              {
                icon: <Package className="w-8 h-8" />,
                color: "from-purple-500 to-pink-500",
                title: "Catálogo Digital",
                desc: "Sube productos con imágenes, precios y descripciones. Todo organizado y profesional.",
                size: "md:col-span-1"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                color: "from-indigo-500 to-blue-500",
                title: "Análisis de Ventas",
                desc: "Visualiza tus métricas en tiempo real. Toma decisiones basadas en datos.",
                size: "md:col-span-1"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                color: "from-cyan-500 to-blue-500",
                title: "100% Seguro",
                desc: "Tus datos protegidos con encriptación de nivel empresarial.",
                size: "md:col-span-1"
              }
            ].map((feature, idx) => (
              <div key={idx} className={`${feature.size} group relative p-8 rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl hover:border-gray-200 transition-all duration-300 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity blur-2xl" style={{ background: `linear-gradient(to bottom right, ${feature.color})` }}></div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg text-white`}>
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-sm uppercase tracking-widest font-bold text-blue-600 mb-4">Proceso Simple</h2>
            <p className="text-4xl md:text-6xl font-black text-gray-900 mb-6">3 pasos para empezar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Crea tu cuenta",
                desc: "Regístrate gratis en menos de 1 minuto. No necesitas tarjeta de crédito."
              },
              {
                step: "02",
                title: "Sube tus productos",
                desc: "Agrega tu catálogo con fotos, precios y descripciones. Rápido y fácil."
              },
              {
                step: "03",
                title: "Comparte y vende",
                desc: "Envía el link de tu tienda por WhatsApp y empieza a recibir pedidos."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="text-7xl font-black text-blue-100 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-blue-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 text-purple-700 rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Próximamente</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              Planes <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">en camino</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Estamos trabajando en planes flexibles que se adapten a tu crecimiento. Por ahora, disfruta de crear tu tienda.
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-100">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Pricing Personalizado</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Estamos diseñando opciones de precios que se ajusten a negocios de todos los tamaños.
                  Mientras tanto, todos los usuarios actuales tendrán <span className="font-bold text-blue-600">condiciones especiales</span> cuando lancemos nuestros planes.
                </p>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 bg-white px-6 py-3 rounded-full">
                  <Clock className="w-4 h-4" />
                  Anuncio próximamente
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Únete a la revolución <br />del Social Commerce
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Empieza hoy mismo con <span className="font-bold text-white">tu tienda gratis. </span>Sin sorpresas.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-3 px-10 py-6 bg-white text-blue-600 rounded-2xl text-xl font-black hover:shadow-2xl hover:scale-105 transition-all active:scale-95 group">
            Crear mi tienda gratis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xl font-black text-white">ShopyLink</span>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                La plataforma más simple para vender por WhatsApp. Digitaliza tu negocio en minutos.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Cómo Funciona</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Registrarse</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; 2026 ShopyLink. Todos los derechos reservados.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
