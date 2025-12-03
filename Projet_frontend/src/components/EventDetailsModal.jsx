import React, { useState, useEffect } from "react";
import { X, Heart, MessageSquare, Clock, MapPin, User, Send, Calendar, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MapModal from '../components/MapModal';
//import { formatEventDetails, getEventImage } from "./utils"; // Assurez-vous d'exporter ces utilitaires de MyEvent.jsx
// NOTE : J'utilise des noms de fonctions utilitaires génériques, ajustez l'import si nécessaire.
const Avatar = ({ user, size = "10", showOnlineStatus = true }) => {
    const isOnline = user?.isOnline === true;
    const dimensionClass = `w-${size} h-${size}`;

    return (
        <div className={`relative ${dimensionClass}`}>
            {user?.profilePicture ? (
                <img
                    src={`http://localhost:8000${user.profilePicture}`}
                    alt={user?.name}
                    className={`rounded-full object-cover border-2 border-white shadow-md ${dimensionClass}`}
                />
            ) : (
                <div
                    className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md ${dimensionClass}`}
                >
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
            )}

            {showOnlineStatus && isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full z-10"></span>
            )}
        </div>
    );
};
const formatEventDetails = (event) => {
    // Si l'événement n'existe pas encore ou n'a pas les champs nécessaires
    if (!event) {
        return { date: 'N/A', time: 'N/A', location: 'Lieu inconnu' };
    }

    let formattedDate = 'Date N/A';
    let formattedTime = 'Heure N/A';

    // 1. Formatage de la date
    if (event.event_date) {
        try {
            const dateObj = new Date(event.event_date);
            // Vérifie si la date est valide avant de la formater
            if (!isNaN(dateObj)) {
                formattedDate = dateObj.toLocaleDateString("fr-FR", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (e) {
            console.warn("Erreur de formatage de la date:", e);
        }
    }
    
    // 2. Formatage de l'heure (si le champ event_time existe)
    if (event.event_time) {
        // Supposons que event_time est déjà au format "HH:MM:SS" ou un objet Date
        formattedTime = event.event_time.substring(0, 5); // Simplification à HH:MM
    }
    
    // 3. Lieu
    const location = event.event_location || 'Lieu inconnu';

    return {
        date: formattedDate,
        time: formattedTime,
        location: location
    };
};
const formatTimeAgo = (dateString) => {
  if (!dateString) return "À l'instant";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (seconds < 60) return "À l'instant";
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;
    
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch (e) {
    return "À l'instant";
  }
};

// Fonction pour obtenir l'URL de l'image
const getEventImage = (event) => {
    if (event.image) {
        return `http://localhost:8000/${event.image}`;
    }
    return "https://via.placeholder.com/600x400?text=Event";
};

const EventDetailsModal = ({ event, onClose, onLikeToggle, refetchEvents }) => {

    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const [isMapOpen, setIsMapOpen] = useState(false);
    // Assurez-vous que l'événement passé contient ces champs (si votre API les fournit)
    const { date: eventDate, time: eventTime, location: eventLocation } = formatEventDetails(event);
    const hasLiked = event.has_liked || false;
    const likesCount = event.likes_count || 0;
    
    const jwt = localStorage.getItem("jwt");

    // --- Récupération des Commentaires ---
    const fetchComments = async () => {
        if (!event || !event.id) return;
        try {
            const res = await fetch(`http://localhost:8000/api/events/${event.id}/comments`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            if (!res.ok) throw new Error("Erreur de chargement des commentaires");
            const data = await res.json();
            setComments(data);
        } catch (err) {
            console.error("Erreur de commentaire:", err);
            // Gérer l'erreur utilisateur si besoin
        }
    };

    useEffect(() => {
        if (event) {
            fetchComments();
        }
    }, [event]);

    // --- Soumission d'un Commentaire ---
    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        setIsLoading(true);

        try {
            const res = await fetch(`http://localhost:8000/api/events/${event.id}/comments`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${jwt}` 
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!res.ok) throw new Error("Erreur lors de l'envoi du commentaire");
            
            setNewComment("");
            await fetchComments(); // Recharger les commentaires
            refetchEvents(); // Pour mettre à jour le compteur dans le Dashboard
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'ajout du commentaire.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!event) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-lg  bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-screen flex flex-col md:flex-row overflow-hidden">
                
                {/* Bouton de Fermeture */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-3 shadow-lg text-gray-700 hover:bg-gray-100 transition"
                >
                    <X size={24} />
                </button>

                {/* Partie Gauche: Détails & Image */}
                <div className="p-2 bg-white">
                <div className="h-full relative">
                    <img
                        src={getEventImage(event)}
                        alt={event.title}
                        className="w-full h-80 md:h-full object-cover rounded-2xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t  p-4 flex flex-col justify-end">
                        <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
                        <div className="flex items-center text-sm text-white/80 gap-3">
                            <p className="flex items-center"><Calendar size={16} className="mr-1" /> {eventDate}</p>
                            <p className="flex items-center"><Clock size={16} className="mr-1" /> {eventTime}</p>
                        </div>
                    </div>
                </div>
              </div>
                {/* Partie Droite: Informations, Likes & Commentaires */}
                <div className="w-full  p-6 flex flex-col max-h-full overflow-y-auto">
                    
                    {/* Infos Principales */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                         <p className="text-gray-700 mb-4">{event.description || "Description non disponible."}</p>
                         <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin size={16} className="mr-2 text-purple-500" />
                            <span>{eventLocation}</span>
                        </div>
                         <button 
                                    onClick={() => setIsMapOpen(true)} // <== ACTION NOUVELLE
                                    disabled={!event.latitude || !event.longitude} // Désactive si les coordonnées manquent
                                    className="text-xs font-semibold text-pink-600 hover:text-pink-800 transition disabled:text-gray-400"
                                >
                                    Voir sur la carte
                                </button>
                        <div className="flex items-center text-sm text-gray-600">
                            <User size={16} className="mr-2 text-pink-500" />
                            <span>Organisé par : *{event.organizer?.name || 'Inconnu'}*</span>
                        </div>
                    </div>

                    {/* Interactions */}
                    <div className="flex items-center justify-between mb-6">
                        {/* Bouton Like */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onLikeToggle(event.id); 
                            }}
                            className={`flex items-center gap-2 font-bold transition p-2 rounded-full ${hasLiked ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'}`}
                            disabled={!user}
                        >
                            <Heart size={20} fill={hasLiked ? "currentColor" : "none"}/>
                            <span>{likesCount} {likesCount <= 1 ? "J'aime" : "J'aimes"}</span>
                        </button>
                        
                        {/* Compteur Commentaires */}
                        <div className="flex items-center gap-2 text-gray-500 font-semibold">
                            <MessageSquare size={20} />
                            <span>{comments.length} Commentaire{comments.length > 1 ? "s" : ""}</span>
                        </div>
                    </div>

                    {/* Section Commentaires */}
                    <div className="flex-1 overflow-y-auto pr-4 mb-4">
                        <h4 className="text-lg font-bold text-gray-800 mb-3 border-t pt-4">Commentaires</h4>
                        {comments.length === 0 ? (
                            <p className="text-sm text-gray-500">Soyez le premier à commenter !</p>
                        ) : (
                            <div className="space-y-3">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex items-start gap-3 p-2 pt-2 bg-gray-100 rounded-2xl">
                                        
                                        {/* Avatar */}
                                        <Avatar user={comment.user} size="10" showOnlineStatus={false} />

                                        {/* Contenu du commentaire */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                            {/* Nom de l'utilisateur */}
                                            <span className="font-semibold text-gray-900 text-sm">{comment.user?.name || "Inconnu"}</span>
                                            {/* Date du commentaire */}
                                            <span className="text-xs text-gray-400">{formatTimeAgo(comment.created_at)}</span>
                                            </div>
                                            {/* Contenu */}
                                            <p className="text-gray-700 text-sm">{comment.content}</p>
                                        </div>
                                        </div>
                                    ))}
                                    </div>

                                )}
                            </div>

                    {/* Formulaire de Commentaire */}
                    {user ? (
                        <form onSubmit={handleSubmitComment} className="pt-4 border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Écrire un commentaire..."
                                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                                    disabled={isLoading}
                                />
                                <button 
                                    type="submit"
                                    className="p-3 bg-purple-600 text-white rounded-3 hover:bg-purple-700 disabled:bg-gray-400 transition"
                                    disabled={isLoading || !newComment.trim()}
                                >
                                    {isLoading ? <Zap size={20} className="animate-pulse" /> : <Send size={20} />}
                                </button>
                            </div>
                        </form>
                    ) : (
                         <p className="text-center text-sm text-gray-500 pt-4 border-t">
                             Connectez-vous pour liker et commenter.
                        </p>
                    )}
                </div>
            </div>
        

         {/* MODALE DE CARTE (RENDUE CONDITIONNELLEMENT) */}
            {isMapOpen && (
                <MapModal
                    latitude={event.latitude}
                    longitude={event.longitude}
                    locationName={event.event_location}
                    onClose={() => setIsMapOpen(false)}
                />
            )}
      </div>       
    );
};

export default EventDetailsModal;