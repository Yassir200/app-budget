import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import ProtectedRoute from './components/ProtectedRoute'; 
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// 💡 IMPORT DE LA PAGE SUPPORT ICI
import Support from './pages/Support';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* ==========================================
            ROUTES PUBLIQUES
        ========================================== */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <LandingPage />} />
        <Route path="/Login" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Login />} />
        <Route path="/Register" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <Register />} />
        <Route path="/ForgotPassword" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <ForgotPassword />} />
        <Route path="/ResetPassword/:token" element={isAuthenticated ? <Navigate to="/Dashboard" /> : <ResetPassword />} />

        {/* ==========================================
            ROUTES PRIVÉES
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
        
        {/* 👇 NOUVELLE ROUTE SUPPORT SÉCURISÉE 👇 */}
        <Route 
          path="/Support" 
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } 
        />
        
        {/* route par defaut */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
}

export default App;