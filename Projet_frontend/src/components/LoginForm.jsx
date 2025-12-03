import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import de useNavigate pour la navigation

// Composant de champ réutilisable, ajusté pour le thème clair
const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon, error, showPasswordToggle }) => (
  <div className="relative mb-6"> {/* Espacement accru pour la clarté */}
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 w-5 h-5" aria-hidden="true" />}
    <input
      id={name} // Assurez-vous que l'ID correspond au 'htmlFor' du label pour l'accessibilité
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      // CORRECTION DU STYLE DES CHAMPS : Utilisation de rounded-2xl
      className={`w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-2xl shadow-inner outline-none transition duration-200 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
        error ? 'border-red-500' : ''
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined} // Lie l'input au message d'erreur
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={showPasswordToggle.onClick}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 hover:text-gray-800 transition"
        aria-label={showPasswordToggle.label}
      >
        {showPasswordToggle.icon}
      </button>
    )}
    {error && <p id={`${name}-error`} className="text-red-600 text-sm mt-1 animate-fadeIn">{error}</p>}
  </div>
);

const LoginForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Utilisation de useNavigate

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <form
      className="w-full p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100"
      onSubmit={handleSubmit}
      aria-labelledby="login-heading"
    >
      <h2 id="login-heading" className="text-3xl font-bold text-gray-800 text-center mb-6">Se Connecter</h2>

      <InputField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Entrer votre Email"
        icon={Mail}
        error={errors.email}
      />

      <InputField
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        icon={Lock}
        error={errors.password}
        showPasswordToggle={{
          onClick: () => setShowPassword(!showPassword),
          icon: showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
          label: showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
        }}
      />

      {/* Bouton Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        // CORRECTION MAJEURE: Utilisation de rounded-full pour l'arrondi maximal (style pilule)
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-pill font-semibold hover:from-orange-600 hover:to-red-700 transition duration-200 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        aria-label={isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
      >
        {isSubmitting ? <span className="animate-spin"><Mail size={20} /></span> : 'Se connecter'}
      </button>

      {/* Liens Sociaux */}
      {/* CORRECTION DU STYLE DES BOUTONS SOCIAUX : Utilisation de rounded-full pour la cohérence */}
      <div className="flex justify-center  gap-4 mt-8">
        <button aria-label="Se connecter avec Facebook" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-600 hover:text-white transition duration-200">
          <Facebook size={20} />
        </button>
        <button aria-label="Se connecter avec Instagram" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-pink-600 hover:text-white transition duration-200">
          <Instagram size={20} />
        </button>
        <button aria-label="Se connecter avec LinkedIn" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-700 hover:text-white transition duration-200">
          <Linkedin size={20} />
        </button>
      </div>
    </form>
  );
};

export default LoginForm;