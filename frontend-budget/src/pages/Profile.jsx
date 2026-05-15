import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav'; // 👈 1. IMPORT DE LA BOTTOM NAV
import { Globe, ChevronDown, Sun, Moon, Save, Lock, AlertTriangle, User as UserIcon, Eye, EyeOff, LogOut, LifeBuoy, Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../services/api'; 

const MySwal = withReactContent(Swal);

const formaterNom = (nom) => {
    if (!nom) return "";
    let mots = nom.split(' ');
    let motsFormates = mots.map(mot => mot.slice(0, 1).toUpperCase() + mot.slice(1).toLowerCase());
    return motsFormates.join(' ');
};

function Profile() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const languages = [
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'en', label: 'English', flag: 'GB' }
  ];
  const currentLangObj = languages.find(l => l.code === i18n.language?.substring(0, 2)) || languages[0];

  const [utilisateurInitial, setUtilisateurInitial] = useState({ nom: '', email: '', avatar: '' });
  const [utilisateur, setUtilisateur] = useState({ nom: '', email: '', avatar: '' });
  const [motsDePasse, setMotsDePasse] = useState({ actuel: '', nouveau: '', confirmer: '' });
  
  const [afficherActuel, setAfficherActuel] = useState(false);
  const [afficherNouveau, setAfficherNouveau] = useState(false);
  const [afficherConfirmer, setAfficherConfirmer] = useState(false);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/utilisateurs/me');
      const data = { 
        nom: res.data.nom, 
        email: res.data.email,
        avatar: res.data.avatar || '' 
      };
      setUtilisateur(data);
      setUtilisateurInitial(data);
    } catch (erreur) {
      console.error("Erreur de récupération :", erreur);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      MySwal.fire({
        title: t('profile.uploading', 'Téléchargement...'),
        allowOutsideClick: false,
        didOpen: () => MySwal.showLoading()
      });

      const res = await api.post('/utilisateurs/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newAvatarUrl = res.data.avatarUrl;

      setUtilisateur(prev => ({ ...prev, avatar: newAvatarUrl }));
      setUtilisateurInitial(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      const storedUser = JSON.parse(localStorage.getItem('utilisateur') || '{}');
      localStorage.setItem('utilisateur', JSON.stringify({ ...storedUser, avatar: newAvatarUrl }));
      window.dispatchEvent(new Event('profilMisAJour')); 

      MySwal.fire({ icon: 'success', title: t('profile.photoUpdated', 'Photo mise à jour'), toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    } catch (erreur) {
      console.error(erreur);
      MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: t('profile.photoError', 'Impossible de modifier la photo de profil.') });
    }
  };

  const handleSauvegarderInfo = async (e) => {
    e.preventDefault();
    const nomFormate = formaterNom(utilisateur.nom);
    const emailAChange = utilisateur.email.trim().toLowerCase() !== utilisateurInitial.email;

    try {
      if (emailAChange) {
        await api.post('/utilisateurs/demander-changement-email', { nouvelEmail: utilisateur.email.trim().toLowerCase(), nom: nomFormate });
        let tentatives = 3;

        await MySwal.fire({
            title: `<span class="text-xl font-bold text-slate-900 dark:text-white">${t('profile.verificationRequired', 'Vérification requise')}</span>`,
            html: `<p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${t('profile.codeSentTo', 'Un code a été envoyé à')} <br/><strong>${utilisateur.email}</strong></p>`,
            input: 'text',
            inputAttributes: { maxlength: 6, placeholder: '123456' },
            customClass: {
                popup: 'bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl',
                input: 'text-center text-2xl tracking-widest font-bold bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-white outline-none py-4',
                confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 py-3 transition-colors w-full',
                cancelButton: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl px-6 py-3 mt-2 w-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors',
                validationMessage: 'text-rose-500 font-bold text-sm mt-3 bg-rose-50 dark:bg-rose-900/30 p-2 rounded-lg'
            },
            buttonsStyling: false,
            showCancelButton: true,
            confirmButtonText: t('profile.validateBtn', 'Valider'),
            cancelButtonText: t('profile.cancelBtn', 'Annuler'),
            showLoaderOnConfirm: true,
            preConfirm: async (otpCode) => {
                if (!otpCode || otpCode.length !== 6 || !/^\d+$/.test(otpCode)) {
                    MySwal.showValidationMessage(t('profile.enter6Digits', 'Veuillez entrer les 6 chiffres du code.'));
                    return false;
                }
                try {
                    await api.post('/utilisateurs/confirmer-changement-email', { otp: otpCode });
                    return true;
                } catch (erreur) {
                    tentatives--;
                    if (tentatives > 0) {
                        MySwal.showValidationMessage(`${t('profile.incorrectCode', 'Code incorrect. Il vous reste')} ${tentatives} ${t('profile.attempts', 'tentative(s).')}`);
                        return false;
                    } else {
                        throw new Error(t('profile.maxAttemptsReached', 'Nombre maximum de tentatives atteint.'));
                    }
                }
            },
            allowOutsideClick: () => !MySwal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                MySwal.fire({ icon: 'success', title: t('profile.emailUpdated', 'Email mis à jour !'), timer: 2000, showConfirmButton: false });
                fetchProfil(); 
            } else if (result.isDismissed) {
                setUtilisateur({...utilisateur, email: utilisateurInitial.email});
            }
        }).catch((erreur) => {
            MySwal.fire({ icon: 'error', title: t('profile.failure', 'Échec'), text: erreur.message });
            setUtilisateur({...utilisateur, email: utilisateurInitial.email});
        });
      } else {
        await api.put('/utilisateurs/profil', { nom: nomFormate });
        MySwal.fire({ icon: 'success', title: t('profile.profileUpdated', 'Profil mis à jour'), toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
        fetchProfil();
      }
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: erreur.response?.data?.message || t('profile.generalError', 'Erreur') });
      setUtilisateur({...utilisateur, email: utilisateurInitial.email});
    }
  };

  const handleMiseAJourMotDePasse = async (e) => {
    e.preventDefault();
    if (motsDePasse.nouveau !== motsDePasse.confirmer) return MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: t('profile.passwordMismatch', 'Les mots de passe ne correspondent pas.') });
    try {
      const response = await api.put('/utilisateurs/profil', { motDePasseActuel: motsDePasse.actuel, nouveauMotDePasse: motsDePasse.nouveau });
      if (response.data.token) localStorage.setItem('token', response.data.token);
      setMotsDePasse({ actuel: '', nouveau: '', confirmer: '' }); 
      MySwal.fire({ icon: 'success', title: t('profile.passwordUpdated', 'Mot de passe mis à jour') });
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: erreur.response?.data?.message || t('profile.wrongCredentials', 'Identifiants incorrects.') });
    }
  };

  const handleMotDePasseOublieDirect = async () => {
    try {
      await api.post('/utilisateurs/mot-de-passe-oublie', { email: utilisateurInitial.email });
      MySwal.fire({ icon: 'success', title: t('profile.emailSent', 'Email envoyé !'), text: t('profile.checkInbox', 'Vérifiez votre boîte mail.') });
    } catch (erreur) {
      MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: t('profile.emailSendError', "Impossible d'envoyer l'email.") });
    }
  };

  const handleLogout = () => {
    MySwal.fire({
      title: t('profile.logoutTitle', 'Se déconnecter ?'), 
      text: t('profile.logoutText', 'Voulez-vous vraiment fermer votre session ?'), 
      icon: 'question',
      showCancelButton: true, confirmButtonColor: '#f43f5e', 
      confirmButtonText: t('profile.logoutConfirm', 'Oui, déconnexion'), 
      cancelButtonText: t('profile.cancelBtn', 'Annuler'), 
      borderRadius: '1.5rem'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentAvatar = utilisateur.avatar;
        localStorage.removeItem('token'); 
        if(currentAvatar) localStorage.setItem('lastAvatar', currentAvatar);
        window.location.href = '/Login';
      }
    });
  };

  const handleDeleteAccount = () => {
    MySwal.fire({
      title: t('profile.deleteAccountTitle', 'Supprimer mon compte ?'), 
      text: t('profile.deleteAccountText', 'Cette action effacera définitivement toutes vos données.'), 
      icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#f43f5e', 
      confirmButtonText: t('profile.deleteConfirm', 'Oui, supprimer tout'), 
      cancelButtonText: t('profile.cancelBtn', 'Annuler')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { await api.delete('/utilisateurs/me'); localStorage.clear(); window.location.href = '/Login'; } 
        catch (erreur) { MySwal.fire({ icon: 'error', title: t('profile.error', 'Erreur'), text: t('profile.deleteError', 'Impossible de supprimer le compte.') }); }
      }
    });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-slate-900 flex font-sans transition-colors duration-300">
      <Sidebar />
      
      {/* 👈 2. AJOUT DE pb-16 lg:pb-0 ICI */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 lg:pb-0">
        <header className="h-20 shrink-0 px-8 flex justify-between items-center bg-[#f4f7fb] dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('profile.title', 'Mon Profil')}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-slate-700 dark:text-slate-200">
                <Globe size={16} /> <span className="uppercase">{currentLangObj.flag}</span> <ChevronDown size={14} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden z-20 animate-fade-in py-1">
                    {languages.map((lng) => (
                      <button key={lng.code} onClick={() => { i18n.changeLanguage(lng.code); setIsLangOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-bold transition-colors ${currentLangObj.code === lng.code ? 'bg-slate-50 dark:bg-slate-700/50 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                        <span className="text-sm font-extrabold text-slate-400">{lng.flag}</span><span>{lng.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div onClick={toggleDarkMode} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm text-slate-600 dark:text-slate-300">
              {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 pb-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1400px] mx-auto mt-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* 1. INFORMATIONS PERSONNELLES */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative group cursor-pointer rounded-full shrink-0" onClick={() => document.getElementById('avatar-upload').click()}>
                    <img src={utilisateur.avatar || `https://ui-avatars.com/api/?name=${utilisateur.nom.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-4 border-blue-50 dark:border-slate-700/50 group-hover:opacity-70 transition-opacity shadow-sm" />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white" /></div>
                    <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('profile.personalInfo', 'Informations Personnelles')}</h2>
                    
                  </div>
                </div>

                <form onSubmit={handleSauvegarderInfo} className="flex-1 flex flex-col">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">{t('profile.fullName', 'Nom complet')}</label>
                      <input type="text" value={utilisateur.nom} onChange={(e) => setUtilisateur({...utilisateur, nom: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-medium transition-all" required />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">{t('profile.emailAddress', 'Adresse Email')}</label>
                      <input type="email" value={utilisateur.email} onChange={(e) => setUtilisateur({...utilisateur, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-white font-medium transition-all" required />
                    </div>
                  </div>
                  <div className="mt-auto pt-8 flex justify-end">
                    <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end">
                        <button type="submit" disabled={utilisateur.nom === utilisateurInitial.nom && utilisateur.email === utilisateurInitial.email} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50">
                        <Save size={18} /> {t('profile.saveBtn', 'Enregistrer')}
                        </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* 2. SÉCURITÉ */}
              <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all flex flex-col">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl"><Lock size={24} /></div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{t('profile.security', 'Sécurité')}</h2>
                </div>
                <form onSubmit={handleMiseAJourMotDePasse} className="flex-1 flex flex-col">
                  <div className="mb-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400">{t('profile.currentPassword', 'Mot de passe actuel')}</label>
                        <button type="button" onClick={handleMotDePasseOublieDirect} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">{t('profile.forgotPassword', 'Oublié ?')}</button>
                      </div>
                      <div className="relative">
                        <input type={afficherActuel ? "text" : "password"} required value={motsDePasse.actuel} onChange={(e) => setMotsDePasse({...motsDePasse, actuel: e.target.value})} className="w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white transition-all" />
                        <button type="button" onClick={() => setAfficherActuel(!afficherActuel)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherActuel ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">{t('profile.newPassword', 'Nouveau')}</label>
                          <div className="relative">
                              <input type={afficherNouveau ? "text" : "password"} required value={motsDePasse.nouveau} onChange={(e) => setMotsDePasse({...motsDePasse, nouveau: e.target.value})} className="w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white transition-all" />
                              <button type="button" onClick={() => setAfficherNouveau(!afficherNouveau)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherNouveau ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1">{t('profile.confirmPassword', 'Confirmer')}</label>
                          <div className="relative">
                              <input type={afficherConfirmer ? "text" : "password"} required value={motsDePasse.confirmer} onChange={(e) => setMotsDePasse({...motsDePasse, confirmer: e.target.value})} className={`w-full px-5 py-3.5 pr-12 bg-slate-50 dark:bg-slate-900/50 border rounded-xl outline-none transition-all focus:ring-2 text-slate-800 dark:text-white ${motsDePasse.confirmer && motsDePasse.nouveau !== motsDePasse.confirmer ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-600/50 focus:ring-amber-500'}`} />
                              <button type="button" onClick={() => setAfficherConfirmer(!afficherConfirmer)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors">{afficherConfirmer ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                          </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-8 flex justify-end">
                    <div className="w-full border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end">
                        <button type="submit" disabled={!motsDePasse.actuel || !motsDePasse.nouveau || motsDePasse.nouveau !== motsDePasse.confirmer} className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-all shadow-lg disabled:opacity-50">
                        <Save size={18} /> {t('profile.updateBtn', 'Mettre à jour')}
                        </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* 3. ACTIONS RAPIDES */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
                        <LifeBuoy size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{t('profile.support', 'Support & Assistance')}</h3>
                      </div>
                    </div>
                    <button onClick={() => navigate('/Support')} className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all">{t('profile.contactBtn', 'Contacter')}</button>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-2xl">
                        <LogOut size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">{t('profile.logout', 'Déconnexion')}</h3>
                      </div>
                    </div>
                    <button onClick={handleLogout} className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-rose-500/20 text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-400 font-bold rounded-xl transition-all">{t('profile.quitBtn', 'Quitter')}</button>
                  </div>
              </div>
                
              {/* 4. ZONE DE DANGER */}
              <div className="xl:col-span-2 bg-rose-50 dark:bg-rose-500/10 p-6 sm:p-8 rounded-[2rem] border border-rose-200 dark:border-rose-500/20 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-rose-600 dark:text-rose-500">
                      <AlertTriangle size={28} /> 
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('profile.deleteWarning', 'La suppression est irréversible et effacera toutes vos données.')}</p>
                  </div>
                  <button onClick={handleDeleteAccount} className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg whitespace-nowrap">{t('profile.deleteAccountBtn', 'Supprimer mon compte')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 👈 3. AJOUT DE LA BOTTOM NAV ICI */}
        <BottomNav />
      </div>
    </div>
  );
}

export default Profile;