import React, { useState, useEffect } from 'react';
import { User, Calendar, DollarSign, MessageSquare, Clock, TrendingUp, Zap, Activity, Users, ArrowRight } from 'lucide-react';

const Feed = ({ onNotificationUpdate }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            setCurrentUser({ id: payload.id, name: payload.name });
        } catch (e) {
            console.error("JWT invalide", e);
        }
    }, []);

useEffect(() => {
    const fetchActivities = async () => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            setError("Utilisateur non authentifié");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/activities", {
                headers: { Authorization: `Bearer ${jwt}` },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur ${response.status}`);
            }

            const data = await response.json();

            // S'assurer que activities est bien un tableau
            const activitiesArray = Array.isArray(data)
                ? data
                : Array.isArray(data.activities)
                ? data.activities
                : [];

            setActivities(activitiesArray);
        } catch (err) {
            console.error("Erreur API Feed:", err);
            setError(err.message || "Échec du chargement des activités");
        } finally {
            setLoading(false);
        }
    };

    fetchActivities();
}, []);


    // Mettre à jour les notifications quand les activités changent
    useEffect(() => {
        // Compter les activités non lues (par exemple, les plus récentes du jour)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recentActivitiesCount = activities.filter(activity => {
            try {
                const activityDate = new Date(activity.createdAt);
                return activityDate >= oneDayAgo;
            } catch (e) {
                return false;
            }
        }).length;

        onNotificationUpdate?.(recentActivitiesCount);
    }, [activities, onNotificationUpdate]);

    const getActivityIcon = (action) => {
        if (action.includes("inscrit")) return <User className="w-5 h-5" />;
        if (action.includes("créé l'événement")) return <Calendar className="w-5 h-5" />;
        if (action.includes("payé")) return <DollarSign className="w-5 h-5" />;
        if (action.includes("commenté")) return <MessageSquare className="w-5 h-5" />;
        return <Zap className="w-5 h-5" />;
    };

    const getActivityColors = (action) => {
        if (action.includes("inscrit")) return { bg: "bg-blue-50 border-blue-200", icon: "bg-blue-100 text-blue-600", badge: "bg-blue-100 text-blue-700" };
        if (action.includes("créé l'événement")) return { bg: "bg-emerald-50 border-emerald-200", icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };
        if (action.includes("payé")) return { bg: "bg-amber-50 border-amber-200", icon: "bg-amber-100 text-amber-600", badge: "bg-amber-100 text-amber-700" };
        if (action.includes("commenté")) return { bg: "bg-purple-50 border-purple-200", icon: "bg-purple-100 text-purple-600", badge: "bg-purple-100 text-purple-700" };
        return { bg: "bg-gray-50 border-gray-200", icon: "bg-gray-100 text-gray-600", badge: "bg-gray-100 text-gray-700" };
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Juste maintenant";
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diff = now - date;
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);

            if (minutes < 1) return "À l'instant";
            if (minutes < 60) return `il y a ${minutes}m`;
            if (hours < 24) return `il y a ${hours}h`;
            if (days < 7) return `il y a ${days}j`;
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } catch (e) {
            return "Juste maintenant";
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center p-8 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg max-w-md">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <Activity size={28} className="text-red-600" />
                    </div>
                    <p className="text-red-700 font-bold text-lg mb-1">Erreur de Connexion</p>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4 pt-10">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-2xl h-24" />
                ))}
            </div>
        );
    }

    const stats = [
        { label: "Activités", value: activities.length, icon: Activity, gradient: "from-purple-600 to-blue-600" },
        { label: "Aujourd'hui", value: "12", icon: Calendar, gradient: "from-blue-600 to-cyan-600" },
        { label: "Utilisateurs", value: "342", icon: Users, gradient: "from-emerald-600 to-teal-600" }
    ];

    const markAllRead = async () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    try {
        await fetch("http://localhost:8000/api/activities/mark-all-read", {
            method: "POST",
            headers: { Authorization: `Bearer ${jwt}` }
        });

        // Mettre à jour localement : tout devient "lu"
        const updated = activities.map(a => ({ ...a, isRead: true }));
        setActivities(updated);

        // Réinitialiser les badges
        onNotificationUpdate?.(0);

    } catch (e) {
        console.error("Erreur lors du markAllRead", e);
    }
};


    return (
        <div className="space-y-8 pt-6">
            {/* Header */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                            Flux d'Activité
                        </h1>
                        <p className="text-gray-600 text-base">Restez informé des dernières mises à jour de votre communauté</p>
                    </div>
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                        >
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${stat.gradient} transition-opacity duration-300`}></div>
                            
                            <div className="relative flex items-start justify-between">
                                <div>
                                    <p className="text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-4xl md:text-5xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${stat.gradient} w-0 group-hover:w-full transition-all duration-300`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Titre Section */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 pt-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Activités Récentes</h2>
                    <p className="text-sm text-gray-500">Découvrez ce qui se passe dans votre réseau</p>
                </div>

                <button
                    onClick={markAllRead}
                    className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-pill shadow transition"
                >
                    Marquer tout comme lu
                </button>

                <span className="text-sm text-gray-600 font-semibold px-3 py-1.5 bg-gray-100 rounded-full">
                    {activities.length}
                </span>
            </div>

            {/* Activités Container */}
            {activities.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200 rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center mx-auto mb-4">
                        <Activity size={32} className="text-purple-600" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg">Aucune activité récente</p>
                    <p className="text-gray-600 text-sm mt-2">Les activités apparaîtront ici à mesure que vous interagissez</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity, index) => {
                        const colors = getActivityColors(activity.action);
                        return (
                            <div
                                key={activity.id}
                                className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                }}
                            >
                                <div
                                  className={`relative overflow-hidden border ${colors.bg} 
                                            rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 
                                            cursor-pointer ${!activity.isRead ? "bg-purple-300 border-purple-700 text-white" : "bg-white"}`}
                                                            >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white to-transparent transition-opacity duration-500"></div>
                                    
                                    <div className="relative flex gap-4 items-start">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
                                            {getActivityIcon(activity.action)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex-grow">
                                                    <p className="text-gray-900 text-sm leading-relaxed">
                                                        <span className="font-bold text-gray-900">
                                                            {activity.action}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${colors.badge} transition-all group-hover:shadow-md`}>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatTime(activity.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arrow on hover */}
                                        <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 flex-shrink-0 mt-0.5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Feed;