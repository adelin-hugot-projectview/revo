import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Calendar, Users, BarChart3, Clock, CheckCircle, Star, ArrowRight, Shield, Zap, Target, Play, ChevronDown, Sparkles } from 'lucide-react';

const LandingPage = ({ colors }) => {
    const [companyName, setCompanyName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setFeedback('');

        try {
            if (!companyName || !adminEmail) {
                throw new Error('Veuillez remplir tous les champs.');
            }

            const params = new URLSearchParams({
                companyName: companyName,
                email: adminEmail
            });
            window.location.href = `/signup?${params.toString()}`;

        } catch (error) {
            console.error('Error:', error);
            setFeedback(error.message || 'Une erreur est survenue.');
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Planning Visuel",
            description: "Organisez vos chantiers avec un calendrier interactif et drag & drop. Visualisez votre planning en un coup d'œil."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Gestion d'Équipes",
            description: "Assignez vos équipes aux chantiers, suivez leur disponibilité et optimisez leur répartition."
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Suivi en Temps Réel",
            description: "Tableau Kanban personnalisable pour suivre l'avancement de vos projets étape par étape."
        },
        {
            icon: <Target className="w-8 h-8" />,
            title: "Gestion Clients",
            description: "Centralisez toutes les informations de vos clients et l'historique de leurs projets."
        }
    ];

    const testimonials = [
        {
            name: "Pierre Dubois",
            company: "Dubois Construction",
            avatar: "PD",
            text: "REVO a transformé notre façon de gérer les chantiers. Nous avons gagné 30% d'efficacité en planification.",
            rating: 5
        },
        {
            name: "Marie Lambert",
            company: "Lambert Rénovation",
            avatar: "ML",
            text: "L'interface est intuitive et nos équipes ont adopté l'outil en quelques jours. Un vrai gain de temps !",
            rating: 5
        },
        {
            name: "Thomas Martin",
            company: "Martin BTP",
            avatar: "TM",
            text: "Le système de notification nous permet de ne plus rater aucun délai. Nos clients sont plus satisfaits.",
            rating: 5
        }
    ];

    const stats = [
        { number: "500+", label: "Chantiers gérés" },
        { number: "50+", label: "Entreprises" },
        { number: "98%", label: "Satisfaction client" },
        { number: "30%", label: "Gain d'efficacité" }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden" style={{ backgroundColor: '#F8F9FA' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #E1F2EC 0%, #F8F9FA 50%, rgba(43, 95, 76, 0.05) 100%)' }} />
                <motion.div 
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(43, 95, 76, 0.08), transparent 80%)`
                    }}
                />
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ backgroundColor: 'rgba(43, 95, 76, 0.1)' }} />
                    <div className="absolute top-3/4 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" style={{ backgroundColor: 'rgba(255, 187, 51, 0.1)' }} />
                </div>
            </div>

            {/* Header Navigation */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <motion.div 
                            className="flex items-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <img src="/logo.svg" alt="REVO" className="h-8 w-auto" />
                            <span className="ml-3 text-2xl font-bold" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                REVO
                            </span>
                        </motion.div>
                        
                        <div className="hidden md:flex space-x-8">
                            {['Fonctionnalités', 'Témoignages', 'Tarifs'].map((item, index) => (
                                <motion.a 
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-gray-600 hover:text-gray-900 transition-colors relative group font-medium"
                                    whileHover={{ y: -2 }}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#2B5F4C' }} />
                                </motion.a>
                            ))}
                        </div>
                        
                        <motion.a 
                            href="/login"
                            className="px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-md transition-all duration-300 font-medium bg-white"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Se connecter
                        </motion.a>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="mb-8"
                        >
                            <motion.span 
                                className="inline-block px-4 py-2 rounded-full border text-sm font-medium mb-6"
                                style={{ 
                                    backgroundColor: 'rgba(43, 95, 76, 0.1)', 
                                    borderColor: 'rgba(43, 95, 76, 0.3)', 
                                    color: '#2B5F4C' 
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Sparkles className="inline w-4 h-4 mr-2" />
                                La nouvelle génération de gestion BTP
                            </motion.span>
                        </motion.div>

                        <motion.h1 
                            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            style={{ color: '#222222' }}
                        >
                            <span className="block">Gérez vos</span>
                            <span className="block" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                chantiers
                            </span>
                            <span className="block text-gray-600 text-4xl md:text-5xl lg:text-6xl font-light">
                                comme un pro
                            </span>
                        </motion.h1>

                        <motion.p 
                            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            La plateforme intelligente qui transforme votre gestion de chantiers. 
                            <span className="font-medium" style={{ color: '#2B5F4C' }}> Simple, puissante, moderne.</span>
                        </motion.p>

                        {/* CTA Form */}
                        <motion.div
                            className="max-w-xl mx-auto mb-12"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-xl">
                                <form onSubmit={handleCreateAccount} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <motion.input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Nom de votre entreprise"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ focusRingColor: '#2B5F4C' }}
                                            required
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <motion.input
                                            type="email"
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                            placeholder="votre.email@entreprise.com"
                                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{ focusRingColor: '#2B5F4C' }}
                                            required
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </div>
                                    
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 px-8 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center group text-lg shadow-lg"
                                        style={{ 
                                            background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`,
                                            '&:hover': { transform: 'translateY(-2px)' }
                                        }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                Démarrer gratuitement
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                                
                                {feedback && (
                                    <motion.p 
                                        className={`mt-4 text-sm text-center ${feedback.includes('Erreur') ? 'text-red-500' : 'text-green-600'}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {feedback}
                                    </motion.p>
                                )}
                                
                                <p className="text-sm text-gray-500 mt-4 text-center">
                                    ✨ 14 jours d'essai gratuit • 🚀 Configuration en 2 minutes • ❌ Aucun engagement
                                </p>
                            </div>
                        </motion.div>

                        {/* Trust Badges */}
                        <motion.div 
                            className="flex items-center justify-center space-x-8 text-gray-500"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                        >
                            <div className="flex items-center space-x-2">
                                <Shield className="w-5 h-5" style={{ color: '#2B5F4C' }} />
                                <span className="text-sm">Sécurisé</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Zap className="w-5 h-5" style={{ color: '#2B5F4C' }} />
                                <span className="text-sm">Rapide</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5" style={{ color: '#2B5F4C' }} />
                                <span className="text-sm">Fiable</span>
                            </div>
                        </motion.div>

                        {/* Scroll Indicator */}
                        <motion.div 
                            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative z-10 py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {stats.map((stat, index) => (
                            <motion.div 
                                key={index} 
                                className="text-center group"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="relative">
                                    <div className="text-4xl lg:text-6xl font-black mb-3" style={{ 
                                        background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                        WebkitBackgroundClip: 'text', 
                                        WebkitTextFillColor: 'transparent' 
                                    }}>
                                        {stat.number}
                                    </div>
                                    <div className="text-gray-600 font-medium text-sm lg:text-base">
                                        {stat.label}
                                    </div>
                                    <div className="absolute inset-0 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" style={{ backgroundColor: 'rgba(43, 95, 76, 0.05)', filter: 'blur(20px)' }} />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="fonctionnalités" className="relative z-10 py-32" style={{ backgroundColor: '#F8F9FA' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span 
                            className="inline-block px-4 py-2 rounded-full border text-sm font-medium mb-6"
                            style={{ 
                                backgroundColor: 'rgba(43, 95, 76, 0.1)', 
                                borderColor: 'rgba(43, 95, 76, 0.3)', 
                                color: '#2B5F4C' 
                            }}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Fonctionnalités
                        </motion.span>
                        
                        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight" style={{ color: '#222222' }}>
                            Tout ce dont vous
                            <span className="block" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                avez besoin
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                            Une suite complète d'outils modernes pour révolutionner votre gestion de chantiers
                        </p>
                    </motion.div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <motion.div 
                                key={index} 
                                className="group relative"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="relative bg-white backdrop-blur-xl border border-gray-200 rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 shadow-sm">
                                    <motion.div 
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300"
                                        style={{ background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)` }}
                                        whileHover={{ rotate: 5 }}
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    
                                    <h3 className="text-xl font-bold mb-4 transition-colors" style={{ color: '#222222' }}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed font-light">
                                        {feature.description}
                                    </p>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(43, 95, 76, 0.03) 0%, rgba(34, 197, 94, 0.03) 100%)' }} />
                                    
                                    {/* Corner Accent */}
                                    <div className="absolute top-0 right-0 w-20 h-20 rounded-tr-2xl rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(43, 95, 76, 0.1) 0%, transparent 100%)' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section className="relative z-10 py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight" style={{ color: '#222222' }}>
                            Interface
                            <span className="block" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #FFBB33 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                révolutionnaire
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                            Conçue pour la simplicité, pensée pour la performance
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        className="relative max-w-5xl mx-auto"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="bg-gray-50 border border-gray-200 rounded-3xl p-8 shadow-2xl">
                            <div className="bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-6 shadow-2xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                    <div className="ml-4 bg-gray-600 rounded-lg px-4 py-1 text-gray-200 text-sm font-mono">
                                        revo.app/dashboard
                                    </div>
                                </div>
                                
                                <div className="bg-white rounded-xl p-6 shadow-inner">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-800">Dashboard</h3>
                                        <motion.button
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium flex items-center space-x-2 hover:bg-green-600 transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Play className="w-4 h-4" />
                                            <span>Voir démo</span>
                                        </motion.button>
                                    </div>
                                    
                                    <div className="grid grid-cols-5 gap-4 mb-6">
                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((day, i) => (
                                            <div key={day} className="text-center">
                                                <div className="text-sm text-gray-500 font-medium mb-2">{day}</div>
                                                <div className="h-24 bg-gray-50 rounded-lg relative overflow-hidden">
                                                    {i === 1 && (
                                                        <motion.div 
                                                            className="absolute inset-2 bg-green-100 border-2 border-green-300 rounded-md p-1"
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: i * 0.2 }}
                                                        >
                                                            <div className="text-xs font-semibold text-green-800">Maison Martin</div>
                                                            <div className="text-xs text-green-600">09:00-17:00</div>
                                                        </motion.div>
                                                    )}
                                                    {i === 3 && (
                                                        <motion.div 
                                                            className="absolute inset-2 bg-blue-100 border-2 border-blue-300 rounded-md p-1"
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: i * 0.2 }}
                                                        >
                                                            <div className="text-xs font-semibold text-blue-800">Bureau Durand</div>
                                                            <div className="text-xs text-blue-600">08:00-16:00</div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span>Planning de la semaine</span>
                                        <span className="flex items-center space-x-1">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <span>En cours</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Floating Elements */}
                        <motion.div 
                            className="absolute -top-6 -right-6 w-20 h-20 bg-green-500/20 rounded-full blur-xl"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        />
                        <motion.div 
                            className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"
                            animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
                            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        />
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="témoignages" className="relative z-10 py-32" style={{ backgroundColor: '#F8F9FA' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-20"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.span 
                            className="inline-block px-4 py-2 rounded-full border text-sm font-medium mb-6"
                            style={{ 
                                backgroundColor: 'rgba(43, 95, 76, 0.1)', 
                                borderColor: 'rgba(43, 95, 76, 0.3)', 
                                color: '#2B5F4C' 
                            }}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            Témoignages
                        </motion.span>
                        
                        <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight" style={{ color: '#222222' }}>
                            Ils révolutionnent
                            <span className="block" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                leur BTP
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                            Découvrez comment REVO transforme le quotidien des professionnels
                        </p>
                    </motion.div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div 
                                key={index} 
                                className="group relative"
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 shadow-sm">
                                    <div className="flex items-center mb-6">
                                        <motion.div 
                                            className="w-14 h-14 text-white rounded-full flex items-center justify-center font-bold text-lg"
                                            style={{ background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)` }}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            {testimonial.avatar}
                                        </motion.div>
                                        <div className="ml-4">
                                            <h4 className="font-bold text-lg" style={{ color: '#222222' }}>{testimonial.name}</h4>
                                            <p className="text-gray-600">{testimonial.company}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex mb-6">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.1 * i }}
                                            >
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            </motion.div>
                                        ))}
                                    </div>
                                    
                                    <p className="text-gray-700 text-lg font-light leading-relaxed italic">
                                        "{testimonial.text}"
                                    </p>

                                    {/* Decorative Quote */}
                                    <div className="absolute top-4 right-4 text-6xl font-serif" style={{ color: 'rgba(43, 95, 76, 0.05)' }}>"</div>
                                    
                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(43, 95, 76, 0.02) 0%, rgba(34, 197, 94, 0.02) 100%)' }} />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="relative z-10 py-32 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl lg:text-6xl font-black mb-8 tracking-tight" style={{ color: '#222222' }}>
                            Prêt à révolutionner
                            <span className="block" style={{ 
                                background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)`, 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent' 
                            }}>
                                votre BTP ?
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light">
                            Rejoignez les centaines d'entreprises qui transforment déjà leur gestion de chantiers
                        </p>
                        
                        <motion.button 
                            onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                            className="px-12 py-6 text-white font-bold text-xl rounded-2xl transition-all duration-300 inline-flex items-center group shadow-2xl"
                            style={{ background: `linear-gradient(135deg, #2B5F4C 0%, #22C55E 100%)` }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Commencer maintenant
                            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-gray-200 py-20 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-12">
                        <div className="md:col-span-2">
                            <motion.div 
                                className="flex items-center mb-6"
                                whileHover={{ scale: 1.05 }}
                            >
                                <img src="/logo-blanc.svg" alt="REVO" className="h-10 w-auto" />
                                <span className="ml-3 text-2xl font-bold" style={{ 
                                    background: `linear-gradient(135deg, #22C55E 0%, #2B5F4C 100%)`, 
                                    WebkitBackgroundClip: 'text', 
                                    WebkitTextFillColor: 'transparent' 
                                }}>
                                    REVO
                                </span>
                            </motion.div>
                            <p className="text-gray-400 text-lg font-light max-w-md">
                                La plateforme nouvelle génération qui révolutionne la gestion de chantiers pour les professionnels du BTP.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-white mb-6 text-lg">Produit</h3>
                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#fonctionnalités" className="hover:text-green-400 transition-colors">Fonctionnalités</a></li>
                                <li><a href="#tarifs" className="hover:text-green-400 transition-colors">Tarifs</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Sécurité</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Intégrations</a></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-white mb-6 text-lg">Support</h3>
                            <ul className="space-y-4 text-gray-400">
                                <li><a href="#" className="hover:text-green-400 transition-colors">Centre d'aide</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Formation</a></li>
                                <li><a href="#" className="hover:text-green-400 transition-colors">Communauté</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-800 mt-16 pt-8 text-center">
                        <p className="text-gray-400">
                            &copy; 2024 REVO. Tous droits réservés. 
                            <span className="mx-2">•</span>
                            <a href="#" className="hover:text-green-400 transition-colors">Mentions légales</a>
                            <span className="mx-2">•</span>
                            <a href="#" className="hover:text-green-400 transition-colors">Confidentialité</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
