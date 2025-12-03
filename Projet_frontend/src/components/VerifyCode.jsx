import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // CORRECTION: Ajout de .jsx
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react'; // Icônes

export default function VerifyCode() {
  // Ajout de setVerificationInfo pour le nettoyage après succès
  const { verificationInfo, login, isAuthenticated, setVerificationInfo } = useAuth(); 
  const navigate = useNavigate();
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Redirection si l'utilisateur est déjà connecté ou s'il n'y a pas d'e-mail en attente.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else if (!verificationInfo || !verificationInfo.email) {
      // Si l'utilisateur n'est pas passé par l'inscription, le renvoyer.
      navigate('/signup');
    }
  }, [isAuthenticated, verificationInfo, navigate]);

  const email = verificationInfo?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (code.length !== 6) {
      setError('Le code de vérification doit contenir 6 chiffres.');
      setLoading(false);
      return;
    }

    try {
      // Utilisation du endpoint de vérification
      const response = await fetch('http://localhost:8000/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Connexion de l'utilisateur avec le token et les données reçues
        login(data.token, data.user); 
        
        // Nettoyage des infos de vérification après succès
        setVerificationInfo(null);
        
        setSuccessMessage('Vérification réussie. Redirection vers le tableau de bord...');
        // Redirection vers le tableau de bord après un court délai
      } else {
        setError(data.message || 'Échec de la vérification du code. Veuillez vérifier le code ou réessayer.');
      }
    } catch (err) {
      setError('Erreur réseau ou du serveur. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  // Afficher un spinner ou rien si l'e-mail n'est pas prêt ou si l'utilisateur est redirigé
  if (!email || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Chargement ou redirection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-500 p-3 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Vérification du compte
          </h2>
          <p className="mt-2 text-sm text-center text-gray-600">
            Un code à 6 chiffres a été envoyé à <strong className="font-semibold">{email}</strong>.
            Il est valable 10 minutes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Code de vérification (6 chiffres)
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl tracking-wider"
              placeholder="123456"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-sm">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white transition duration-200 
              ${loading || code.length !== 6
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Valider le code'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <button
                onClick={() => navigate('/signup')}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
                Changer d'adresse e-mail ou renvoyer le code (si expiré)
            </button>
        </div>
      </div>
    </div>
  );
}