// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Calendar, Clock, MapPin, Search, Bookmark, Eye, Trash2 } from "lucide-react";

// // --- Composant EventDiscoveryCard (Version pour cohérence) ---
// // NOTE: Dans votre projet final, vous DEVRIEZ IMPORTER ce composant
// // depuis votre fichier Dashboard/composants réutilisables pour éviter la duplication.
// const EventDiscoveryCard = ({ event, onDetailsClick }) => {
//     const eventDate = event.event_date
//         ? new Date(event.event_date).toLocaleDateString("fr-FR", {
//               month: "short",
//               day: "numeric",
//           })
//         : "Date N/A";

//     // Données simulées pour le design
//     const rating = ((Math.random() * (5.0 - 3.0)) + 3.0).toFixed(1);
//     const attendees = Math.floor(Math.random() * 50) + 10;

//     return (
//         <div 
//             key={event.id}
//             className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full"
//             onClick={() => onDetailsClick(event.id)}
//         >
//             {/* Image d'Événement */}
//             <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-purple-400 via-pink-400 to-red-400">
//                 <div className="absolute inset-0 bg-cover bg-center opacity-60" 
//                     style={{ backgroundImage: 'url("https://via.placeholder.com/600x400?text=Event")' }} 
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
//                 {/* Bouton Bookmark */}
//                 <button 
//                     className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-gray-700 hover:bg-white hover:text-purple-600 transition-all shadow-lg group-hover:scale-110 z-10"
//                     onClick={(e) => { e.stopPropagation(); /* Ajouter la logique de bookmark */ }}
//                 >
//                     <Bookmark size={20} fill="none" />
//                 </button>

//                 {/* Date Badge */}
//                 <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl">
//                     <p className="text-sm font-bold text-gray-800">{eventDate}</p>
//                 </div>
//             </div>

//             {/* Contenu de la carte */}
//             <div className="p-5 flex flex-col gap-3 h-full">
//                 {/* Titre et Rating */}
//                 <div className="flex justify-between items-start gap-2">
//                     <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
//                         {event.title}
//                     </h3>
//                     <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
//                         <span className="text-lg">⭐</span>
//                         <span className="text-sm font-bold text-gray-700">{rating}</span>
//                     </div>
//                 </div>

//                 {/* Location */}
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <MapPin size={16} className="text-purple-500 flex-shrink-0" />
//                     <span className="line-clamp-1">{event.event_location || "À déterminer"}</span>
//                 </div>

//                 {/* Avatars et compteur */}
//                 <div className="flex items-center -space-x-3 mt-2">
//                     {Array(Math.min(3, Math.floor(Math.random() * 5) + 2)).fill(0).map((_, i) => (
//                         <div 
//                             key={i}
//                             className="w-8 h-8 rounded-full ring-2 ring-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xs"
//                         >
//                             {String.fromCharCode(65 + i)}
//                         </div>
//                     ))}
//                     <span className="text-xs text-gray-600 ml-2 font-semibold">+{attendees} personnes</span>
//                 </div>


//                 {/* Bouton d'Action */}
//                 <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
//                     <button 
//                         onClick={(e) => { e.stopPropagation(); onDetailsClick(event.id); }}
//                         className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5 rounded-xl transition-all hover:shadow-lg"
//                     >
//                         <Eye size={16} />
//                         Détails
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };


// /**
//  * Composant pour afficher les événements créés par d'autres utilisateurs.
//  * Utilise le design harmonisé du Dashboard.
//  * @param {Array} discoveryEvents - La liste des événements NON créés par l'utilisateur.
//  */
// const Discovery = ({ discoveryEvents }) => {
//     const navigate = useNavigate();
    
//     const handleEventDetails = (eventId) => {
//         navigate(`/event/${eventId}`);
//     };

//     // Rendu : Aucun Événement de Découverte (Design harmonisé)
//     if (discoveryEvents.length === 0) {
//         return (
//             <div className="flex flex-col items-center justify-center p-20 bg-white border-2 border-dashed border-gray-300 rounded-3xl text-center shadow-lg">
//                 <div className="p-6 bg-pink-100 rounded-full mb-6">
//                     <Search className="w-12 h-12 text-pink-600" />
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-800 mb-3">Pas de nouvelles découvertes</h3>
//                 <p className="text-gray-500 mb-8 max-w-sm">
//                     Revenez plus tard ou ajustez vos filtres pour voir les événements de la communauté.
//                 </p>
//             </div>
//         );
//     }

//     // Rendu : Liste des Événements de Découverte (Utilisation de EventDiscoveryCard)
//     return (
//         <div className="space-y-8">
//             {/* Header de la section harmonisé */}
//             <div>
//                 <h2 className="text-4xl font-bold text-gray-900 mb-3">
//                     Découverte
//                 </h2>
//                 <p className="text-gray-600 text-lg">
//                     Explorez <span className="font-bold text-pink-600">{discoveryEvents.length}</span> événement{discoveryEvents.length > 1 ? "s" : ""} de la communauté.
//                 </p>
//             </div>

//             {/* Grille d'Événements de Découverte */}
//             <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                 {discoveryEvents.map((event) => (
//                     <EventDiscoveryCard 
//                         key={event.id}
//                         event={event}
//                         onDetailsClick={handleEventDetails}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Discovery;