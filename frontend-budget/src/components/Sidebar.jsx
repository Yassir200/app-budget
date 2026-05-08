import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
import api from '../services/api'; 

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { t } = useTranslation(); 

  const isActive = (path) => location.pathname === path;

  // 💡 AJOUT DE L'AVATAR DANS LE STATE
  const [user, setUser] = useState({ nom: 'Chargement...', email: '', avatar: '' });

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/utilisateurs/me'); 
      const userData = {
        nom: res.data.nom || 'Utilisateur',
        email: res.data.email,
        avatar: res.data.avatar || '' // 💡 RÉCUPÉRATION DE LA PHOTO
      };
      setUser(userData);
      localStorage.setItem('utilisateur', JSON.stringify(userData)); 
    } catch (err) {
      console.error("Erreur récupération utilisateur", err);
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleProfileUpdate = () => {
      const storedUser = localStorage.getItem('utilisateur');
      if (storedUser) setUser(JSON.parse(storedUser));
    };
    
    window.addEventListener('profilMisAJour', handleProfileUpdate);
    return () => window.removeEventListener('profilMisAJour', handleProfileUpdate);
  }, []);

  return (
    <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/50 hidden lg:flex flex-col transition-colors duration-300">
      
      {/* 👤 WIDGET UTILISATEUR EN HAUT DE LA SIDEBAR */}
      <div 
        onClick={() => navigate('/Profile')} 
        title={t('profile.pageTitle', 'Accéder à mon Profil')}
        className="px-6 py-5 mx-4 mt-8 mb-4 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 cursor-pointer transition-colors group shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {/* 💡 AFFICHAGE DE LA PHOTO ICI */}
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.nom.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
              alt="Avatar" 
              className="w-11 h-11 rounded-full border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-105 transition-transform duration-300 object-cover" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
          </div>
          <div className="overflow-hidden flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {user.nom}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full block">
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
      </nav>
    </div>
  );
}

export default Sidebar;