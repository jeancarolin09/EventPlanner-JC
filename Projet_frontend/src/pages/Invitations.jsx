import React, { useState, useEffect } from "react";
import { useInvitations } from "../hooks/useInvitations";
import PollChoice from "../components/PollChoice";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, HelpCircle, AlertCircle, BarChart3, Map } from "lucide-react";
import MapModal from '../components/MapModal';


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

const Invitations = ({ userEmail, onNotificationUpdate }) => {
  const { invitations, loading, error, setInvitations, reloadInvitations } = useInvitations(userEmail);
  const [pollState, setPollState] = useState({});
  const [mapDetails, setMapDetails] = useState({
    isOpen: false,
    event: null,
  });

  // Mettre à jour les notifications quand les invitations changent
  useEffect(() => {
    const pendingCount = invitations ? invitations.filter(inv => inv.status === 'pending').length : 0;
    onNotificationUpdate?.(pendingCount);
  }, [invitations, onNotificationUpdate]);

  useEffect(() => {
    if (!invitations) return;
    const initialState = {};
    invitations.forEach(inv =>
      inv.event.polls.forEach(poll => {
        initialState[poll.id] = {
          userVote: poll.userVote || null,
          selected: poll.userVote || null,
          isEditing: false,
          isLoading: false,
          error: null,
        };
      })
    );
    setPollState(initialState);
  }, [invitations]);

  const handleSelectOption = (pollId, optionId, cancelEdit = false) => {
    setPollState(prev => ({
      ...prev,
      [pollId]: {
        ...prev[pollId],
        selected: optionId,
        isEditing: cancelEdit ? false : prev[pollId].isEditing
      }
    }));
  };

  const updatePollVotesInInvitations = (eventId, pollId, optionVotesFromResponse, optionId, newUserVote) => {
    setInvitations(prev =>
      prev.map(inv => {
        if (inv.event.id !== eventId) return inv;
        return {
          ...inv,
          event: {
            ...inv.event,
            polls: inv.event.polls.map(poll => {
              if (poll.id !== pollId) return poll;

              let updatedOptions = poll.options.map(opt => {
                if (opt.id === optionId) {
                  return { ...opt, votes: optionVotesFromResponse };
                }
                if (poll.userVote && newUserVote && opt.id === poll.userVote && opt.id !== optionId) {
                  return { ...opt, votes: Math.max(0, (opt.votes ?? 0) - 1) };
                }
                return opt;
              });

              return {
                ...poll,
                options: updatedOptions,
                userVote: newUserVote,
              };
            }),
          },
        };
      })
    );
  };

  const handleVote = async (eventId, pollId, optionId, token) => {
    if (!optionId) return;
    setPollState(prev => ({
      ...prev,
      [pollId]: { ...prev[pollId], isLoading: true, error: null }
    }));

    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8000/api/events/${eventId}/polls/vote/${optionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Invitation-Token": token,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du vote");

      updatePollVotesInInvitations(eventId, pollId, data.option.votes, optionId, optionId);
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], userVote: optionId, selected: optionId, isEditing: false }
      }));
      await reloadInvitations();
    } catch (err) {
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], error: err.message || "Erreur lors du vote" }
      }));
    } finally {
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], isLoading: false }
      }));
    }
  };

  const handleCancelVote = async (eventId, pollId, optionId, token) => {
    setPollState(prev => ({
      ...prev,
      [pollId]: { ...prev[pollId], isLoading: true, error: null }
    }));

    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8000/api/events/${eventId}/polls/unvote/${optionId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Invitation-Token": token,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur annulation");

      updatePollVotesInInvitations(eventId, pollId, data.option.votes, optionId, null);
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], userVote: null, isEditing: false, selected: null }
      }));
      await reloadInvitations();
    } catch (err) {
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], error: err.message || "Erreur lors de l'annulation" }
      }));
    } finally {
      setPollState(prev => ({
        ...prev,
        [pollId]: { ...prev[pollId], isLoading: false }
      }));
    }
  };

  const handleStartChangeVote = (pollId) => {
    setPollState(prev => ({
      ...prev,
      [pollId]: { ...prev[pollId], isEditing: true, error: null }
    }));
  };

  const handleConfirm = async (token, invitationId, status) => {
    try {
      const jwt = localStorage.getItem("jwt");
      const res = await fetch(`http://localhost:8000/api/invitations/${token}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la confirmation");

      setInvitations(prev =>
        prev.map(inv => (inv.id === invitationId ? { ...inv, status } : inv))
      );
    } catch (err) {
      console.error(err);
      alert("❌ " + (err.message || "Erreur lors de la confirmation"));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: <HelpCircle size={16} />, text: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
      accepted: { icon: <CheckCircle size={16} />, text: "Confirmé", color: "bg-green-100 text-green-700 border-green-300" },
      declined: { icon: <XCircle size={16} />, text: "Refusé", color: "bg-red-100 text-red-700 border-red-300" },
      maybe: { icon: <AlertCircle size={16} />, text: "Peut-être", color: "bg-blue-100 text-blue-700 border-blue-300" },
    };
    return badges[status] || badges.pending;
  };

  if (!userEmail) return <p className="text-gray-600">Chargement du profil utilisateur...</p>;

  if (loading) {
    return (
      <div className="space-y-4 pt-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-2xl h-48" />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-600 text-center py-8">⚠️ {error.message || "Erreur"}</p>;

  const now = new Date();

  const activeInvitations = invitations
    ? invitations.filter(inv => {
        const event = inv.event;
        const eventDateSource = event.event_time?.date || event.event_date;

        if (!eventDateSource) return true;

        try {
          const eventDateTime = new Date(eventDateSource);
          return eventDateTime >= now;
        } catch (e) {
          console.error("Erreur de format de date pour l'événement ID:", event.id, e);
          return true;
        }
      })
    : [];

  if (!invitations?.length) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200 rounded-2xl mt-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center mx-auto mb-4">
          <Calendar size={32} className="text-purple-600" />
        </div>
        <p className="text-gray-800 font-semibold text-lg">Aucune invitation pour le moment</p>
        <p className="text-gray-600 text-sm mt-2">Vous recevrez vos invitations ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-10">
      {invitations.map(inv => {
        const event = inv.event;
        const statusBadge = getStatusBadge(inv.status);
        const eventDate = new Date(event.event_date?.date || event.event_date);
        const eventTime = new Date(event.event_time?.date || event.event_time);

        return (
          <div
            key={inv.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
          >
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-purple-600/5 via-blue-600/5 to-pink-600/5 border-b border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
    {/* Profil de l’organisateur */}
    <div className="flex items-center gap-3 mb-3">
      <Avatar 
        user={inv.organizer} 
        src={inv.organizer?.profilePicture} 
        name={inv.organizer?.name} 
        size={10} 
      />
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Organisateur</span>
        <span className="font-semibold text-gray-900">{inv.organizer?.name || "Inconnu"}</span>
      </div>
    </div>

    {/* Titre et description de l'événement */}
    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
    <p className="text-gray-600 text-sm line-clamp-2">{event.description || "Pas de description"}</p>
  </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-semibold text-xs whitespace-nowrap ${statusBadge.color} transition-all`}>
                  {statusBadge.icon}
                  {statusBadge.text}
                </div>
              </div>

              {/* Détails: Date, Heure, Lieu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg hover:bg-white transition">
                  <Calendar size={18} className="text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{eventDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg hover:bg-white transition">
                  <Clock size={18} className="text-pink-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{eventTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-white/60 rounded-lg hover:bg-white transition sm:col-span-2 lg:col-span-1">
                  <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium truncate">{event.event_location || "À déterminer"}</span>
                </div>
                <button
                  onClick={() => setMapDetails({ isOpen: true, event: event })}
                  disabled={!event.latitude || !event.longitude}
                  className="flex items-center justify-center gap-2 p-2.5 bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 disabled:from-gray-100 disabled:to-gray-100 rounded-lg transition text-sm font-semibold text-purple-700 disabled:text-gray-500"
                >
                  <Map size={16} />
                  <span className="hidden sm:inline">Carte</span>
                </button>
              </div>
            </div>

            {/* Corps */}
            <div className="p-6 space-y-5">
              {/* Boutons de confirmation */}
              {inv.status === 'pending' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => handleConfirm(inv.token, inv.id, 'accepted')}
                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-pill transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Accepter
                  </button>
                  <button
                    onClick={() => handleConfirm(inv.token, inv.id, 'maybe')}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-pill transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={18} />
                    Peut-être
                  </button>
                  <button
                    onClick={() => handleConfirm(inv.token, inv.id, 'declined')}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-pill transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-sm flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Refuser
                  </button>
                </div>
              )}

              {/* Sondages */}
              {inv.status === 'accepted' && event.polls?.length > 0 && (
                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                      <BarChart3 size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">Sondages</h4>
                      <p className="text-xs text-gray-500">Votez pour les préférences du groupe</p>
                    </div>
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                      {event.polls.length}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {event.polls.map(poll => (
                      <PollChoice
                        key={poll.id}
                        poll={poll}
                        pollState={pollState[poll.id]}
                        handleVote={handleVote}
                        handleCancelVote={handleCancelVote}
                        handleStartChangeVote={handleStartChangeVote}
                        handleSelectOption={handleSelectOption}
                        invitationToken={inv.token}
                        eventId={event.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Message pour invitation refusée */}
              {inv.status === 'declined' && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 font-medium text-sm">Vous avez refusé cette invitation. Contactez l'organisateur pour confirmer.</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Modale de carte */}
      {mapDetails.isOpen && mapDetails.event && (
        <MapModal
          latitude={mapDetails.event.latitude}
          longitude={mapDetails.event.longitude}
          locationName={mapDetails.event.event_location}
          onClose={() => setMapDetails({ isOpen: false, event: null })}
        />
      )}
    </div>
  );
};

export default Invitations;