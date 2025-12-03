import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ⚠️ Important : Leaflet a un problème avec l'affichage par défaut des icônes
// dans un environnement Webpack/React. Ce code corrige l'icône de marqueur.
import L from 'leaflet';

// Correction de l'icône par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const EventMap = ({ events }) => {
    // Coordonnées de centrage initial (ex: Paris)
    const defaultCenter = [48.8566, 2.3522];
    const defaultZoom = 13;

    return (
        <div style={{ height: '500px', width: '100%' }}>
            <MapContainer 
                center={defaultCenter} 
                zoom={defaultZoom} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
            >
                {/* * 🌍 TileLayer : Le fond de carte. 
                  * C'est ici que nous utilisons OpenStreetMap (GRATUIT).
                  * Vous pouvez changer l'URL pour un autre fournisseur de tuiles gratuit si vous le souhaitez.
                */}
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* * 📍 Affichage des Marqueurs d'Événements
                  * Nous itérons sur la liste d'événements fournie par votre API
                */}
                {events.map((event) => {
                    // Vérifiez si l'événement a des coordonnées valides
                    if (event.latitude && event.longitude) {
                        return (
                            <Marker 
                                key={event.id} 
                                position={[event.latitude, event.longitude]}
                            >
                                <Popup>
                                    ### {event.title}
                                    <br />
                                    Lieu: {event.event_location}
                                    <br />
                                    {/* Lien pour l'itinéraire (ou bouton pour ouvrir le service de routage) */}
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Voir l'itinéraire (Google Maps)
                                    </a>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};

export default EventMap;