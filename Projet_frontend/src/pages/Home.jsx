import React from "react";
import { Link } from "react-router-dom";
import { 
    CalendarCheck, 
    Users, 
    MapPin, 
    MessageCircleMore, 
    Heart, 
    ClipboardList,
    TrendingUp 
} from "lucide-react";

// Liste étendue des fonctionnalités
const features = [
  {
    icon: <CalendarCheck size={36} className="text-purple-600 dark:text-purple-400 mb-4" />,
    title: "Planification Simplifiée",
    description: "Créez et gérez tous vos événements (date, lieu, participants) en quelques étapes seulement.",
  },
  {
    icon: <MapPin size={36} className="text-red-500 dark:text-red-400 mb-4" />,
    title: "Localisation Intégrée",
    description: "Utilisez la carte interactive pour définir le lieu exact et guider facilement vos invités.",
  },
  {
    icon: <MessageCircleMore size={36} className="text-blue-500 dark:text-blue-400 mb-4" />,
    title: "Messagerie Instantanée",
    description: "Discutez en temps réel avec vos invités directement dans l'événement pour des mises à jour rapides.",
  },
  {
    icon: <Heart size={36} className="text-pink-500 dark:text-pink-400 mb-4" />,
    title: "Social & Interactivité",
    description: "Aimez et commentez les événements publiés par vos amis et la communauté.",
  },
  {
    icon: <Users size={36} className="text-green-600 dark:text-green-400 mb-4" />,
    title: "Gestion des Invités",
    description: "Envoyez des invitations ciblées et suivez les RSVP en direct pour un décompte précis.",
  },
  {
    icon: <ClipboardList size={36} className="text-yellow-600 dark:text-yellow-400 mb-4" />,
    title: "Sondages & Décisions",
    description: "Organisez des sondages pour voter sur les meilleures options (lieu, menu, thème, etc.).",
  },
];

// Composant simulant une carte d'application dans la section Hero
const AppMockupCard = () => (
    <div className="relative w-full max-w-lg mx-auto mt-12 transform perspective-1000 animate-slideUp">
        <div className="bg-white/90 p-6 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
                <div className="font-bold text-xl text-gray-800 flex items-center gap-2">
                    <TrendingUp className="text-red-500" size={20} />
                    Tendances Locales
                </div>
                <Users size={20} className="text-gray-500" />
            </div>
            
            {/* Événement 1 */}
            <div className="p-4 bg-gray-50 rounded-xl mb-4 transition duration-300 hover:bg-gray-100 flex items-start gap-4">
                <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-semibold text-gray-900">Festival de Musique Électro</h4>
                    <p className="text-sm text-gray-600">Samedi 14 Sept. • Centre-ville</p>
                    <div className="flex items-center text-sm mt-2 space-x-3">
                        <span className="flex items-center text-red-500 font-medium">
                            <Heart size={16} fill="currentColor" className="mr-1" /> 1.2K
                        </span>
                        <span className="flex items-center text-gray-500">
                            <MessageCircleMore size={16} className="mr-1" /> 45
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Événement 2 */}
            <div className="p-4 bg-gray-50 rounded-xl transition duration-300 hover:bg-gray-100 flex items-start gap-4">
                <CalendarCheck className="text-purple-600 flex-shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="font-semibold text-gray-900">Anniversaire de Lisa</h4>
                    <p className="text-sm text-gray-600">Vendredi Prochain • Chez moi</p>
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-2">
                        Vous participez
                    </span>
                </div>
            </div>
            
            <div className="mt-6 text-center">
                <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold transition">
                    Voir plus d'événements publics
                </button>
            </div>
        </div>
        {/* Ombre et illusion de profondeur */}
        <div className="absolute inset-0 z-[-1] bg-purple-200 rounded-3xl transform translate-x-3 translate-y-3 opacity-70 blur-md"></div>
    </div>
);


const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
        {/* Définitions des animations */}
        <style>
            {`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(50px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
            .animate-slideUp { animation: slideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
            .delay-100 { animation-delay: 0.1s; }
            .delay-200 { animation-delay: 0.2s; }
            .delay-300 { animation-delay: 0.3s; }
            `}
        </style>

      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <CalendarCheck className="text-purple-600" size={36} />
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Event<span className="text-purple-600">Planner</span>
            </h1>
          </div>
          <div className="flex space-x-4">
           
            <Link
              to="/login"
              className="px-5 py-2  rounded-full bg-white text-purple-600 border border-purple-600 font-semibold hover:bg-purple-50 transition duration-300 shadow-sm"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="container mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
            
            {/* Texte et CTA */}
            <div className="lg:order-1 order-2">
                <p className="text-lg font-semibold text-purple-600 mb-3 animate-fadeIn delay-100">
                    LA PLATEFORME D'ÉVÉNEMENTIEL TOUT-EN-UN
                </p>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight animate-fadeIn delay-200">
                    Organisez, Partagez, Vivez.
                </h2>
                <p className="text-gray-600 mb-10 max-w-xl text-xl animate-fadeIn delay-300">
                    De la planification initiale à la création de liens sociaux, EventPlanner est l'outil ultime pour transformer vos idées en événements mémorables.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeIn delay-400">
                    <Link
                        to="/signup"
                        className="bg-purple-600  text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-700 transition transform hover:scale-105 shadow-xl shadow-purple-200 duration-300"
                    >
                        Commencer Gratuitement
                    </Link>
                    <a
                        href="#features"
                        className="bg-white text-gray-700 px-8 py-4 rounded-full font-bold text-lg border border-gray-300 hover:bg-gray-100 transition transform hover:scale-105 shadow-md duration-300"
                    >
                        Découvrir les Fonctionnalités
                    </a>
                </div>
            </div>

            {/* Mockup de l'Application (Visuel) */}
            <div className="lg:order-2 order-1">
                <AppMockupCard />
            </div>

        </div>
      </main>

      {/* Section Fonctionnalités (Features) */}
        <section id="features" className="py-20 md:py-32 bg-white">
            <div className="container mx-auto px-6">
                <h3 className="text-4xl font-extrabold text-center text-gray-900 mb-4 animate-fadeIn">
                    Toutes les fonctionnalités dont vous avez besoin
                </h3>
                <p className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto animate-fadeIn delay-100">
                    EventPlanner va au-delà de la simple invitation, intégrant des outils sociaux et logistiques puissants.
                </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition transform hover:translate-y-[-5px] cursor-pointer duration-300 flex flex-col items-center text-center animate-fadeIn"
                   style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className={`p-4 rounded-full bg-opacity-10 mb-4 ${
                        index % 6 === 0 ? 'bg-purple-100' : 
                        index % 6 === 1 ? 'bg-red-100' : 
                        index % 6 === 2 ? 'bg-blue-100' :
                        index % 6 === 3 ? 'bg-pink-100' :
                        index % 6 === 4 ? 'bg-green-100' : 
                        'bg-yellow-100'
                    }`}>
                        {feature.icon}
                    </div>
                  <h3 className="font-bold text-2xl mb-3 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-8 mt-16 text-center text-gray-500 text-sm md:text-base">
        <div className="container mx-auto px-6">
            <p className="mb-2">© 2025 EventPlanner. Tous droits réservés.</p>
            <div className="flex justify-center space-x-4 text-xs">
                <a href="#" className="hover:text-purple-600 transition">Confidentialité</a>
                <span className="text-gray-300">|</span>
                <a href="#" className="hover:text-purple-600 transition">Conditions d'utilisation</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;