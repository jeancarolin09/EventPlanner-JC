// App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/SignUp.jsx"; 
import Home from "./pages/Home.jsx";
import Layout from "./layouts/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Profile from "./components/Profile.jsx";
import Settings from "./components/Settings.jsx";
import VerifyCode from "./components/VerifyCode.jsx";

// Séparer les routes pour accéder au context
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />

      {/* Pages privées */}
      <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/create-event" element={isAuthenticated ? <Layout><CreateEvent /></Layout> : <Navigate to="/login" />} />
      <Route path="/event/:id" element={isAuthenticated ? <Layout><EventDetails /></Layout> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />}/>
      <Route path="/settings" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/login" />} />
      <Route 
        path="/verify-code" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <VerifyCode />} 
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// AuthProvider englobe tout
export default function App() {
  return (
   
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    
  );
}
