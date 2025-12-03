// PollChoice.jsx
import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

// Fonctions utilitaires du PollSystem original
const getPercentage = (votes, total) => {
  return total === 0 ? 0 : Math.round((votes / total) * 100);
};

const getColor = (percentage) => {
  if (percentage >= 40) return 'bg-gradient-to-r from-blue-500 to-blue-600';
  if (percentage >= 25) return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
  if (percentage >= 10) return 'bg-gradient-to-r from-amber-500 to-amber-600';
  return 'bg-gradient-to-r from-slate-400 to-slate-500';
};

/**
 * Affiche et gère l'interaction d'un seul sondage.
 *
 * @param {object} props
 * @param {object} props.poll - Le sondage à afficher (inclut question, options, etc.).
 * @param {object} props.pollState - L'état de vote local pour ce sondage (userVote, selected, isEditing, isLoading).
 * @param {function} props.handleVote - Fonction pour voter.
 * @param {function} props.handleCancelVote - Fonction pour annuler le vote.
 * @param {function} props.handleStartChangeVote - Fonction pour passer en mode édition.
 * @param {function} props.handleSelectOption - Fonction pour sélectionner une option en mode édition/vote initial.
 * @param {string} props.invitationToken - Le token de l'invitation pour l'API.
 * @param {number} props.eventId - L'ID de l'événement.
 */
export default function PollChoice({
  poll,
  pollState,
  handleVote,
  handleCancelVote,
  handleStartChangeVote,
  handleSelectOption,
  invitationToken,
  eventId
}) {
  const { userVote, selected, isEditing, isLoading } = pollState || {};

  // Calculer le total des votes basé sur les options réelles
  const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes ?? 0), 0);
  
  // Le vote actuel à annuler ou à modifier (c'est l'ID de l'option)
  const optionToCancel = poll.options.find(opt => opt.id === userVote);

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex-1">{poll.question}</h2>
        
        {/* Bouton Annuler le vote (seulement si un vote est déjà fait et n'est pas en édition) */}
        {userVote && !isEditing && (
          <button
            onClick={() => handleCancelVote(eventId, poll.id, optionToCancel.id, invitationToken)}
            disabled={isLoading}
            className="ml-3 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium flex items-center gap-1 disabled:opacity-50"
            title="Annuler votre vote"
          >
            <X size={16} />
            {isLoading ? "Annul. en cours" : "Annuler"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {poll.options.map(option => {
          const percentage = getPercentage(option.votes ?? 0, totalVotes);
          const isVoted = userVote === option.id;
          const isSelected = selected === option.id;
          const isDisabled = userVote && !isEditing; // Désactiver si déjà voté et pas en édition

          return (
            <button
              key={option.id}
              // Si déjà voté, on ne peut interagir qu'en mode édition
              onClick={() => !isDisabled && handleSelectOption(poll.id, option.id)}
              disabled={isDisabled && !isEditing}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isVoted || (isSelected && isEditing)
                  ? 'ring-2 ring-blue-500/80'
                  : 'hover:ring-1 hover:ring-slate-600'
              } ${isDisabled && !isEditing ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div className="relative bg-slate-700/30 p-4 flex items-center gap-4">
                {/* Barre de progression */}
                <div
                  className={`absolute inset-0 ${getColor(percentage)} opacity-20 transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />

                {/* Contenu */}
                <div className="relative flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Indicateur de vote actuel */}
                    {isVoted && !isEditing && <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0" />}
                    
                    {/* Indicateur de sélection en mode édition */}
                    {isSelected && isEditing && <CheckCircle2 size={20} className="text-yellow-400 flex-shrink-0" />}
                    
                    <span className="text-slate-100 font-medium text-left">{option.text}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-slate-300">
                      {percentage}%
                    </span>
                    <span className="text-xs text-slate-400">
                      {option.votes ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''} au total
        </p>

        {/* Boutons d'action pour le vote */}
        {userVote ? (
          <div className="flex gap-2">
             {/* État : Voté, prêt à éditer */}
            {!isEditing && (
                <button
                onClick={() => handleStartChangeVote(poll.id)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20 disabled:opacity-50 transition-colors"
                >
                    Changer mon vote
                </button>
            )}

            {/* État : En édition */}
            {isEditing && (
              <>
                <button
                    onClick={() => handleVote(eventId, poll.id, selected, invitationToken)}
                    disabled={!selected || isLoading || selected === userVote} // Désactiver si pas de sélection ou si la sélection n'a pas changé
                    className="px-3 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-xs disabled:opacity-50 transition-colors"
                >
                    {isLoading ? "En cours..." : "Confirmer le changement"}
                </button>
                <button
                    onClick={() => handleSelectOption(poll.id, userVote, true)} // Annuler l'édition
                    disabled={isLoading}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 text-xs disabled:opacity-50 transition-colors"
                >
                    Annuler
                </button>
              </>
            )}
            
            {!isEditing && (
                 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium">
                    <CheckCircle2 size={14} />
                    Vous avez voté
                </span>
            )}
          </div>
        ) : (
             <button
                onClick={() => handleVote(eventId, poll.id, selected, invitationToken)}
                disabled={!selected || isLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-xs disabled:opacity-50 transition-colors"
            >
                {isLoading ? "Vote en cours..." : "Valider mon vote"}
            </button>
        )}
      </div>

       {/* Message d'erreur */}
      {pollState?.error && (
        <p className="text-red-500 text-xs mt-3">{pollState.error}</p>
      )}
    </div>
  );
}