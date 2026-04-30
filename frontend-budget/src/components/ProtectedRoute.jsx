import React from 'react';
import { Navigate } from 'react-router-dom';

// composant pour proteger les routes privees
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // redirection vers le login si l'utilisateur n'est pas connecte
  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}

export default ProtectedRoute;