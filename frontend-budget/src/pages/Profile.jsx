import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import { Globe, ChevronDown, Sun, Moon, Save, Lock, AlertTriangle, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api'; 

const MySwal = withReactContent(Swal);

// --- La méthode du prof pour le formatage du nom ---
const formaterNom = (nom) => {
    if (!nom) return "";
    let mots = nom.split(' ');
    let motsFormates = mots.map(mot => mot.slice(0, 1).toUpperCase() + mot.slice(1).toLowerCase());
    return motsFormates.join(' ');
};

function Profile() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // --- États UI ---
  const [isLangOpen, setIsLangOpen] = useState(false);
  const languages = [
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'en', label: 'English', flag: 'GB' }
  ];
  const currentLangObj = languages.find(l => l.code === i18n.language?.substring(0, 2)) || languages[0];

  // --- États des Données ---
  const [utilisateurInitial, setUtilisateurInitial] = useState({ nom: '', email: '' });
  const [utilisateur, setUtilisateur] = useState({ nom: '', email: '' });
  const [motsDePasse, setMotsDePasse] = useState({ actuel: '', nouveau: '', confirmer: '' });
  
  // Visibilité des mots de passe
  const [afficherActuel, setAfficherActuel] = useState(false);
  const [afficherNouveau, setAfficherNouveau] = useState(false);
  const [afficherConfirmer, setAfficherConfirmer] = useState(false);

  // 1. Récupération des données du profil
  const fetchProfil = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      const data = { nom: res.data.nom, email: res.data.email };
      setUtilisateur(data);
      setUtilisateurInitial(data);
    } catch (erreur) {
      console.error("Erreur de récupération :", erreur);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  // 2. Sauvegarde Nom & Email (avec workflow OTP et 3 tentatives)
  const handleSauvegarderInfo = async (e) => {
    e.preventDefault();
    const nomFormate = formaterNom(utilisateur.nom);
    const emailAChange = utilisateur.email.trim().toLowerCase() !== utilisateurInitial.email;

    try {
      if (emailAChange) {
        // --- ÉTAPE A : Demande d'envoi OTP ---
        await api.post('/utilisateurs/demander-changement-email', { 
            nouvelEmail: utilisateur.email.trim().toLowerCase(),
            nom: nomFormate 
        });

        // 💡 NOUVEAU : On initialise le compteur de tentatives
        let tentatives = 3;

        // --- ÉTAPE B : Popup de saisie avec Validation Intégrée (preConfirm) ---
        await MySwal.fire({
            title: '<span class="text-xl font-bold text-slate-900 dark:text-white">Vérification requise</span>',
            html: `<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Un code a été envoyé à <br/><strong>${utilisateur.email}</strong></p>`,
            input: 'text',
            inputAttributes: { maxlength: 6, placeholder: '123456' },
            customClass: {
                popup: 'bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl',
                input: 'text-center text-2xl tracking-widest font-bold bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white outline-none py-4',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 transition-colors w-full',
                cancelButton: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl px-6 py-3 mt-2 w-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors',
                validationMessage: 'text-rose-500 font-bold text-sm mt-3 bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg' // Style de l'erreur
            },
            buttonsStyling: false,
            showCancelButton: true,
            confirmButtonText: 'Valider',
            cancelButtonText: 'Annuler',
            showLoaderOnConfirm: true, // 💡 Ajoute une icône de chargement sur le bouton pendant la vérification
            
            // 💡 C'EST ICI QUE LA MAGIE OPÈRE :
            preConfirm: async (otpCode) => {
                if (!otpCode || otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
                    MySwal.showValidationMessage('Veuillez entrer les 6 chiffres du code.');
                    return false; // Empêche la popup de se fermer
                }

                try {
                    // On vérifie le code DIRECTEMENT ici
                    await api.post('/utilisateurs/confirmer-changement-email', { otp: otpCode });
                    return true; // Le code est bon, on ferme la popup et on passe au .then()
                } catch (erreur) {
                    tentatives--; // On retire une chance
                    if (tentatives > 0) {
                        // On affiche l'erreur dans la popup actuelle
                        MySwal.showValidationMessage(`Code incorrect. Il vous reste ${tentatives} tentative(s).`);
                        return false; // Empêche la popup de se fermer
                    } else {
                        // Fin des 3 tentatives, on déclenche une erreur globale
                        throw new Error("Nombre maximum de tentatives atteint. Opération annulée.");
                    }
                }
            },
            allowOutsideClick: () => !MySwal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                // Succès ! Le preConfirm a renvoyé true
                MySwal.fire({ icon: 'success', title: 'Email mis à jour !', timer: 2000, showConfirmButton: false });
                fetchProfil(); 
            } else if (result.isDismissed) {
                // L'utilisateur a cliqué sur "Annuler"
                setUtilisateur({...utilisateur, email: utilisateurInitial.email});
            }
        }).catch((erreur) => {
            // Déclenché si les 3 tentatives échouent
            MySwal.fire({ icon: 'error', title: 'Échec', text: erreur.message });
            setUtilisateur({...utilisateur, email: utilisateurInitial.email});
        });

      } else {
        // Mise à jour classique (Nom uniquement)
        await api.put('/utilisateurs/profil', { nom: nomFormate });
        MySwal.fire({ icon: 'success', title: 'Profil mis à jour', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchProfil();
      }
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: 'Erreur', text: erreur.response?.data?.message || "Une erreur est survenue lors de l'envoi de l'email." });
      setUtilisateur({...utilisateur, email: utilisateurInitial.email});
    }
  };

  // 3. Mise à jour du Mot de Passe (avec gestion du Token)
  const handleMiseAJourMotDePasse = async (e) => {
    e.preventDefault();
    if (motsDePasse.nouveau !== motsDePasse.confirmer) {
      return MySwal.fire({ icon: 'error', title: 'Erreur', text: 'Les mots de passe ne correspondent pas.' });
    }

    try {
      const response = await api.put('/utilisateurs/profil', {
        motDePasseActuel: motsDePasse.actuel,
        nouveauMotDePasse: motsDePasse.nouveau
      });

      // 💡 Crucial : On met à jour le token pour ne pas être déconnecté par le Middleware
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setMotsDePasse({ actuel: '', nouveau: '', confirmer: '' }); 
      MySwal.fire({ icon: 'success', title: 'Mot de passe mis à jour' });
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: 'Erreur', text: erreur.response?.data?.message || 'Identifiants incorrects.' });
    }
  };

  // 4. Mot de passe oublié (Direct depuis profil)
  const handleMotDePasseOublieDirect = async () => {
    try {
      await api.post('/utilisateurs/mot-de-passe-oublie', { email: utilisateurInitial.email });
      MySwal.fire({ icon: 'success', title: 'Email envoyé !', text: 'Vérifiez votre boîte mail.' });
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: 'Erreur', text: "Impossible d'envoyer l'email." });
    }
  };

  // 5. Suppression du compte
  const handleDeleteAccount = () => {
    MySwal.fire({
      title: 'Supprimer mon compte ?',
      text: 'Cette action effacera définitivement toutes vos données.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: 'Oui, supprimer tout',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete('/utilisateurs/me');
          localStorage.clear();
          window.location.href = '/Login';
        } catch (erreur) {
          MySwal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer le compte.' });
        }
      }
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-slate-900 flex font-sans transition-colors duration-300">
      
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 shrink-0 px-8 flex justify-between items-center bg-[#f4f7fb] dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mon Profil</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-slate-700 dark:text-slate-200">
              <Globe size={16} /> <span className="uppercase">{currentLangObj.flag}</span> <ChevronDown size={14} className={isLangOpen ? 'rotate-180' : ''} />
            </button>
            <div onClick={toggleDarkMode} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-slate-600 dark:text-slate-300">
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            </div>
          </div>
        </header>

        {/* CONTENU (Grille 2 colonnes) */}
        <div className="flex-1 px-8 pb-12 overflow-y-auto custom-scrollbar">
          
          {/* max-w-[1400px] permet d'utiliser toute la largeur de l'écran proprement */}
          <div className="max-w-[1400px] mx-auto mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* 1. INFORMATIONS PERSONNELLES (Colonne de Gauche) */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <UserIcon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Informations Personnelles</h2>
                </div>

                <form onSubmit={handleSauvegarderInfo} className="flex-1 flex flex-col">
                  {/* Empilement vertical pour mieux remplir l'espace de la demi-colonne */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Nom complet</label>
                      <input type="text" value={utilisateur.nom} onChange={(e) => setUtilisateur({...utilisateur, nom: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-medium transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Adresse Email</label>
                      <input type="email" value={utilisateur.email} onChange={(e) => setUtilisateur({...utilisateur, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-medium transition-all" required />
                    </div>
                  </div>
                  
                  {/* mt-auto pousse le bouton tout en bas pour s'aligner avec la carte d'à côté */}
                  <div className="mt-auto pt-8 flex justify-end">
                    <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end">
                        <button type="submit" disabled={utilisateur.nom === utilisateurInitial.nom && utilisateur.email === utilisateurInitial.email} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none">
                        <Save size={18} /> Enregistrer
                        </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* 2. SÉCURITÉ (Colonne de Droite) */}
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Lock size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Sécurité</h2>
                </div>

                <form onSubmit={handleMiseAJourMotDePasse} className="flex-1 flex flex-col">
                  <div className="mb-6 space-y-6">
                    {/* Mot de passe actuel */}
                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400">Mot de passe actuel</label>
                        <button type="button" onClick={handleMotDePasseOublieDirect} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Oublié ?</button>
                      </div>
                      <div className="relative">
                        <input type={afficherActuel ? "text" : "password"} required value={motsDePasse.actuel} onChange={(e) => setMotsDePasse({...motsDePasse, actuel: e.target.value})} className="w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white transition-all" />
                        <button type="button" onClick={() => setAfficherActuel(!afficherActuel)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherActuel ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>

                    {/* Nouveaux mots de passe (Côte à côte sur la demi-colonne) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Nouveau</label>
                          <div className="relative">
                              <input type={afficherNouveau ? "text" : "password"} required value={motsDePasse.nouveau} onChange={(e) => setMotsDePasse({...motsDePasse, nouveau: e.target.value})} className="w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white transition-all" />
                              <button type="button" onClick={() => setAfficherNouveau(!afficherNouveau)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherNouveau ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">Confirmer</label>
                          <div className="relative">
                              <input type={afficherConfirmer ? "text" : "password"} required value={motsDePasse.confirmer} onChange={(e) => setMotsDePasse({...motsDePasse, confirmer: e.target.value})} className={`w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border rounded-xl outline-none transition-all focus:ring-2 text-slate-800 dark:text-white ${motsDePasse.confirmer && motsDePasse.nouveau !== motsDePasse.confirmer ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-600/50 focus:ring-amber-500'}`} />
                              <button type="button" onClick={() => setAfficherConfirmer(!afficherConfirmer)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherConfirmer ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                          </div>
                      </div>
                    </div>
                  </div>

                  {/* mt-auto pousse le bouton tout en bas */}
                  <div className="mt-auto pt-8 flex justify-end">
                    <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end">
                        <button type="submit" disabled={!motsDePasse.actuel || !motsDePasse.nouveau || motsDePasse.nouveau !== motsDePasse.confirmer} className="flex items-center gap-2 px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg disabled:opacity-50 disabled:shadow-none">
                        <Save size={18} /> Mettre à jour
                        </button>
                    </div>
                  </div>
                </form>
              </div>
                
              {/* 3. ZONE DE DANGER (Pleine largeur en bas, grâce à xl:col-span-2) */}
              <div className="xl:col-span-2 bg-rose-50 dark:bg-rose-500/10 p-8 rounded-[2rem] border border-rose-200 dark:border-rose-500/20 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-rose-600 dark:text-rose-500">
                      <AlertTriangle size={28} /> 
                  
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">La suppression est irréversible et effacera toutes vos données associées.</p>
                  </div>
                  <button onClick={handleDeleteAccount} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/25 whitespace-nowrap">
                    Supprimer mon compte
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;