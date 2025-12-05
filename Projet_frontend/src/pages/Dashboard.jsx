import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents as useMyEvents } from "../hooks/useEvents"; 
import { useDiscoveryEvents } from "../hooks/useDiscoveryEvents";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

import { 
    Menu, X, LogOut, Home, Mail, Activity, Calendar, MapPin as MapPinIcon, 
    Trash2, Search, ChevronDown, DollarSign, Bookmark, Users, Bell,
    Settings, HelpCircle, User, Zap, LogIn, ChevronLeft, Heart, MessageCircle, MessageSquare
} from "lucide-react";
import Invitations from "./Invitations";
import Feed from "../components/Feed";
import MyEvent from "./MyEvent";
import EventDetailsModal from "../components/EventDetailsModal";
import Messenger from '../components/Messenger';

// --- Composant Avatar ---
const Avatar = ({ user, src, name, size = 10 }) => {
    // Détermine la vraie source de l'image
    const profileSrc = src 
        ? `http://localhost:8000${src}`
        : user?.profilePicture 
            ? `http://localhost:8000${user.profilePicture}`
            : null;

    const displayName = name || user?.name || "?";
    const initial = displayName.charAt(0).toUpperCase();

    if (profileSrc) {
        return (
            <img
                src={profileSrc}
                alt="Profil"
                className={`rounded-full object-cover `}
                style={{
                    width: `${size * 4}px`,
                    height: `${size * 4}px`,
                }}
            />
        );
    }

    return (
        <div
            className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center border-2 border-purple-400`}
            style={{
                width: `${size * 4}px`,
                height: `${size * 4}px`,
                fontSize: `${size * 1.5}px`
            }}
        >
            {initial}
        </div>
    );
};


// --- Composant Badge de Notification ---
const NotificationBadge = ({ count }) => {
    if (!count) return null;

    if (count === "!") {
        return (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-lg font-bold 
                            rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                !
            </div>
        );
    }

    return (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
            {count > 99 ? "99+" : count}
        </div>
    );
};

// --- Composant de Navigation Latérale (Mini-Sidebar du template) ---
const MiniSidebar = ({ 
    activeTab, 
    setActiveTab, 
    handleLogout,
    hasUpcomingEventAlert,
}) => {
    const { counts } = useNotifications(10000);

    const navItems = [
        { id: "discovery", icon: Home, label: "Découverte" },
        { id: "my-event", icon: Calendar,label: "Mes événements", badge: hasUpcomingEventAlert ? "!" : null },
        { id: "messages", icon: MessageCircle, label: "Messages", badge: counts.messages },
        { id: "invitations", icon: Mail, label: "Invitations", badge: counts.invitations },
        { id: "activity", icon: Activity, label: "Activités", badge: counts.activities },
    ];

    return (
        <aside className="fixed pt-10 left-0 h-screen w-24 bg-transparent p-6 flex flex-col items-center overflow-visible z-50">
            <nav className="flex flex-col items-center gap-6 pt-35 w-full">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <div key={item.id} className="relative group overflow-visible">
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`
                                    flex items-center justify-center
                                    w-12 h-12 
                                    rounded-2xl
                                    transition-all duration-200

                                    ${isActive
                                        ? "text-purple-600 bg-purple-100 scale-110 shadow-inner-custom rounded-4"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100 hover:scale-105 rounded-2"
                                    }
                                `}
                            >
                                <Icon size={22} />
                                 {item.badge > 0 && <NotificationBadge count={item.badge} />}
                            </button>
                             {/* 🟣 Tooltip */}
                            <div className="
                            absolute left-16 top-1/2 -translate-y-1/2
    opacity-0 pointer-events-none
    group-hover:opacity-100 group-hover:pointer-events-auto
    transition-all duration-200
    bg-gray-900 text-white text-xs font-semibold 
    px-3 py-1 rounded-lg shadow-lg whitespace-nowrap
    **z-[100]**
                            ">
                                {item.label}
                            </div>
                        </div>
                    );
                })}
            </nav>

             {/* Logout button with tooltip */}
            <div className="relative group mt-auto pb-20">
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full h-14 
                               text-gray-500 hover:text-red-600 hover:scale-105 transition-all duration-200"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Tooltip logout */}
                <div className="
                   absolute left-16 top-1/2 -translate-y-1/2
                    opacity-0 pointer-events-none 
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-all duration-200
                    bg-gray-900 text-white text-xs font-semibold 
                    px-3 py-1 rounded-lg shadow-lg whitespace-nowrap
                    **z-[100]**
                ">
                    Déconnexion
                </div>
            </div>
        </aside>
    );
};

const getEventImage = (event) => {
    if (event.image) {
        return `http://localhost:8000/${event.image}`;
    }
    return "https://via.placeholder.com/600x400?text=Event";
};

// --- Card d'événement réutilisable ---
const EventDiscoveryCard = ({ event, onDetailsClick, onDeleteClick, onLikeToggle, onBookmarkToggle}) => {
    const eventDate = event.event_date
        ? new Date(event.event_date).toLocaleDateString("fr-FR", {
              month: "long",
              day: "numeric",
              year: "numeric"
          })
        : "Date N/A";

    const isMyEvent = event.user_is_organizer || (event.organizer_id === event.user_id); 
    const rating = ((Math.random() * (5.0 - 3.0)) + 3.0).toFixed(1);
    const confirmedGuestsCount = Array.isArray(event.guests) ? event.guests.filter(g => g.status === 'accepted').length : 0;
    
    const likesCount = event.likes_count || 0; 
    const hasLiked = event.has_liked || false; 
    const commentsCount = event.comments_count || 0;
    const bookmarksCount = event.bookmarks_count || 0;
    const hasBookmarked = event.has_bookmarked || false;
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
        onClick={() => onDetailsClick(event.id)}
        >
            <div className="p-2 bg-white" >
                <div className="relative h-56 w-full overflow-hidden rounded-2xl">
                    <img
                        src={getEventImage(event)}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t" />
                </div>
            </div>


            <div className="p-2 flex flex-col gap-0 h-full">
                <div className="flex justify-between items-start gap-2 px-2 ">
                    <h5 className="text-lg  font-bold text-gray-900 line-clamp-2 flex-1">
                        {event.title}
                    </h5>
               
                
        <button
            onClick={(e) => { 
                e.stopPropagation(); 
                onBookmarkToggle(event.id); 
            }}
            className={`
                flex items-center gap-1.5 font-semibold transition
                ${hasBookmarked ? "text-yellow-500" : "text-gray-500 hover:text-yellow-500"}
            `}
        >
            <Bookmark 
                size={20} 
                fill={hasBookmarked ? "currentColor" : "none"} 
            />
            <span>{bookmarksCount}</span>
            
            </button>

        </div>


                <div className="flex items-center gap-1 text-sm text-gray-600 px-2">
                    <MapPinIcon size={16} className="text-purple-500 flex-shrink-0" />
                    <span className="line-clamp-1">{event.event_location || "À déterminer"}</span>
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
    {/* À gauche : avatar + nom */}
    <div className="flex items-center gap-2">
        <Avatar 
            src={event.organizer?.profilePicture}
            name={event.organizer?.name}
            size={6} // plus petit
        />
        <span className="text-sm font-semibold text-gray-800">
            {event.organizer?.name}
        </span>
    </div>

    {/* À droite : likes + commentaires */}
    <div className="flex items-center gap-4 text-sm text-gray-600">
        <button  
            onClick={(e) => { e.stopPropagation(); onLikeToggle(event.id); }}
            className={`flex items-center gap-1.5 font-semibold transition ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
        >
            <Heart size={18} fill={hasLiked ? "currentColor" : "none"}/>
            <span>{likesCount}</span>
        </button> 

        <div className="flex items-center gap-1.5"> 
            <MessageSquare size={18} />
            <span>{commentsCount}</span>
        </div> 

        {/* <div className="flex items-center gap-1.5">
            <Users size={18} />
            <span>{confirmedGuestsCount}</span>
        </div>  */}
    </div>
 </div>
            </div>
        </div>
    );
 };

// --- Vue de Découverte ---
const DiscoveryFeed = ({ 
    events, 
    onDetailsClick, 
    onDeleteClick, 
    onLikeToggle, 
    onBookmarkToggle, 
    navigate,
    searchTitle,
    setSearchTitle,
    searchLocation,
    setSearchLocation,
    searchDate,
    setSearchDate 
}) => (
    <div className="space-y-10">
        <div> 
            <h1 className="text-5xl font-extrabold text-gray-900">
                Good morning, {JSON.parse(localStorage.getItem("user"))?.name || "Mike"}! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Let's dive into exciting new events.</p>
        </div>

        <div className="bg-white p-3 rounded-3xl shadow-lg border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-5 items-center">
                <div className="flex-1 flex items-center border border-gray-300 rounded-3xl px-5 py-3 hover:border-purple-400 transition-colors">
                    <MapPinIcon size={20} className="text-gray-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by location..."
                        value={searchLocation}
                        onChange={e => setSearchLocation(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700"
                    />
                </div>

                <div className="flex-1 flex items-center border border-gray-300 rounded-3xl px-5 py-3 hover:border-purple-400 transition-colors">
                    <Calendar size={20} className="text-gray-500 mr-3" />
                    <input
                        type="date"
                        placeholder="Search by date..."
                        value={searchDate}
                        onChange={e => setSearchDate(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700"
                    />
                </div>

                <div className="flex-1 flex items-center border border-gray-300 rounded-3xl px-5 py-3 hover:border-purple-400 transition-colors">
                    <Search size={20} className="text-gray-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTitle}
                        onChange={e => setSearchTitle(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-700"
                    />
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-3xl font-bold text-gray-900">Upcoming events</h2>
            
             {/* <button
        onClick={() => navigate("/map")}
        className="px-5 py-2 rounded-2 bg-purple-100 text-purple-700 font-semibold 
                   hover:bg-purple-200 transition"
    >
        Voir sur la carte 🗺️
    </button> */}

        </div>
        
        {events.length === 0 ? (
            <div className="text-center p-20 bg-gray-50 rounded-2xl text-gray-600 border border-gray-200">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-lg">Aucun événement trouvé pour la découverte.</p>
            </div>
        ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {events.slice(0, 12).map((event) => ( 
                    <EventDiscoveryCard 
                        key={event.id}
                        event={event}
                        onDetailsClick={onDetailsClick}
                        onLikeToggle={onLikeToggle}
                        onDeleteClick={onDeleteClick}
                        onBookmarkToggle={onBookmarkToggle}
                    />
                ))}
            </div>
        )}
    </div>
);

// --- Composant Principal : Dashboard ---
function Dashboard() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { 
        data: myEventsData, 
        isLoading: myEventsLoading, 
        isError: myEventsError, 
        refetch: refetchMyEvents 
    } = useMyEvents();  
    const { 
        data: discoveryEventsData, 
        isLoading: discoveryLoading, 
        isError: discoveryError, 
        refetch: refetchDiscoveryEvents 
    } = useDiscoveryEvents();

    const [activeTab, setActiveTab] = useState("discovery"); 
    const [selectedEvent, setSelectedEvent] = useState(null);
 
    const myEvents = Array.isArray(myEventsData) ? myEventsData : [];
    const [hasUpcomingEventAlert, setHasUpcomingEventAlert] = useState(false);
    const { notifications, counts, markAllAsRead, markMessagesAsRead ,unreadCount } = useNotifications();

    // Vérifie si un event est proche
        const isEventSoon = (event) => {
            if (!event.event_date) return false;

            const eventDate = new Date(event.event_date);
            const now = new Date();
            const diffMs = eventDate - now;
            const diffHours = diffMs / 1000 / 60 / 60;
            const diffDays = diffHours / 24;

            return diffHours > 0 && (diffHours <= 6 || diffDays <= 3);
        };
       useEffect(() => {
            if (!myEvents) return;

            const hasSoon = myEvents.some(isEventSoon);

            if (hasSoon) {
            setHasUpcomingEventAlert(true);
            }

            if (activeTab === "my-event" && hasUpcomingEventAlert) {
           setHasUpcomingEventAlert(false);
    }  
              if (activeTab === "messages") {
        markMessagesAsRead();
    }
        }, [myEvents, activeTab]);


 
    const discoveryEvents = Array.isArray(discoveryEventsData) ? discoveryEventsData : [];

    const [searchTitle, setSearchTitle] = useState("");
    const [searchLocation, setSearchLocation] = useState("");
    const [searchDate, setSearchDate] = useState("");
   
    const filteredEvents = discoveryEvents.filter(event => {
        const matchesTitle = event.title.toLowerCase().includes(searchTitle.toLowerCase());
        const matchesLocation = searchLocation === "" || (event.event_location?.toLowerCase().includes(searchLocation.toLowerCase()));
        const matchesDate = searchDate === "" || (event.event_date && event.event_date.startsWith(searchDate)); // Compare YYYY-MM-DD
        return matchesTitle && matchesLocation && matchesDate;
    });

    const allEvents = [...myEvents, ...discoveryEvents];

    

    const isLoading = myEventsLoading || discoveryLoading;
    const isError = myEventsError || discoveryError;
   
    const handleLikeToggle = async (eventId) => {
        if (!user) {
            alert("Vous devez être connecté pour interagir !");
            navigate("/login");
            return;
        }

        try {
            const jwt = localStorage.getItem("jwt");
            const res = await fetch(`http://localhost:8000/api/events/${eventId}/like`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Erreur de l'API de like");
            
            await refetchMyEvents(); 
            await refetchDiscoveryEvents(); 
           
            if (selectedEvent && selectedEvent.id === eventId) {
                const updatedEvent = allEvents.find(e => e.id === eventId);
                setSelectedEvent(updatedEvent);
            }

        } catch (err) {
            console.error("Erreur de Like:", err);
            alert("Erreur lors de l'interaction.");
        }
    };

   const handleBookmarkToggle = async (eventId) => {
    if (!user) {
        alert("Vous devez être connecté pour interagir !");
        navigate("/login");
        return;
    }

    try {
        const jwt = localStorage.getItem("jwt");

        const response = await fetch(`http://localhost:8000/api/events/${eventId}/bookmark`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
        });

        const data = await response.json();

        // 🔄 Mise à jour des événements
        refetchDiscoveryEvents();
        refetchMyEvents();

    } catch (error) {
        console.error("Erreur lors du bookmark :", error);
    }
};




    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet événement ?")) return;

        try {
            const jwt = localStorage.getItem("jwt");
            const res = await fetch(`http://localhost:8000/api/events/${eventId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");

            alert("Événement supprimé avec succès ✅");
            refetchMyEvents();
        } catch (err) {
            console.error(err);
            alert("❌ " + (err.message || "Erreur lors de la suppression"));
        }
    };
    
    const handleEventDetails = (eventId) => {
        const eventToDisplay = allEvents.find(e => e.id === eventId);
        if (eventToDisplay) {
            setSelectedEvent(eventToDisplay);
        }
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-6 text-gray-600 font-medium">Chargement des événements...</p>
            </div>
        );
    }

    if (isError) {
        navigate("/login"); 
        return null;
    }

    return (
        <div className="flex h-screen bg-gray-50">
            
            {/* 1. Mini-Sidebar avec Badges */}
            <MiniSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
                userEmail={user?.email}
                unreadCount={unreadCount}
                hasUpcomingEventAlert={hasUpcomingEventAlert}
            />

            {/* 2. Contenu Principal */}
            <main className="flex-1 overflow-y-auto pl-24 pt-30"> 
                
                <div className="p-6 md:p-10 lg:p-12 pt-0"> 
                    
                    {/* Découverte */}
                    {activeTab === "discovery" && (
                        <DiscoveryFeed 
                            events={filteredEvents}
                            onDetailsClick={handleEventDetails}
                            onLikeToggle={handleLikeToggle}
                            onBookmarkToggle={handleBookmarkToggle}
                            navigate={navigate}
                            searchTitle={searchTitle}
                            setSearchTitle={setSearchTitle}
                            searchLocation={searchLocation}
                            setSearchLocation={setSearchLocation}
                            searchDate={searchDate}
                            setSearchDate={setSearchDate}
                        />
                    )}

                 
                    {/* Mes Événements */}
                    {activeTab === "my-event" && (
                        <MyEvent 
                            myEvents={myEvents}
                            onDetailsClick={handleEventDetails}
                            onDeleteClick={handleDeleteEvent}
                            navigate={navigate}
                            userId={user?.id}
                        />
                    )}

                    {/* Messages */}
                    {activeTab === "messages" && (
                        <div>
                            <Messenger />
                        </div>
                    )}

                    {/* Invitations */}
                    {activeTab === "invitations" && (
                        <div>
                            <Invitations 
                                userEmail={user?.email}
                            />
                        </div>
                    )}

                    {/* Activité */}
                    {activeTab === "activity" && (
                        <div>
                            <Feed />
                        </div>
                    )}
                </div>
            </main>

            {/* Modale de Détails */}
            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    onClose={handleCloseModal}
                    onLikeToggle={handleLikeToggle}
                    refetchEvents={() => { refetchMyEvents(); refetchDiscoveryEvents(); }}
                />
            )}
        </div>
    );
}

export default Dashboard;