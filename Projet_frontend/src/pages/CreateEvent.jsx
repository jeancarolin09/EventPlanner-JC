import React, { useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
    ArrowLeft, Calendar, Clock, MapPin, Send, Loader, 
    AlertCircle, CheckCircle, Upload 
} from "lucide-react";
import MapPicker from '../components/MapPicker';

const CreateEvent = () => {

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        latitude: 0,  // ⬅️ NOUVEAU
        longitude: 0, // ⬅️ NOUVEAU
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Le fichier sélectionné doit être une image.");
            return;
        }

        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };
    const handleMapLocationChange = (lat, lng) => {
        const newLat = parseFloat(lat);
       const newLng = parseFloat(lng);

        setFormData(prevData => ({
            ...prevData,
        latitude: isNaN(newLat) ? 0 : newLat,
        longitude: isNaN(newLng) ? 0 : newLng,
        }));
    };

    const handleSubmit = async () => {

        if (!formData.title || !formData.date || !formData.time) {
            setError("Veuillez remplir tous les champs obligatoires (*)");
            return;
        }
        
        if (!formData.latitude || !formData.longitude) {
            setError("Veuillez sélectionner un lieu sur la carte.");
            return;
        }

        const token = localStorage.getItem('jwt');
        if (!token) {
            setError("Utilisateur non authentifié. Veuillez vous reconnecter.");
            return;
        }

        const eventDateTime = new Date(`${formData.date}T${formData.time}`);
        if (eventDateTime < new Date()) {
            setError("L'événement ne peut pas être créé dans le passé.");
            return;
        }

        setLoading(true);
        setError('');

        try {
            // ⭐ IMPORTANT : utilisation de FormData pour envoyer un fichier
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("event_date", formData.date);
            data.append("event_time", formData.time);
            data.append("event_location", formData.location);
            data.append("latitude", formData.latitude);
            data.append("longitude", formData.longitude);

            if (imageFile) {
                data.append("image", imageFile);
            }

            await axios.post(
                "http://localhost:8000/api/events",
                data,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    }
                }
            );

            setSuccess("Événement créé avec succès ! ✨");
            queryClient.invalidateQueries({ queryKey: ["events"] });

            setTimeout(() => {
                setFormData({ title: "", description: "", date: "", time: "", location: "",latitude: 0, longitude: 0,});
                setImageFile(null);
                setImagePreview(null);
                navigate('/dashboard');
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la création de l'événement.");
        }

        setLoading(false);
    };

    return (
        <main className="flex-1 overflow-y-auto pl-24 pt-30"> 
        <div className="min-h-screen bg-transparent p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full">

                {/* BOUTON RETOUR */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-purple-400 font-semibold mb-8 hover:text-purple-300 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Retour au Dashboard
                </button>

                 {/* TITRE */}
                        <div className="mb-10">
                            <h1 className="text-5xl font-extrabold mb-3 text-gray-900">
                                <span className="bg-gradient-to-r from-purple-600 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                                    Créer un Événement
                                </span>
                            </h1>
                            <p className="text-gray-600 text-lg">Organisez votre prochain événement en quelques clics</p>
                        </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 space-y-8">

                    {/* ERREUR */}
                    {error && (
                        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <p className="text-green-500">{success}</p>
                        </div>
                    )}

                    {/* TITRE */}
                    <div className="space-y-3">
                        <label className="text-gray-800 font-semibold">
                            Titre <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-black"
                        />
                    </div>

                    {/* IMAGE UPLOAD */}
                    <div className="space-y-3">
                        <label className="text-gray-800 font-semibold">
                            Image de couverture (Optionnel)
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/10 border border-white/10 rounded-xl text-white hover:bg-white/20"
                        >
                            <Upload size={20} className="text-purple-600" />
                            {imageFile ? imageFile.name : "Sélectionner une image"}
                        </button>

                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="mt-4 max-h-56 rounded-lg border border-white/20"
                            />
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-3">
                        <label className="text-gray-800 font-semibold">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-black resize-none"
                            rows={5}
                        />
                    </div>

                    {/* DATE ET HEURE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-gray-800 font-semibold">
                                Date <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-black"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-gray-800 font-semibold">
                                Heure <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-black"
                            />
                        </div>
                    </div>

                    {/* LIEU */}
                    <div className="space-y-3">
                        <label className="text-gray-800 font-semibold">Lieu</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl text-black"
                        />
                    </div>

                    {/* 🗺️ CARTE DE SÉLECTION DU LIEU */}
                    <div className="space-y-3">
                    <label className="text-gray-800 font-semibold flex items-center gap-2">
                        <MapPin size={20} className="text-pink-400"/>
                        Position sur la Carte <span className="text-red-400">*</span>
                        {formData.latitude && (
                            <span className="text-sm text-gray-400 font-normal">
                                (Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)})
                            </span>
                        )}
                    </label>
        
                    <MapPicker 
                        onLocationChange={handleMapLocationChange}
                        // Ces valeurs ne sont pas nécessaires pour la création, 
                        // mais utiles si vous aviez une carte de modification.
                        initialLatitude={formData.latitude} 
                        initialLongitude={formData.longitude}
                    />
                    <p className="text-xs text-gray-500 pt-2">
                        Cliquez sur la carte ou faites glisser le marqueur pour définir la position exacte de l'événement.
                    </p>
                </div>

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-pill font-bold text-lg
                            ${loading ? "bg-gray-700 text-gray-400" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"}`
                        }
                    >
                        {loading ? (
                            <>
                                <Loader size={22} className="animate-spin" />
                                Création...
                            </>
                        ) : (
                            <>
                                <Send size={22} />
                                Créer l'Événement
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    </main>
    );
};

export default CreateEvent;
