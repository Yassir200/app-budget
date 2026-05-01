import axios from 'axios';

// ==========================================
// CONFIGURATION DE L'INSTANCE AXIOS
// ==========================================
// La baseURL '/api' est stratégique : 
// - En local : le proxy Vite intercepte '/api' et le redirige vers localhost:3000
// - En production : DigitalOcean intercepte '/api' et le redirige vers le backend
const api = axios.create({
  baseURL: '/api', 
});

// ==========================================
// INTERCEPTEUR DE REQUÊTE (Aller)
// ==========================================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Attache le token JWT dans les en-têtes de sécurité
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});

// ==========================================
// INTERCEPTEUR DE RÉPONSE (Retour)
// ==========================================
api.interceptors.response.use(
  (response) => {
    // Si la requête réussit, on renvoie simplement la réponse
    return response;
  },
  (error) => {
    // Gestion globale des erreurs d'authentification (401 Non Autorisé)
    // Se déclenche si le token est expiré, invalide, ou si le compte est supprimé
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou compte non autorisé. Déconnexion forcée.");
      
      // 1. Nettoyage sécurisé du navigateur
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      
      // 2. Redirection de sécurité vers la page de connexion
      window.location.href = '/Login'; 
    }
    
    // Pour les autres erreurs (400, 404, 500), on les renvoie au composant
    return Promise.reject(error);
  }
);

export default api;