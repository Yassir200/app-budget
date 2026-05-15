import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, Tag, User } from 'lucide-react';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/Dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/Transactions', icon: ArrowRightLeft, label: 'Saisies' },
    { path: '/Categories', icon: Tag, label: 'Catégories' },
    { path: '/Profile', icon: User, label: 'Profil' }
  ];

  return (
    // Visible uniquement sur petit écran (lg:hidden), fixée en bas
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-safe z-50 shadow-[0_-5px_15px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={22} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNav;