// frontend/src/components/Home.tsx - PREMIUM VERSION
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  Users, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Zap,
  Church,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-white/20 backdrop-blur-lg p-3 rounded-xl border border-white/30">
                  <Church className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ChurchAI</h1>
                <p className="text-blue-200 text-sm">Powered by AI</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-white/80 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link to="/pricing" className="text-white/80 hover:text-white transition-colors">
                Precios
              </Link>
              <Link to="/login" className="text-white/80 hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="container mx-auto text-center max-w-6xl">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-full px-6 py-2 mb-8">
            <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
            <span className="text-white/90 text-sm font-medium">La Primera IA Teológica del Mundo</span>
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs px-2 py-1 rounded-full ml-3 font-bold">NUEVO</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Gestión Eclesiástica
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              del Futuro
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            La primera plataforma que combina <strong>Inteligencia Artificial</strong> especializada 
            con gestión integral de iglesias. Automatiza el 80% de tareas administrativas 
            y libera tiempo para lo que realmente importa: <strong>el ministerio pastoral</strong>.
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16">
            <Link 
              to="/register"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 flex items-center"
            >
              Comenzar Gratis
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-lg flex items-center">
              <span className="mr-3 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              Ver Demo en Vivo
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <StatCard number="40%" description="Menos pérdida de visitantes" icon={<TrendingUp />} />
            <StatCard number="80%" description="Tareas automatizadas" icon={<Zap />} />
            <StatCard number="60%" description="Tiempo pastoral liberado" icon={<Users />} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-white/5 backdrop-blur-lg">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Funcionalidades que <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Transforman</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Cada función está diseñada con IA para revolucionar la forma en que las iglesias operan
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <PremiumFeatureCard 
              icon={<Brain className="h-12 w-12" />}
              title="Pastor IA"
              description="Asistente teológico que responde consultas pastorales complejas y genera contenido personalizado para sermones y estudios bíblicos"
              badge="IA Avanzada"
              gradient="from-purple-600 to-pink-600"
            />
            
            <PremiumFeatureCard 
              icon={<Users className="h-12 w-12" />}
              title="CRM Inteligente"
              description="Gestión automática de miembros con scoring IA, detección de abandono y asignación inteligente a células y ministerios"
              badge="Predictivo"
              gradient="from-blue-600 to-cyan-600"
            />
            
            <PremiumFeatureCard 
              icon={<Calendar className="h-12 w-12" />}
              title="Eventos Smart"
              description="Planificación automática con IA que sugiere fechas óptimas, predice asistencia y optimiza recursos"
              badge="Automatizado"
              gradient="from-green-600 to-emerald-600"
            />
            
            <PremiumFeatureCard 
              icon={<MessageSquare className="h-12 w-12" />}
              title="Comunicación IA"
              description="WhatsApp y email automático con mensajes personalizados por perfil de miembro y seguimiento inteligente"
              badge="24/7"
              gradient="from-yellow-600 to-orange-600"
            />
            
            <PremiumFeatureCard 
              icon={<BarChart3 className="h-12 w-12" />}
              title="Analytics Pastoral"
              description="Métricas en tiempo real con insights de crecimiento, predicciones de tendencias y recomendaciones actionables"
              badge="Real-time"
              gradient="from-red-600 to-pink-600"
            />
            
            <PremiumFeatureCard 
              icon={<Shield className="h-12 w-12" />}
              title="Seguridad Total"
              description="Protección de datos nivel bancario, backup automático y cumplimiento con regulaciones internacionales"
              badge="Enterprise"
              gradient="from-gray-600 to-slate-600"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Lo que dicen los <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Pastores</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="ChurchAI revolucionó nuestra iglesia. En 3 meses aumentamos la retención de visitantes en 65% y liberé 15 horas semanales para ministerio pastoral."
              author="Pastor Carlos Mendoza"
              church="Iglesia Vida Abundante - Buenos Aires"
              rating={5}
            />
            
            <TestimonialCard 
              quote="La IA es increíble. Me ayuda con sermones, detecta miembros en riesgo y automatiza todo el seguimiento. Es como tener un equipo pastoral completo."
              author="Pastora María González"
              church="Casa de Oración - Córdoba"
              rating={5}
            />
            
            <TestimonialCard 
              quote="Nunca pensé que la tecnología podría ser tan útil en el ministerio. ChurchAI entiende nuestras necesidades y se adapta perfectamente."
              author="Pastor Juan Rodríguez"
              church="Iglesia del Reino - Rosario"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-3xl p-12 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para el <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Futuro</span>?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a las iglesias que ya están usando IA para crecer más rápido, servir mejor y transformar vidas.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Comenzar Ahora - Es Gratis
              </Link>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Agendar Demo Personalizada
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Component: StatCard
interface StatCardProps {
  number: string
  description: string
  icon: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ number, description, icon }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 group">
      <div className="text-blue-400 mb-4 flex justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-blue-100">{description}</div>
    </div>
  )
}

// Component: PremiumFeatureCard
interface PremiumFeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  badge: string
  gradient: string
}

const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({ 
  icon, title, description, badge, gradient 
}) => {
  return (
    <div className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
      {/* Gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className={`text-white bg-gradient-to-r ${gradient} p-4 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <span className={`bg-gradient-to-r ${gradient} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {badge}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
          {title}
        </h3>
        <p className="text-blue-100 leading-relaxed">{description}</p>
        
        <div className="mt-6 flex items-center text-blue-400 group-hover:text-blue-300 transition-colors">
          <span className="text-sm font-medium">Explorar función</span>
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
    </div>
  )
}

// Component: TestimonialCard
interface TestimonialCardProps {
  quote: string
  author: string
  church: string
  rating: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, church, rating }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
      <div className="flex mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <blockquote className="text-blue-100 mb-6 italic leading-relaxed">
        "{quote}"
      </blockquote>
      <div>
        <div className="text-white font-semibold">{author}</div>
        <div className="text-blue-300 text-sm">{church}</div>
      </div>
    </div>
  )
}

export default Home