import React, { useState } from "react";
import axios from "axios";
import { UserPlus, Trash2, Loader, Mail, User, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const Guests = ({ event, setEvent }) => {
    const [newGuest, setNewGuest] = useState({ name: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [guestError, setGuestError] = useState("");

    const getStatusStyle = (status) => {
        switch(status) {
            case "accepted": return { icon: CheckCircle, text: "Présent", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
            case "declined": return { icon: XCircle, text: "Absent", color: "bg-red-100 text-red-700 border-red-300" };
            case "maybe": return { icon: Clock, text: "Peut-être", color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
            default: return { icon: AlertCircle, text: "En attente", color: "bg-gray-100 text-gray-700 border-gray-300" };
        }
    };

    const handleAddGuest = async () => {
        if (!newGuest.email.trim()) {
            setGuestError("L'email est obligatoire");
            return;
        }

        setLoading(true);
        setGuestError("");

        try {
            const token = localStorage.getItem("jwt");
            const response = await axios.post(
                `http://localhost:8000/api/invitations/send`,
                {eventID: event.id, name: newGuest.name.trim(), email: newGuest.email.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const addedGuest = response.data.invitation;
            const safeGuest = { ...addedGuest, id: addedGuest.id || Date.now() };

            setEvent((prev) => ({
                ...prev,
                guests: [...(prev.guests || []), safeGuest],
            }));

            setNewGuest({ name: "", email: "" });
        } catch (err) {
            console.error("Erreur ajout invité:", err);
            setGuestError(err.response?.data?.message || "Erreur lors de l'ajout de l'invité");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGuest = async (guestId) => {
        if (!guestId) return;
        if (!window.confirm("Voulez-vous vraiment supprimer cet invité ?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            await axios.delete(
                `http://localhost:8000/api/events/${event.id}/guests/${guestId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEvent((prev) => ({
                ...prev,
                guests: prev.guests.filter((g) => g.id !== guestId),
            }));
        } catch (err) {
            console.error("Erreur lors de la suppression", err);
            alert("Une erreur est survenue lors de la suppression de l'invité.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* --- FORMULAIRE D'AJOUT --- */}
            <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl">
                <h3 className="font-bold mb-4 text-base text-gray-900 flex items-center gap-2">
                    <UserPlus size={18} className="text-purple-600" />
                    Ajouter un invité
                </h3>
                
                {guestError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{guestError}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <User size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="  Nom (Optionnel)"
                            name="name"
                            value={newGuest.name}
                            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                            className="w-full px-4 pl-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                        />
                    </div>
                    
                    <div className="flex-1 relative">
                        <Mail size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="email"
                            placeholder="  Email *"
                            name="email"
                            value={newGuest.email}
                            onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                            className="w-full px-4 pl-10 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                        />
                    </div>
                    
                    <button
                        onClick={handleAddGuest}
                        disabled={loading || !event?.id}
                        className={`px-4 py-2.5 font-semibold rounded-pill transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm ${
                            loading 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Ajout...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} />
                                <span>Ajouter</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* --- LISTE DES INVITÉS --- */}
            <div>
                <h3 className="font-bold mb-3 text-base text-gray-900">
                    Liste des invités ({event.guests?.length || 0})
                </h3>
                
                {event.guests && event.guests.length > 0 ? (
                    <div className="space-y-2">
                        {event.guests.map((guest) => {
                            const { icon: StatusIcon, text, color } = getStatusStyle(guest.status);
                            return (
                                <div 
                                    key={guest.id || guest.email}
                                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs">
                                            {guest.name ? guest.name.charAt(0).toUpperCase() : guest.email?.charAt(0).toUpperCase()}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{guest.name || "—"}</p>
                                            <p className="text-xs text-gray-500 truncate">{guest.email || "—"}</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-semibold text-xs whitespace-nowrap mx-2 ${color}`}>
                                        <StatusIcon size={13} />
                                        {text}
                                    </div>

                                    <button
                                        onClick={() => handleDeleteGuest(guest.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-pill transition-all opacity-100 group-hover:opacity-100"
                                        disabled={loading}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <UserPlus size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium text-sm">Aucun invité</p>
                        <p className="text-gray-500 text-xs mt-1">Ajoutez des invités ci-dessus</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Guests;