import React, { useState } from 'react';
import { 
  ArrowLeft, User, Bell, Shield, Palette, Globe, 
  Mail, Lock, Smartphone, Eye, EyeOff, Check, 
  AlertCircle, Trash2, Download, Moon, 
  Sun, Volume2, MessageSquare, Calendar,
  Heart, Loader, Save
} from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  
  const [settings, setSettings] = useState({
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+33 6 12 34 56 78',
    bio: 'Organisateur d\'événements passionné',
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    invitationAlerts: true,
    commentNotifications: true,
    likeNotifications: false,
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris',
    soundEffects: true,
    notificationSound: true,
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const sections = [
    { id: 'account', icon: User, label: 'Compte' },
    { id: 'privacy', icon: Shield, label: 'Confidentialité' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'appearance', icon: Palette, label: 'Apparence' },
    { id: 'security', icon: Lock, label: 'Sécurité' },
    { id: 'data', icon: Download, label: 'Données' },
  ];

  const handleSave = async () => {
    setLoading(true);
    setSaveSuccess(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    alert('Mot de passe modifié avec succès !');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const handleExportData = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventplanner-data.json';
    a.click();
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?')) {
      if (window.confirm('Êtes-vous absolument certain ?')) {
        alert('Compte supprimé');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition"
                   onClick={() => navigate("/dashboard")}>
                <ArrowLeft size={20} />
                Retour
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            </div>
            
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                <Check size={16} />
                <span className="text-sm font-medium rounded-2">Sauvegardé</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Menu latéral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-24">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenu */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Compte */}
            {activeSection === 'account' && (
              <div className="space-y-6">
                <SectionCard title="Informations personnelles" description="Gérez vos informations de profil" icon={User}>
                  <div className="space-y-4">
                    <InputField label="Nom complet" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} />
                    <InputField label="Email" type="email" value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} />
                    <InputField label="Téléphone" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                      <textarea value={settings.bio} onChange={(e) => setSettings({...settings, bio: e.target.value})} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none" />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Confidentialité */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <SectionCard title="Visibilité du profil" description="Contrôlez qui peut voir votre profil" icon={Eye}>
                  <div className="space-y-3">
                    <RadioOption name="visibility" value="public" checked={settings.profileVisibility === 'public'} onChange={() => setSettings({...settings, profileVisibility: 'public'})} label="Public" description="Tout le monde peut voir votre profil" />
                    <RadioOption name="visibility" value="friends" checked={settings.profileVisibility === 'friends'} onChange={() => setSettings({...settings, profileVisibility: 'friends'})} label="Amis uniquement" description="Seuls vos amis peuvent voir votre profil" />
                    <RadioOption name="visibility" value="private" checked={settings.profileVisibility === 'private'} onChange={() => setSettings({...settings, profileVisibility: 'private'})} label="Privé" description="Personne ne peut voir votre profil" />
                  </div>
                </SectionCard>

                <SectionCard title="Informations visibles" icon={Shield}>
                  <div className="space-y-3">
                    <ToggleOption label="Afficher mon email" checked={settings.showEmail} onChange={() => setSettings({...settings, showEmail: !settings.showEmail})} />
                    <ToggleOption label="Afficher mon téléphone" checked={settings.showPhone} onChange={() => setSettings({...settings, showPhone: !settings.showPhone})} />
                    <ToggleOption label="Autoriser les messages privés" checked={settings.allowMessages} onChange={() => setSettings({...settings, allowMessages: !settings.allowMessages})} />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <SectionCard title="Méthodes de notification" icon={Bell}>
                  <div className="space-y-3">
                    <ToggleOption label="Notifications par email" description="Recevoir des emails" checked={settings.emailNotifications} onChange={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})} />
                    <ToggleOption label="Notifications push" description="Notifications sur votre appareil" checked={settings.pushNotifications} onChange={() => setSettings({...settings, pushNotifications: !settings.pushNotifications})} />
                  </div>
                </SectionCard>

                <SectionCard title="Types de notifications" icon={MessageSquare}>
                  <div className="space-y-3">
                    <ToggleOption label="Rappels d'événements" icon={Calendar} checked={settings.eventReminders} onChange={() => setSettings({...settings, eventReminders: !settings.eventReminders})} />
                    <ToggleOption label="Nouvelles invitations" icon={Mail} checked={settings.invitationAlerts} onChange={() => setSettings({...settings, invitationAlerts: !settings.invitationAlerts})} />
                    <ToggleOption label="Commentaires" icon={MessageSquare} checked={settings.commentNotifications} onChange={() => setSettings({...settings, commentNotifications: !settings.commentNotifications})} />
                    <ToggleOption label="J'aimes" icon={Heart} checked={settings.likeNotifications} onChange={() => setSettings({...settings, likeNotifications: !settings.likeNotifications})} />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Apparence */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <SectionCard title="Thème" icon={Palette}>
                  <div className="space-y-3">
                    <RadioOption name="theme" value="light" checked={settings.theme === 'light'} onChange={() => setSettings({...settings, theme: 'light'})} label="Clair" icon={Sun} />
                    <RadioOption name="theme" value="dark" checked={settings.theme === 'dark'} onChange={() => setSettings({...settings, theme: 'dark'})} label="Sombre" icon={Moon} />
                  </div>
                </SectionCard>

                <SectionCard title="Langue et région" icon={Globe}>
                  <div className="space-y-4">
                    <SelectField label="Langue" value={settings.language} onChange={(e) => setSettings({...settings, language: e.target.value})} options={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} />
                    <SelectField label="Fuseau horaire" value={settings.timezone} onChange={(e) => setSettings({...settings, timezone: e.target.value})} options={[{ value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' }]} />
                  </div>
                </SectionCard>

                <SectionCard title="Sons" icon={Volume2}>
                  <div className="space-y-3">
                    <ToggleOption label="Effets sonores" checked={settings.soundEffects} onChange={() => setSettings({...settings, soundEffects: !settings.soundEffects})} />
                    <ToggleOption label="Son des notifications" checked={settings.notificationSound} onChange={() => setSettings({...settings, notificationSound: !settings.notificationSound})} />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* Sécurité */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <SectionCard title="Changer le mot de passe" icon={Lock}>
                  <div className="space-y-4">
                    <PasswordField label="Mot de passe actuel" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} show={showPasswords.current} onToggle={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} />
                    <PasswordField label="Nouveau mot de passe" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} show={showPasswords.new} onToggle={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} />
                    <PasswordField label="Confirmer" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} show={showPasswords.confirm} onToggle={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} />
                    <button onClick={handlePasswordChange} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-4 transition">
                      <Lock size={20} />
                      Changer le mot de passe
                    </button>
                  </div>
                </SectionCard>

                <SectionCard title="Sessions actives" icon={Smartphone}>
                  <SessionItem device="MacBook Pro" location="Paris" current />
                  <SessionItem device="iPhone" location="Paris" lastActive="Il y a 2h" />
                </SectionCard>
              </div>
            )}

            {/* Données */}
            {activeSection === 'data' && (
              <div className="space-y-6">
                <SectionCard title="Exporter vos données" icon={Download}>
                  <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-4 transition">
                    <Download size={20} />
                    Télécharger mes données
                  </button>
                </SectionCard>

                <SectionCard title="Zone dangereuse" icon={AlertCircle} danger>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-1">Supprimer mon compte</h4>
                        <p className="text-sm text-red-700 mb-3">Action irréversible. Toutes vos données seront supprimées.</p>
                        <button onClick={handleDeleteAccount} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-4 transition">
                          <Trash2 size={16} />
                          Supprimer mon compte
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

            <div className="sticky bottom-6 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-4 shadow-lg transition-all">
                {loading ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children, danger }) {
  return (
    <div className={`bg-white rounded-xl border ${danger ? 'border-red-200' : 'border-gray-200'} p-6`}>
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-3 rounded-lg ${danger ? 'bg-red-100' : 'bg-purple-100'}`}>
          <Icon size={24} className={danger ? 'text-red-600' : 'text-purple-600'} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input type={type} value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <select value={value} onChange={onChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

function ToggleOption({ label, description, icon: Icon, checked, onChange }) {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-start gap-3 flex-1">
        {Icon && <Icon size={20} className="text-purple-600 mt-0.5" />}
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
        </div>
      </div>
      <button onClick={onChange} className={`relative inline-flex h-6 w-11 items-center rounded-5 transition ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

function RadioOption({ name, value, checked, onChange, label, description, icon: Icon }) {
  return (
    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="mt-1 w-4 h-4 text-purple-600" />
      <div className="flex items-start gap-3 flex-1">
        {Icon && <Icon size={20} className="text-purple-600 mt-0.5" />}
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {description && <p className="text-sm text-gray-600 mt-0.5">{description}</p>}
        </div>
      </div>
    </label>
  );
}

function SessionItem({ device, location, lastActive, current }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3 last:mb-0">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Smartphone size={20} className="text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900 flex items-center gap-2">
            {device}
            {current && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Actuel</span>}
          </p>
          <p className="text-sm text-gray-600">{location} • {lastActive || 'Maintenant'}</p>
        </div>
      </div>
      {!current && <button className="text-red-600 hover:text-red-700 font-semibold text-sm">Déconnecter</button>}
    </div>
  );
}