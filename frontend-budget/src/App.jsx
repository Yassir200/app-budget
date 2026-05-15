import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ==========================================
// IMPORTATION DES PAGES PUBLIQUES
// ==========================================
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ==========================================
// IMPORTATION DES PAGES PRIVÉES
// ==========================================
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import Support from './pages/Support';

// ==========================================
// IMPORTATION DES COMPOSANTS
// ==========================================
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  // Vérifie si l'utilisateur est connecté via la présence du token
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* ==========================================
            ROUTES PUBLIQUES 
            (Redirigent vers le Dashboard si l'utilisateur est déjà connecté)
        ========================================== */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <LandingPage />} />
        <Route path="/Login" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Login />} />
        <Route path="/Register" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Register />} />
        <Route path="/ForgotPassword" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <ForgotPassword />} />
        
        {/* 💡 ROUTE CORRIGÉE : /:token permet à React de capter l'URL envoyée par email */}
        <Route path="/ResetPassword/:token" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <ResetPassword />} />

        {/* ==========================================
            ROUTES PRIVÉES 
            (Sécurisées par le composant ProtectedRoute)
        ========================================== */}
        <Route 
          path="/Dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Transactions" 
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Categories" 
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/Support" 
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } 
        />
        
        {/* ==========================================
            ROUTE DE SECOURS (Si l'URL n'existe pas)
        ========================================== */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
}

export default App;