import React, { useState } from 'react';
import { Calendar, Users, BarChart3, Clock, CheckCircle, Star, ArrowRight, Shield, Zap, Target } from 'lucide-react';

const LandingPage = ({ colors }) => {
    const [companyName, setCompanyName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        <div className="min-h-screen bg-white">
            {/* Header Navigation */}
            <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <img src="/logo.svg" alt="REVO" className="h-8 w-auto" />
                            <span className="ml-2 text-2xl font-bold text-gray-900">REVO</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Fonctionnalités</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Témoignages</a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Tarifs</a>
                        </div>
                        <a href="/login" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                            Se connecter
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                                Gérez vos chantiers comme un 
                                <span className="text-green-600"> pro</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                REVO simplifie la planification, le suivi et la gestion de tous vos chantiers. 
                                Une solution complète pensée pour les professionnels du BTP.
                            </p>
                            
                            <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                                <h3 className="text-lg font-semibold mb-4">Commencez gratuitement</h3>
                                <form onSubmit={handleCreateAccount} className="space-y-4">
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Nom de votre entreprise"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                    <input
                                        type="email"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        placeholder="votre.email@entreprise.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isLoading ? 'Redirection...' : 'Démarrer mon essai gratuit'}
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </button>
                                </form>
                                {feedback && (
                                    <p className={`mt-3 text-sm ${feedback.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>
                                        {feedback}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-3 text-center">
                                    ✓ Essai gratuit de 14 jours • ✓ Sans engagement
                                </p>
                            </div>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                                    Données sécurisées
                                </div>
                                <div className="flex items-center">
                                    <Zap className="w-5 h-5 text-green-600 mr-2" />
                                    Mise en route rapide
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:pl-8">
                            <div className="bg-white p-4 rounded-xl shadow-2xl">
                                <div className="bg-gray-100 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold">Planning Semaine</h4>
                                        <div className="flex space-x-2">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 mb-4">
                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map(day => (
                                            <div key={day} className="text-center text-xs font-medium text-gray-500">{day}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="h-16 bg-white rounded border border-gray-200 relative">
                                                {i === 1 && (
                                                    <div className="absolute inset-x-1 top-1 bottom-1 bg-green-100 border border-green-300 rounded text-xs p-1">
                                                        <div className="font-medium text-green-800">Maison Martin</div>
                                                    </div>
                                                )}
                                                {i === 3 && (
                                                    <div className="absolute inset-x-1 top-1 bottom-1 bg-blue-100 border border-blue-300 rounded text-xs p-1">
                                                        <div className="font-medium text-blue-800">Bureau Durand</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>8:00</span>
                                        <span>18:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-green-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center text-white">
                                <div className="text-3xl lg:text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-green-100">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Tout ce dont vous avez besoin
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Une suite complète d'outils pour gérer efficacement tous vos projets de construction
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-xl mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Screenshot Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Interface moderne et intuitive
                        </h2>
                        <p className="text-xl text-gray-600">
                            Conçue pour être simple d'utilisation, même pour les équipes non-techniques
                        </p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="bg-white rounded-lg p-6">
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-3">
                                        <div className="mb-4">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                            <div className="h-8 bg-gray-100 rounded mb-4"></div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[...Array(15)].map((_, i) => (
                                                <div key={i} className={`h-12 rounded ${
                                                    i % 7 === 1 ? 'bg-green-200' : 
                                                    i % 7 === 3 ? 'bg-blue-200' : 
                                                    i % 7 === 5 ? 'bg-yellow-200' : 'bg-gray-50'
                                                }`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-2 mb-3">
                                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                                <div className="h-3 bg-gray-200 rounded flex-1"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Ils nous font confiance
                        </h2>
                        <p className="text-xl text-gray-600">
                            Découvrez ce que disent les professionnels qui utilisent REVO au quotidien
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                                        {testimonial.avatar}
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="font-semibold">{testimonial.name}</h4>
                                        <p className="text-sm text-gray-600">{testimonial.company}</p>
                                    </div>
                                </div>
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-green-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                        Prêt à transformer votre gestion de chantiers ?
                    </h2>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Rejoignez les centaines d'entreprises qui font déjà confiance à REVO
                    </p>
                    <button 
                        onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                        className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
                    >
                        Commencer gratuitement
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <img src="/logo-blanc.svg" alt="REVO" className="h-8 w-auto" />
                                <span className="ml-2 text-xl font-bold">REVO</span>
                            </div>
                            <p className="text-gray-400">
                                La solution de gestion de chantiers pensée pour les professionnels du BTP.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Produit</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
                                <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
                                <li><a href="#" className="hover:text-white">Sécurité</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Centre d'aide</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" className="hover:text-white">Formation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Légal</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                                <li><a href="#" className="hover:text-white">CGU</a></li>
                                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 REVO. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
