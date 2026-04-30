import axios from 'axios';

// configuration d'axios
const api = axios.create({
  baseURL: '/api', 
});

// intercepteur pour attacher le token JWT aux requetes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; 
  }
  return config;
});
// 💡 NOUVEAU : Intercepteur de RÉPONSE (Pour gérer les comptes supprimés/tokens expirés)
api.interceptors.response.use(
  (response) => response, // Si tout va bien, on renvoie la réponse normalement
  (error) => {
    // Si le backend renvoie une erreur 401 (Non Autorisé / Utilisateur supprimé)
    if (error.response && error.response.status === 401) {
      console.warn("Session expirée ou compte supprimé. Déconnexion forcée.");
      // On nettoie les traces
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      // On redirige violemment vers le Login
      window.location.href = '/Login'; 
    }
    return Promise.reject(error);
  }
);

export default api;