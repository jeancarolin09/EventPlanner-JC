import React from 'react';
import { X, MapPin } from 'lucide-react';

const MapModal = ({ latitude, longitude, locationName, onClose }) => {
    
    // Fallback : Si les coordonnées ne sont pas fournies, on utilise un emplacement par défaut (Paris)
    const lat = latitude || 48.8566; 
    const lng = longitude || 2.3522;
    const name = locationName || "Position non spécifiée";

    // URL pour l'iframe de Google Maps
    // Nous utilisons le mode 'embed' avec un marqueur 't' pour la position exacte.
   const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-lg bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl md:max-w-3xl overflow-hidden relative">
                
                {/* Bouton de Fermeture */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition"
                >
                    <X size={24} />
                </button>

                {/* En-tête de la modale */}
                <div className="p-4 border-b flex items-center gap-2">
                    <MapPin size={24} className="text-purple-600"/>
                    <h3 className="text-xl font-bold text-gray-800">Localisation de l'événement</h3>
                </div>

                {/* Corps de la carte */}
                <div className="w-full h-[50vh]">
                    <iframe
                        src={mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Localisation de l'événement"
                    ></iframe>
                </div>
                
                {/* Pied de page */}
                <div className="p-4 bg-gray-50 text-center text-sm text-gray-700">
                    <p>
                        **{name}**
                        <br/>
                        Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MapModal;