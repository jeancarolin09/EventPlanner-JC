import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertCircle } from "lucide-react";

// Fix pour l'icône Leaflet par défaut (réutilisons la même correction que dans MapPicker)
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const EventMapDisplay = ({ latitude, longitude, locationName }) => {
    // Vérification essentielle
    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex items-center gap-3">
                <AlertCircle size={20} />
                <p>Aucune coordonnée GPS n'a été enregistrée pour cet événement.</p>
            </div>
        );
    }

    const position = [latitude, longitude];
    const zoom = 15; // Un zoom plus proche pour l'affichage des détails

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">🗺️ Localisation sur la carte</h3>
            <div style={{ height: '350px', width: '100%' }}>
                <MapContainer
                    center={position}
                    zoom={zoom}
                    scrollWheelZoom={false} // Désactiver le zoom par défilement pour un meilleur UX sur les petits écrans
                    style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={position}>
                        <Popup>
                            **{locationName || "Lieu de l'événement"}**<br />
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 font-semibold"
                            >
                                Voir sur Google Maps
                            </a>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
};

export default EventMapDisplay;