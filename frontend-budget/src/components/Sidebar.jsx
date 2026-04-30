import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, Wallet, ArrowRightLeft, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
import api from '../services/api'; 

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { t } = useTranslation(); 

  const isActive = (path) => location.pathname === path;

  // État vide par défaut au lieu de Darrell
  const [user, setUser] = useState({ nom: 'Chargement...', email: '' });

  // 💡 Fonction pour récupérer le vrai utilisateur depuis la Base de Données
  const fetchCurrentUser = async () => {
    try {
      // 1ère CORRECTION : On utilise la bonne route en français
      const res = await api.get('/utilisateurs/me'); 
      
      const userData = {
        nom: res.data.nom || 'Utilisateur',
        email: res.data.email
      };
      
      setUser(userData);
      // 2ème CORRECTION : On utilise la clé 'utilisateur'
      localStorage.setItem('utilisateur', JSON.stringify(userData)); 
      
    } catch (err) {
      console.error("Erreur récupération utilisateur", err);
      // Fallback sur le cache
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    // Charger au démarrage
    fetchCurrentUser();

    // Écouter si le profil est mis à jour depuis la page Profile
    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    
    // 3ème CORRECTION : On écoute le bon événement français !
    window.addEventListener('profilMisAJour', handleProfileUpdate);
    return () => window.removeEventListener('profilMisAJour', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur'); // Nettoyage propre
    navigate('/Login');
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/50 hidden lg:flex flex-col transition-colors duration-300">
      
      {/* LOGO */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-md shadow-blue-500/20"><Wallet size={20} className="text-white" /></div>
        <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">{t('sidebar.title', 'Mon Budget')}</span>
      </div>
      
      {/* 👤 WIDGET UTILISATEUR DYNAMIQUE */}
      <div className="px-6 py-5 mx-4 mb-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
        <div onClick={() => navigate('/Profile')} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative shrink-0">
            {/* L'image se génère avec les vraies initiales de la BDD */}
            <img 
              src={`https://ui-avatars.com/api/?name=${user.nom.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
              alt="Avatar" 
              className="w-11 h-11 rounded-full border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {user.nom}
            </h4>
            {/* 💡 Affichage de l'email avec troncature automatique et infobulle au survol */}
            <p 
              className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full block"
              title={user.email}
            >
              {user.email || "Chargement..."}
            </p>
          </div>
        </div>
      </div>
      {/* MENU PRINCIPAL */}
      <nav className="flex-1 px-4 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <div onClick={() => navigate('/Dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors ${isActive('/Dashboard') ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}>
            <LayoutDashboard size={18} /> {t('sidebar.dashboard', 'Dashboard')}
          </div>
          <div onClick={() => navigate('/Transactions')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors ${isActive('/Transactions') ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}>
            <ArrowRightLeft size={18} /> {t('sidebar.transactions', 'Transactions')}
          </div>
          <div onClick={() => navigate('/Categories')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors ${isActive('/Categories') ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium'}`}>
            <Tag size={18} /> {t('sidebar.categories', 'Catégories')}
          </div>
        </div>

        {/* SECTION PARAMETRES & DECONNEXION */}
        <div className="mt-auto space-y-1 pt-6 border-t border-slate-100 dark:border-slate-700/50">
          <div onClick={() => navigate('/Profile')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-colors ${isActive('/Profile') ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
            <User size={18} /> {t('profile.pageTitle', 'Mon Profil')}
          </div>
          <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl font-bold cursor-pointer transition-colors">
            <LogOut size={18} />
            <span>{t('sidebar.logout', 'Déconnexion')}</span>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;