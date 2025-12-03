import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Edit, Save, X, Info, Users, BarChart2, Calendar, Clock, MapPin, CheckCircle, Loader, AlertCircle } from "lucide-react";
import Guests from "../components/Guests";
import Polls from "../components/Polls";
import MapPicker from '../components/MapPicker';        
import EventMapDisplay from '../components/EventMapDisplay';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [activeTab, setActiveTab] = useState("informations");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [formData, setFormData] = useState({ title: "", description: "", event_date: "", event_time: "", event_location: "",latitude: null, longitude: null, });

    const fetchEvent = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("jwt");
            if (!token) throw new Error("Utilisateur non authentifié");

            const response = await axios.get(`http://localhost:8000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            });

            const data = response.data;
            const rawTimeData = data.event_time && data.event_time.date ? data.event_time.date : data.event_time || '';
            const dateOnly = data.event_date ? data.event_date.split('T')[0] : '';
            
            let timeOnly = '';
            if (rawTimeData) {
                const dateObj = new Date(rawTimeData.replace(" ", "T")); 
                if (!isNaN(dateObj.getTime())) { 
                    timeOnly = dateObj.toTimeString().substring(0, 5);
                }
            }

            setEvent({
                ...data,
                guests: data.guests || [],
                polls: data.polls || [],
                latitude: data.latitude || null,   
                longitude: data.longitude || null,
            });

            setFormData({
                title: data.title || "",
                description: data.description || "",
                event_date: dateOnly,
                event_time: timeOnly,
                event_location: data.event_location || "",
                latitude: data.latitude || null,   // ⬅️ Initialisation
                longitude: data.longitude || null, // ⬅️ Initialisation
            });
        } catch (err) {
            console.error("Erreur de fetch:", err);
            setError("Événement introuvable ou erreur réseau");
        } finally {
            setLoading(false);
        }
    }, [id]);

    // 📍 Nouvelle fonction pour mettre à jour les coordonnées en mode édition
    const handleMapLocationChange = (lat, lng) => {
        setFormData(prevData => ({
            ...prevData,
            latitude: lat,
            longitude: lng,
        }));
    };

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-medium">Chargement de l'événement...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 pt-10">
                <div className="text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-md max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || "Événement introuvable 😢"}</h2>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all w-full"
                    >
                        <ArrowLeft size={20} /> Retour au Dashboard
                    </button>
                </div>
            </div>
        );
    }
    const getEventImage = (event) => event?.image ? `http://localhost:8000/${event.image}` : "https://via.placeholder.com/600x400?text=Event";


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        try {
           const token = localStorage.getItem("jwt");
            
            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                // S'assurer que les valeurs nulles (lat/lng) sont bien gérées si nécessaire
                if (value !== null) {
                    payload.append(key, value);
                }
            });

            if (newImage) {
                payload.append("image", newImage);
            }
            // Si vous souhaitez indiquer au backend que c'est une mise à jour
            payload.append("_method", "PUT"); 

            await axios.post(`http://localhost:8000/api/events/${id}`, payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // Ne pas spécifier Content-Type ici pour que FormData le gère correctement
                },
            });
            
            await fetchEvent(); 
            setEditing(false);
            setNewImage(null);
            alert("Événement mis à jour avec succès ✅");
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la mise à jour de l'événement ❌");
        }
    };

    const confirmedGuestsCount = Array.isArray(event.guests) ? event.guests.filter(g => g.status === 'accepted').length : 0;
    
    const getTabIcon = (tab) => {
        switch (tab) {
            case "informations": return Info;
            case "invites": return Users;
            case "sondages": return BarChart2;
            default: return Info;
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "informations":
                if (editing) {
                    return (
                        <div className="space-y-6">

                             <div className="space-y-3">
                                <label className="block font-semibold text-gray-700">Image de l’événement</label>
                                <img 
                                    src={newImage ? URL.createObjectURL(newImage) : getEventImage(event)}
                                    alt="preview"
                                    className="m-full h-90 object-cover rounded-lg border"
                                />
                                <input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files[0])} />
                            </div>

                            <div className="space-y-3">
                                <label className="block font-semibold text-gray-700">Titre</label>
                                <input 
                                    type="text"
                                    name="title"
                                    value={formData.title} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block font-semibold text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block font-semibold text-gray-700">Date</label>
                                    <input 
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block font-semibold text-gray-700">Heure</label>
                                    <input 
                                        type="time"
                                        name="event_time"
                                        value={formData.event_time} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block font-semibold text-gray-700">Lieu</label>
                                <input 
                                    type="text"
                                    name="event_location"
                                    value={formData.event_location} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>

                            {/* 🗺️ SÉLECTEUR DE CARTE EN MODE ÉDITION */}
                            <div className="space-y-3 pt-4">
                                <label className="block font-semibold text-gray-700">Position sur la Carte</label>
                                <MapPicker
                                    onLocationChange={handleMapLocationChange}
                                    initialLatitude={event.latitude}
                                    initialLongitude={event.longitude}
                                />
                                <p className="text-sm text-gray-500">
                                    Faites glisser le marqueur pour ajuster les coordonnées.
                                </p>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-pill transition-all"
                                >
                                    <Save size={20} /> Enregistrer
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-pill transition-all"
                                >
                                    <X size={20} /> Annuler
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8">
                        <div className="mb-6">
                            <img src={getEventImage(event)} alt="event" className="m-full h-90 object-cover rounded-lg " />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard 
                                icon={Calendar} 
                                label="Date" 
                                value={event.event_date ? new Date(event.event_date).toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Non précisée"} 
                                color="purple" 
                            />
                            <InfoCard 
                                icon={Clock} 
                                label="Heure" 
                                value={event.event_time ? (() => {
                                    const timeString = typeof event.event_time === "string" ? event.event_time : event.event_time.date ?? "";
                                    const formatted = timeString.replace(" ", "T");
                                    const dateObj = new Date(formatted);
                                    return isNaN(dateObj.getTime())
                                        ? "Non précisée"
                                        : dateObj.toLocaleTimeString("fr-FR", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          });
                                })()
                                : "Non précisée"
                                }
                                color="pink"
                            />
                            <InfoCard icon={MapPin} label="Lieu" value={event.event_location || "Non précisé"} color="blue" />
                            <InfoCard icon={CheckCircle} label="Participants Confirmés" value={confirmedGuestsCount} color="emerald" />
                        </div>
                        
                        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">📝 Description</h3>
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{event.description || "Aucune description fournie."}</p>
                        </div>
                        
                        {/* 🗺️ AFFICHAGE DE LA CARTE EN MODE LECTURE */}
                        <EventMapDisplay
                            latitude={event.latitude}
                            longitude={event.longitude}
                            locationName={event.event_location}
                        />

                        <button
                            onClick={() => setEditing(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-pill transition-all hover:shadow-lg"
                        >
                            <Edit size={20} /> Modifier l'événement
                        </button>
                    </div>
                );

            case "invites":
                return <Guests event={event} setEvent={setEvent} />;

            case "sondages":
                return <Polls event={event} setEvent={setEvent} />;

            default:
                return null;
        }
    };

    const InfoCard = ({ icon: Icon, label, value, color }) => {
        const colorStyles = {
            purple: "bg-purple-100 text-purple-600",
            pink: "bg-pink-100 text-pink-600",
            blue: "bg-blue-100 text-blue-600",
            emerald: "bg-emerald-100 text-emerald-600"
        };

        return (
            <div className="p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">{label}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="flex-1 overflow-y-auto pl-24 pt-30"> 
        <div className="min-h-screen bg-transparent p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="mb-8 flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors font-semibold"
                >
                    <ArrowLeft size={20} /> Retour au Dashboard
                </button>

                <div className="mb-10">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-3">
                        {event.title}
                    </h1>
                    <p className="text-gray-600 text-lg">Gérez les détails de votre événement</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-200">
                    {["informations", "invites", "sondages"].map((tab) => {
                        const Icon = getTabIcon(tab);
                        const isCurrent = activeTab === tab;
                        const tabLabel = tab === "invites" ? "Invités" : tab.charAt(0).toUpperCase() + tab.slice(1);
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-pill font-semibold transition-all ${
                                    isCurrent 
                                        ? "bg-purple-100 text-purple-700 border border-purple-300" 
                                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                            >
                                <Icon size={18} />
                                {tabLabel}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 md:p-10">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    </main>
    );
};

export default EventDetails;