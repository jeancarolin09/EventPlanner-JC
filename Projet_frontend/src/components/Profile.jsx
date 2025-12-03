import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(
    user?.profilePicture ? `http://localhost:8000${user.profilePicture}` : null
  );
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // Aperçu local du fichier
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
    if (profilePicture) data.append("profilePicture", profilePicture);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/users/update",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data.user);
      setMessage("Profil mis à jour avec succès !");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la mise à jour du profil.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 pt-4">
      <div className="bg-slate-400 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Modifier le profil
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Aperçu de la photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={preview || "/default-avatar.png"}
                alt="Profil"
                className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
              />
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-full cursor-pointer text-sm"
              >
                📷
              </label> 
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Champs du profil */}
          <input
            type="text"
            name="name"
            placeholder="Nom"
            value={formData.name}
            onChange={handleChange}
            className="p-2 rounded-md bg-slate-700 text-white"
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className="p-2 rounded-md bg-slate-700 text-white"
          />
          <input
            type="password"
            name="password"
            placeholder="Nouveau mot de passe "
            value={formData.password}
            onChange={handleChange}
            className="p-2 rounded-md bg-slate-700 text-white"
          />

          {/* Boutons */}
          <div className="flex justify-between mt-4 gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-700 hover:bg-gray-500 text-white py-2 px-4 rounded-pill font-semibold"
            >
              Retour
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-400 text-white py-2 px-4 rounded-pill font-semibold"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>

        {message && (
          <p className="text-center mt-4 text-green-400 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
