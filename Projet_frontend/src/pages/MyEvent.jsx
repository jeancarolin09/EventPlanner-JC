import React from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, MapPin, Trash2, Zap, Hourglass, CheckCircle, Share2, Lock } from "lucide-react"; // Ajout d'icônes

// ----------------------------------------------------------------------
// 1. Formatage date / heure
// ----------------------------------------------------------------------

const formatEventDetails = (event) => {
    let formattedDate = "Non précisé";
    let formattedTime = "Non précisé";

    if (event.event_date) {
        try {
            formattedDate = new Date(event.event_date).toLocaleDateString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
            });
        } catch (e) {}
    }

    const timeSource = event.event_time?.date || event.event_time || event.event_date;

    if (timeSource) {
        try {
            formattedTime = new Date(timeSource).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {}
    }

    return {
        date: formattedDate,
        time: formattedTime,
        location: event.event_location || "À déterminer",
    };
};


// Vérifie si l’événement approche
const isEventSoon = (event) => {
    if (!event.event_date) return false;

    const eventDate = new Date(event.event_date);
    const now = new Date();

    const diffMs = eventDate - now;

    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    return {
        isVerySoon: diffHours <= 6 && diffHours > 0, // Moins de 6h
        isSoon: diffDays <= 3 && diffDays > 0,       // Moins de 3 jours
    };
};

// ----------------------------------------------------------------------
// 2. Fonction utilitaire pour l’image
// ----------------------------------------------------------------------

const getEventImage = (event) => {
    if (event.image) {
        return `http://localhost:8000/${event.image}`;
    }
    return "https://via.placeholder.com/600x400?text=Event";
};

// ----------------------------------------------------------------------
// 3. Fonction utilitaire pour le statut de l'événement
// ----------------------------------------------------------------------

/**
 * Détermine le statut de l'événement (Passé, Présent, Futur)
 * @param {object} event
 * @returns {{ status: 'Passé' | 'Présent' | 'Futur', icon: JSX.Element, color: string }}
 */
const getEventStatus = (event) => {
    const eventDate = event.event_date ? new Date(event.event_date) : null;
    if (!eventDate) {
        return { status: "Inconnu", icon: <Clock size={16} />, color: "text-gray-500 bg-gray-100" };
    }

    const today = new Date();
    // Normaliser à minuit pour une comparaison de date pure
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (eventDay.getTime() === todayDay.getTime()) {
        // Optionnel : vérifier si l'heure est passée pour un statut "En cours" ou "Passé" plus précis aujourd'hui
        // Ici, on le considère "Présent" pour la journée
        return { status: "Présent", icon: <Zap size={16} />, color: "text-red-600 bg-red-100" };
    } else if (eventDay.getTime() < todayDay.getTime()) {
        return { status: "Passé", icon: <CheckCircle size={16} />, color: "text-green-600 bg-green-100" };
    } else {
        return { status: "Futur", icon: <Hourglass size={16} />, color: "text-blue-600 bg-blue-100" };
    }
};

// ----------------------------------------------------------------------
// 4. Carte d’un événement (Mise à jour)
// ----------------------------------------------------------------------

const EventDiscoveryCard = ({ event, onDetailsClick, onDeleteClick, onToggleShare, userId }) => {
    const { date: eventDate, time: eventTime, location: eventLocation } = formatEventDetails(event);
    const { status, icon, color } = getEventStatus(event); // Récupérer le statut
    const isOrganizer = String(event.organizer?.id) === String(userId);
    const isShared = event.is_publicly_shared;
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full border border-gray-100">
            
            {/* IMAGE ET STATUT */} 
            <div className="p-2 bg-white" >
            <div className="relative h-52 w-full overflow-hidden">
                
                <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t" />

                {/* Balise de statut */}
                <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-full shadow ${color}`}>
                    {icon}
                    <span>{status}</span>
                </div>

                <div className="absolute top-4 left-4 p-2 bg-white/90 rounded-full shadow">
                    <Calendar size={20} className="text-purple-600" />
                </div>

                {/* 💡 NOUVEAU: Indicateur de Partage Public (Coin Supérieur Gauche) */}
                {isShared ? (
                    <div className="absolute top-4 left-4 p-2 bg-green-500/90 rounded-full shadow-lg" title="Partagé publiquement">
                        <Share2 size={20} className="text-white" />
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 p-2 bg-yellow-500/90 rounded-full shadow-lg" title="Brouillon / Privé">
                        <Lock size={20} className="text-white" />
                    </div>
                )}
            </div>
          </div>
            {/* CONTENU */}
            <div className="p-2 flex flex-col flex-1">
                <h4 className="text-xl font-extrabold text-gray-900 line-clamp-2 mb-2 flex-1">
                    {event.title}
                </h4>

                {/* Détails de l'événement affichés (décommentés pour l'exemple, ou restructurer si nécessaire) */}
                <div className="space-y-2 text-sm text-gray-600 mb-0">
                    <p className="flex items-center">
                        <Calendar size={16} className="text-purple-500 mr-2" />
                        <span className="truncate font-semibold">{eventDate}</span>
                    </p>
                    {/* <p className="flex items-center">
                        <Clock size={16} className="text-pink-500 mr-2" />
                        <span className="truncate">{eventTime}</span>
                    </p>
                    <p className="flex items-center">
                        <MapPin size={16} className="text-blue-500 mr-2" />
                        <span className="truncate">{eventLocation}</span>
                    </p> */}
                </div>
                {/* Fin des détails */}

                <div className="flex gap-3 mt-auto pt- border-t border-gray-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDetailsClick(event.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-pill transition"
                    >
                        Détails
                    </button>

                    {isOrganizer && (
                    <>
                        {/* 💡 NOUVEAU: Bouton Toggle Partage Public */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleShare(event.id, isShared);
                            }}
                            title={isShared ? "Retirer du partage public" : "Partager publiquement"}
                            className={`p-3 rounded-pill transition ${isShared 
                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Share2 size={20} />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick(event.id);
                            }}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-pill"
                        >
                            <Trash2 size={20} />
                        </button>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------------------------
// 5. Page Mes Événements (Mise à jour pour le classement)
// ----------------------------------------------------------------------

function MyEvent() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        data: eventsData,
        isLoading,
        isError,
        refetch,
    } = useEvents();

    const myEvents = Array.isArray(eventsData) ? eventsData : [];

    // --- ALERTES EVENEMENTS PROCHES ---
        React.useEffect(() => {
            if (!myEvents.length) return;

            myEvents.forEach(event => {
                const { isSoon, isVerySoon } = isEventSoon(event);
                const alertKey = `alert_shown_event_${event.id}`;

                // Déjà montré ? On ignore
                if (localStorage.getItem(alertKey)) return;

                if (isVerySoon) {
                    alert(`⚠️ L’événement "${event.title}" commence dans moins de 6 heures !`);
                    localStorage.setItem(alertKey, "1");
                } 
                else if (isSoon) {
                    alert(`⏳ L’événement "${event.title}" commence dans moins de 3 jours.`);
                    localStorage.setItem(alertKey, "1");
                }
            });
        }, [myEvents]);


    // --- LOGIQUE DE CLASSEMENT ---
    const futureEvents = myEvents
        .filter(event => getEventStatus(event).status === 'Futur')
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Triez par date la plus proche

    const presentEvents = myEvents
        .filter(event => getEventStatus(event).status === 'Présent')
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Triez si plusieurs événements aujourd'hui

    const pastEvents = myEvents
        .filter(event => getEventStatus(event).status === 'Passé')
        .sort((a, b) => new Date(b.event_date) - new Date(a.event_date)); // Triez par date la plus récente

    const totalEventsCount = myEvents.length;

    const renderEventSection = (title, events, emptyMessage) => {
        if (events.length === 0) {
            return (
                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
                    {emptyMessage}
                </div>
            );
        }

        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.map((event) => (
                    <EventDiscoveryCard
                        key={event.id}
                        event={event}
                        onDetailsClick={handleDetailsClick}
                        onDeleteClick={handleDeleteEvent}
                        onToggleShare={handleToggleShare}
                        userId={user?.id}
                    />
                ))}
            </div>
        );
    };

    // --- FIN LOGIQUE DE CLASSEMENT ---

    // NOUVEAU: Fonction pour gérer le partage public
    const handleToggleShare = async (eventId, currentlyShared) => {
        const action = currentlyShared ? "retirer du partage public" : "partager publiquement";
        if (!window.confirm(`Voulez-vous vraiment ${action} cet événement ?`)) return;

        try {
            const jwt = localStorage.getItem("jwt");

            const res = await fetch(`http://localhost:8000/api/events/${eventId}/share`, {
                method: "POST", // Utilise la méthode POST que nous avons définie
                headers: { 
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert(`Événement ${action} avec succès !`);
            refetch(); // Recharge les événements pour mettre à jour l'état visuel
        } catch (err) {
            alert("Erreur lors de l'opération de partage : " + err.message);
        }
    };

    const handleDetailsClick = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

        try {
            const jwt = localStorage.getItem("jwt");

            const res = await fetch(`http://localhost:8000/api/events/${eventId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${jwt}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            alert("Événement supprimé !");
            refetch();
        } catch (err) {
            alert("Erreur : " + err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-3xl shadow-xl p-10">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-700">Chargement...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-red-50 border border-red-300 rounded-3xl shadow-xl p-10 text-center">
                <h3 className="text-2xl font-bold text-red-700 mb-4">Erreur</h3>
                <p className="text-red-500 mb-6">Impossible de charger les événements.</p>
                <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                >
                    Reconnexion
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* EN-TÊTE GÉNÉRAL */}
            <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    Mes Événements Organisés
                </h2>
                <p className="text-gray-600 text-lg">
                    Vous gérez un total de **{totalEventsCount}** événement{totalEventsCount > 1 ? "s" : ""}.
                </p>
            </div>
            
            <hr className="border-gray-200"/>

            {totalEventsCount === 0 ? (
                // MESSAGE AUCUN ÉVÉNEMENT
                <div className="flex flex-col items-center justify-center p-20 bg-white border-2 border-dashed border-purple-300 rounded-3xl text-center shadow-lg">
                    <div className="p-6 bg-purple-100 rounded-full mb-6">
                        <Calendar className="w-12 h-12 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Aucun événement trouvé</h3>
                    <p className="text-gray-600 mb-6">Commencez par créer votre premier événement !</p>
                    <button
                        onClick={() => navigate("/create-event")}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-pill hover:shadow-xl transition"
                    >
                        + Créer un Événement
                    </button>
                </div>
            ) : (
                // AFFICHAGE DES CATÉGORIES
                <div className="space-y-12">
                    
                    {/* Événements Futurs */}
                    <div>
                        <h3 className="text-3xl font-extrabold text-blue-700 mb-5 flex items-center gap-2">
                            <Hourglass size={24} /> Événements à Venir ({futureEvents.length})
                        </h3>
                        {renderEventSection(
                            "Événements à Venir",
                            futureEvents,
                            "Aucun événement futur planifié pour le moment."
                        )}
                    </div>

                    {/* Événements Présents (Aujourd'hui) */}
                    <div>
                        <h3 className="text-3xl font-extrabold text-red-700 mb-5 flex items-center gap-2">
                            <Zap size={24} /> Événements du Jour ({presentEvents.length})
                        </h3>
                        {renderEventSection(
                            "Événements du Jour",
                            presentEvents,
                            "Aucun événement en cours ou prévu aujourd'hui."
                        )}
                    </div>

                    {/* Événements Passés */}
                    <div>
                        <h3 className="text-3xl font-extrabold text-green-700 mb-5 flex items-center gap-2">
                            <CheckCircle size={24} /> Événements Passés ({pastEvents.length})
                        </h3>
                        {renderEventSection(
                            "Événements Passés",
                            pastEvents,
                            "Aucun événement passé n'a été trouvé."
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyEvent;