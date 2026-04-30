import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api';

const MySwal = withReactContent(Swal);

function ResetPassword() {
  const { token } = useParams(); // Récupère le token depuis l'URL
  const navigate = useNavigate();
  
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [afficherNouveau, setAfficherNouveau] = useState(false);
  const [afficherConfirmer, setAfficherConfirmer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nouveauMotDePasse !== confirmerMotDePasse) {
      return MySwal.fire({
        icon: 'error',
        title: 'Attention',
        text: 'Les mots de passe ne correspondent pas.'
      });
    }

    setIsLoading(true);

    try {
      await api.post(`/utilisateurs/reinitialiser-mot-de-passe/${token}`, { nouveauMotDePasse });
      
      await MySwal.fire({
        icon: 'success',
        title: 'Mot de passe modifié !',
        text: 'Votre mot de passe a été mis à jour avec succès.',
        confirmButtonColor: '#3b82f6'
      });
      navigate('/Login');
    } catch (erreur) {
      MySwal.fire({
        icon: 'error',
        title: 'Lien invalide',
        text: erreur.response?.data?.message || "Le lien a expiré ou est invalide."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-700">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Nouveau mot de passe 🔑</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Veuillez créer un nouveau mot de passe sécurisé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Nouveau Mot de passe */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input 
                type={afficherNouveau ? "text" : "password"} 
                required 
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-slate-800 dark:text-white"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setAfficherNouveau(!afficherNouveau)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1">
                {afficherNouveau ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmer Mot de passe */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input 
                type={afficherConfirmer ? "text" : "password"} 
                required 
                value={confirmerMotDePasse}
                onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                className={`w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-700/50 border rounded-xl outline-none focus:ring-2 transition text-slate-800 dark:text-white ${confirmerMotDePasse && nouveauMotDePasse !== confirmerMotDePasse ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-600 focus:ring-blue-500'}`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setAfficherConfirmer(!afficherConfirmer)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1">
                {afficherConfirmer ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || (nouveauMotDePasse !== confirmerMotDePasse)}
            className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;