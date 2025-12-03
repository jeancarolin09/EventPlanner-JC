import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, BarChart2, Edit, Save, Trash2, Loader, HelpCircle, AlertCircle } from "lucide-react";

const Polls = ({ event, setEvent }) => {
    const [newPoll, setNewPoll] = useState({ question: "", options: [""] });
    const [editingPollId, setEditingPollId] = useState(null);
    const [editedPoll, setEditedPoll] = useState({ question: "", options: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("jwt");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    useEffect(() => {
        if (!event.id) return;

        const fetchPolls = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/events/${event.id}/polls`, { headers });
                setEvent((prev) => ({ ...prev, polls: response.data || [] }));
            } catch (err) {
                console.error("Erreur lors du chargement des sondages", err);
            }
        };

        fetchPolls();
    }, [event.id, setEvent]);

    const calculateVotePercentage = (options) => {
        if (!options || options.length === 0) return [];
        const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        return options.map(opt => ({
            ...opt,
            percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
            totalVotes: totalVotes
        }));
    };

    const handleAddPoll = async () => {
        const trimmedOptions = newPoll.options.map(opt => opt.trim()).filter(opt => opt.length > 0);
        
        if (!newPoll.question.trim() || trimmedOptions.length < 1) {
            setError("Veuillez remplir la question et au moins une option valide.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const pollData = { question: newPoll.question.trim(), options: trimmedOptions };
            
            const response = await axios.post(
                `http://localhost:8000/api/events/${event.id}/polls`,
                pollData,
                { headers }
            );
            
            setEvent((prev) => ({ ...prev, polls: [...(prev.polls || []), response.data] }));
            setNewPoll({ question: "", options: [""] });
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la création du sondage");
        } finally {
            setLoading(false);
        }
    };

    const handleOptionChange = (index, value, edit = false) => {
        const state = edit ? editedPoll : newPoll;
        const setter = edit ? setEditedPoll : setNewPoll;
        
        const updated = [...state.options];
        updated[index] = value;
        setter({ ...state, options: updated });
    };

    const handleAddOption = (edit = false) => {
        const state = edit ? editedPoll : newPoll;
        const setter = edit ? setEditedPoll : setNewPoll;
        
        if (state.options[state.options.length - 1]?.trim() !== "" || state.options.length === 0) {
             setter((prev) => ({ ...prev, options: [...prev.options, ""] }));
        } else {
            setError("Veuillez remplir l'option actuelle avant d'en ajouter une autre.");
        }
    };

    const handleRemoveOption = (index, edit = false) => {
        const state = edit ? editedPoll : newPoll;
        const setter = edit ? setEditedPoll : setNewPoll;
        
        if (state.options.length <= 1) {
            setError("Un sondage doit avoir au moins une option.");
            return;
        }

        setter((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));
        setError("");
    };

    const handleDeletePoll = async (pollId) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce sondage ?")) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8000/api/events/${event.id}/polls/${pollId}`, { headers });
            setEvent((prev) => ({ ...prev, polls: prev.polls.filter((p) => p.id !== pollId) }));
        } catch (err) {
            console.error("Erreur lors de la suppression", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditPoll = (poll) => {
        setEditingPollId(poll.id);
        setEditedPoll({
            question: poll.question,
            options: poll.options.map((o) => o.text), 
        });
        setError("");
    };

    const handleUpdatePoll = async (pollId) => {
        const trimmedOptions = editedPoll.options.map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (!editedPoll.question.trim() || trimmedOptions.length < 1) {
            setError("Veuillez remplir la question et au moins une option valide.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await axios.put(
                `http://localhost:8000/api/events/${event.id}/polls/${pollId}`,
                { question: editedPoll.question, options: trimmedOptions },
                { headers }
            );

            setEvent((prev) => ({
                ...prev,
                polls: prev.polls.map((p) => (p.id === pollId ? response.data : p)),
            }));

            setEditingPollId(null);
        } catch (err) {
            console.error("Erreur lors de la mise à jour du sondage", err);
            setError(err.response?.data?.message || "Erreur lors de la mise à jour du sondage.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* --- Formulaire de Création --- */}
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold mb-4 text-base text-gray-900 flex items-center gap-2">
                    <BarChart2 size={18} className="text-blue-600" />
                    Créer un nouveau sondage
                </h3>
                
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Votre question *"
                        value={newPoll.question}
                        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    />
                </div>

                <div className="space-y-2 mb-3">
                    {newPoll.options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={opt}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            />
                            {newPoll.options.length > 1 && (
                                <button
                                    onClick={() => handleRemoveOption(index)}
                                    className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                                    disabled={newPoll.options.length === 1}
                                    title="Supprimer"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => handleAddOption()} 
                        className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-pill transition-all flex items-center gap-2 border border-gray-300 text-sm"
                    >
                        <Plus size={16} /> Option
                    </button>
                    <button
                        onClick={handleAddPoll}
                        disabled={loading}
                        className={`px-4 py-2 font-semibold rounded-pill transition-all flex items-center gap-2 text-sm ${
                            loading 
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {loading ? <Loader size={16} className="animate-spin" /> : <BarChart2 size={16} />}
                        {loading ? "..." : "Créer"}
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg mt-3">
                        <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-700 text-xs">{error}</p>
                    </div>
                )}
            </div>

            {/* --- Liste des Sondages --- */}
            <div>
                <h3 className="font-bold mb-3 text-base text-gray-900">
                    Sondages ({event.polls?.length || 0})
                </h3>

                {event.polls && event.polls.length > 0 ? (
                    <div className="space-y-3">
                        {event.polls.map((poll) => {
                            const optionsWithPercentage = calculateVotePercentage(poll.options);
                            return (
                                <div key={poll.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                                    {editingPollId === poll.id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editedPoll.question}
                                                onChange={(e) => setEditedPoll({ ...editedPoll, question: e.target.value })}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                            />
                                            <div className="space-y-2">
                                                {editedPoll.options.map((opt, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(i, e.target.value, true)}
                                                            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveOption(i, true)}
                                                            className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all"
                                                            disabled={editedPoll.options.length === 1}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button 
                                                onClick={() => handleAddOption(true)} 
                                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-pill transition-all flex items-center gap-2 text-xs"
                                            >
                                                <Plus size={14} /> Ajouter option
                                            </button>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleUpdatePoll(poll.id)}
                                                    className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-pill transition-all flex items-center justify-center gap-1.5 text-xs"
                                                >
                                                    <Save size={14} /> Enregistrer
                                                </button>
                                                <button
                                                    onClick={() => setEditingPollId(null)}
                                                    className="flex-1 px-3 py-1.5 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-pill transition-all flex items-center justify-center gap-1.5 text-xs"
                                                >
                                                    <X size={14} /> Annuler
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="font-semibold text-gray-900 mb-3 text-sm">{poll.question}</h4>
                                            
                                            <div className="space-y-2 mb-3">
                                                {optionsWithPercentage.map((opt, j) => (
                                                    <div key={opt.id || j} className="space-y-1">
                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="font-medium text-gray-700">{opt.text}</span>
                                                            <span className="font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{opt.percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div 
                                                                className="h-2 rounded-full bg-blue-500 transition-all duration-500" 
                                                                style={{ width: `${opt.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{opt.votes || 0} vote{opt.votes !== 1 ? 's' : ''}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2 pt-2 border-t border-gray-200">
                                                <button
                                                    onClick={() => handleEditPoll(poll)}
                                                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-pill transition-all flex items-center justify-center gap-1 text-xs"
                                                >
                                                    <Edit size={14} /> Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePoll(poll.id)}
                                                    className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-pill transition-all flex items-center justify-center gap-1 text-xs"
                                                >
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
                        <BarChart2 size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium text-sm">Aucun sondage</p>
                        <p className="text-gray-500 text-xs mt-1">Créez un sondage ci-dessus</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Polls;