import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composant de champ réutilisable, ajusté pour le thème sombre
const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon, error, showPasswordToggle }) => (
  <div className="relative mb-6">
     <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label> 
    {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 w-5 h-5" aria-hidden="true" />}
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
       className={`w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg outline-none transition duration-200 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500' : ''
      }`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
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

const SignupForm = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName) newErrors.fullName = 'Le nom complet est requis';
    else if (formData.fullName.length < 3) newErrors.fullName = 'Le nom doit contenir au moins 3 caractères';

    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';

    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Veuillez confirmer le mot de passe';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';

    if (!acceptTerms) newErrors.terms = 'Vous devez accepter les conditions';

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
    // Le formulaire est maintenant transparent, comme celui de connexion
     <form
      className="w-full p-8 space-y-6 bg-white rounded-lg shadow-xl border border-gray-100"
      onSubmit={handleSubmit}
      aria-labelledby="signup-heading"
    >
       <h2 id="signup-heading" className="text-3xl font-bold text-gray-800 text-center mb-6">Créer un compte</h2>

      {/* Nom complet */}
      <InputField
        label="Nom"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Votre nom"
        icon={User}
        error={errors.fullName}
      />

      {/* Email */}
      <InputField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="votre@email.com"
        icon={Mail}
        error={errors.email}
      />

      {/* Mot de passe */}
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

      {/* Confirmation mot de passe */}
      <InputField
        label="Confirmer le mot de passe"
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        icon={Lock}
        error={errors.confirmPassword}
        showPasswordToggle={{
          onClick: () => setShowConfirmPassword(!showConfirmPassword),
          icon: showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />,
          label: showConfirmPassword ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe',
        }}
      />

      {/* Conditions */}
      <div>
        <div className="flex items-start">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (errors.terms) setErrors(prev => ({ ...prev, terms: '' }));
            }}
           className="w-4 h-4 text-red-600 border-gray-400 rounded focus:ring-red-600 mt-1"
          />
          <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
            J'accepte les{' '}
            {/* Liens ajustés pour être visibles sur fond clair */}
            <a href="#" className="text-red-600 hover:text-red-700 underline transition">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-red-600 hover:text-red-700 underline transition">
              politique de confidentialité
            </a>
          </label>
        </div>
        {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
      </div>

      {/* Bouton Créer un compte */}
      <button
        type="submit"
        disabled={isSubmitting}
        // Utilisation du dégradé similaire au bouton Submit de Login, mais avec des couleurs plus "inscription" (vert/bleu)
        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-pill font-semibold hover:from-teal-600 hover:to-blue-700 transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Création en cours...' : 'Créer un compte'}
      </button>
      
      {/* Liens Sociaux (identiques à Login.jsx) */}
     <div className="flex justify-center gap-4 mt-8">
        <button aria-label="S'inscrire avec Facebook" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-600 hover:text-white transition duration-200">
          <Facebook size={20} />
        </button>
        <button aria-label="S'inscrire avec Instagram" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-pink-600 hover:text-white transition duration-200">
          <Instagram size={20} />
        </button>
        <button aria-label="S'inscrire avec LinkedIn" className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-blue-700 hover:text-white transition duration-200">
          <Linkedin size={20} />
        </button>
      </div>
    </form>
  );
};

export default SignupForm;