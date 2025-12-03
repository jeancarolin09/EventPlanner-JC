import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

// Fonction utilitaire pour lire le localStorage en toute sécurité
const getInitialAuthState = () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("jwt");
    
    let user = null;
    // ⭐ AJOUT DE LA VÉRIFICATION EXPLICITE DE LA CHAÎNE "undefined"
    if (storedUser === "undefined") {
        console.warn("localStorage 'user' contenait la chaîne littérale 'undefined'. Nettoyage du stockage.");
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");
        return { isAuthenticated: false, user: null }; // Arrêt immédiat
    }

    try {
        // Tenter d'analyser l'utilisateur si la valeur existe ET qu'elle n'est pas "undefined" (déjà géré ci-dessus, mais pour la clarté)
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        // En cas d'erreur (JSON invalide, comme un objet non stringifié), nettoyer le stockage
        console.error("Erreur de parsing localStorage user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("jwt");
        user = null; // S'assurer que 'user' est null après l'échec
    }

    return {
        // L'utilisateur est authentifié si un token et un objet utilisateur valide existent
        isAuthenticated: !!storedToken && !!user,
        user: user,
    };
};


export const AuthProvider = ({ children }) => {
    // ⭐ MODIFICATIONS ICI : Utiliser la fonction pour l'initialisation
    const initialState = getInitialAuthState();
    
    const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated);
    const [user, setUser] = useState(initialState.user);

    const [verificationInfo, setVerificationInfo] = useState(null);

    // Le useEffect précédent n'est plus nécessaire et est supprimé, 
    // car l'initialisation se fait directement.

    const login = (token, userData) => {
        localStorage.setItem("jwt", token);
        localStorage.setItem("user", JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");

        setIsAuthenticated(false);
        setUser(null);

        setVerificationInfo(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, setUser, login, logout, verificationInfo, setVerificationInfo }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);