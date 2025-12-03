import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader } from 'lucide-react';

// Fix pour l'icône Leaflet par défaut
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

// --- Composant interne pour gérer la logique du marqueur mobile ---
const DraggableMarker = ({ onLocationChange, initialPosition }) => {
    // const initialLat = parseFloat(initialPosition[0]) || 48.8566;
    // const initialLng = parseFloat(initialPosition[1]) || 2.3522;
   
    const [position, setPosition] = useState(initialPosition);
    const markerRef = useRef(null);
    const map = useMap();
    // // Mettre à jour la position si l'initialPosition change (ex: chargement)
    useEffect(() => {
       const lat = parseFloat(initialPosition[0]);
        const lng = parseFloat(initialPosition[1]);

        if (!isNaN(lat) && !isNaN(lng)) {  
            // Mise à jour de l'état interne pour placer le marqueur
            setPosition([lat, lng]); 
            
            // Forcer le centre de la carte sur la nouvelle position (si elle a changé)
            map.setView([lat, lng], map.getZoom());
        }
      }, []);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const latlng = marker.getLatLng();
                    const newLat = latlng.lat; // Laisser en nombre ici
                    const newLng = latlng.lng; // Laisser en nombre ici
                    setPosition([newLat, newLng]);
                    // Renvoyer les nouvelles coordonnées au parent
                    onLocationChange(newLat.toFixed(8), newLng.toFixed(8));
                }
            },
        }),
        [onLocationChange],
    );

    // Gère le clic sur la carte pour déplacer le marqueur
    useMapEvents({
        click(e) {
            const newLat = e.latlng.lat;
            const newLng = e.latlng.lng;
            
            setPosition([newLat, newLng]);
            // ⭐ Correction 2 : Renvoyer des chaînes formatées au parent
            onLocationChange(newLat.toFixed(8), newLng.toFixed(8)); 
        },
    });

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}>
            <Popup>
                Position de l'événement :<br />
                Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
            </Popup>
        </Marker>
    );
}

// --- Composant principal MapPicker ---
const MapPicker = ({ onLocationChange, initialLatitude, initialLongitude }) => {
    // Si des coordonnées initiales existent, utilisez-les, sinon utilisez une position par défaut (ex: Paris)
    // Position de repli (Paris)
    const DEFAULT_POSITION = [48.8566, 2.3522];

    // Vérifie si l'événement a déjà des coordonnées (mode édition)
    const hasInitialCoords = initialLatitude && initialLongitude;

    // Définir la position initiale (événement existant OU Paris par défaut)
    const initialCoords = hasInitialCoords 
        ? [parseFloat(initialLatitude), parseFloat(initialLongitude)] 
        : DEFAULT_POSITION;

    // État pour la position effective de la carte/marqueur
    const [currentPosition, setCurrentPosition] = useState(initialCoords);
    const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(!hasInitialCoords); // Charge si c'est une création

    
    // ⭐ LOGIQUE DE GÉOLOCALISATION
    useEffect(() => {
        // Ne s'exécute QUE si nous sommes en mode création (pas de coordonnées initiales)
        if (!hasInitialCoords && navigator.geolocation) {
            
            navigator.geolocation.getCurrentPosition(
                // Succès : position de l'utilisateur trouvée
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // 1. Mettre à jour l'état de la carte/marqueur
                    setCurrentPosition([lat, lng]);
                    
                    // 2. Notifier le parent pour initialiser le formulaire
                    onLocationChange(lat.toFixed(8), lng.toFixed(8)); 
                    
                    setIsLoadingGeolocation(false);
                },
                // Erreur ou refus : on utilise la position par défaut (Paris)
                (error) => {
                    console.error("Erreur de géolocalisation: ", error.message);
                    setIsLoadingGeolocation(false); // Arrêter le chargement
                    // L'état reste à DEFAULT_POSITION (Paris)
                },
                // Options de la géolocalisation
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else if (hasInitialCoords) {
            setIsLoadingGeolocation(false);
        }
    }, [hasInitialCoords, onLocationChange]); 

    // Affiche un indicateur de chargement si nécessaire
    if (isLoadingGeolocation) {
        return (
            <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <p className="text-gray-500 flex items-center gap-2"><Loader className="w-5 h-5 animate-spin"/> Localisation en cours...</p>
            </div>
        );
    }

    return (
        <MapContainer
            center={currentPosition}
            zoom={hasInitialCoords ? 13 : 15}
            scrollWheelZoom={false}
            style={{ height: '300px', width: '100%', borderRadius: '0.75rem' }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <DraggableMarker 
                onLocationChange={onLocationChange} 
                initialPosition={currentPosition}
            />
        </MapContainer>
    );
};

export default MapPicker;