import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  Mail, 
  Phone, 
  Send, 
  MessageSquare, 
  LifeBuoy
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; // 💡 Ajout de l'import API

const MySwal = withReactContent(Swal);

function Support() {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 💡 APPEL RÉEL AU BACKEND
      await api.post('/utilisateurs/support', formData);

      const isDark = document.documentElement.classList.contains('dark');
      
      MySwal.fire({
        icon: 'success',
        title: t('support.successTitle', 'Message envoyé !'),
        text: t('support.successText', 'Notre équipe vous répondra dans les plus brefs délais.'),
        confirmButtonColor: '#3b82f6',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        borderRadius: '1.5rem',
        customClass: {
          confirmButton: 'px-5 py-2.5 rounded-xl font-bold'
        }
      });

      setFormData({ nom: '', email: '', telephone: '', message: '' });
      
    } catch (error) {
      console.error("Erreur d'envoi", error);
      const isDark = document.documentElement.classList.contains('dark');
      
      MySwal.fire({
        icon: 'error',
        title: t('support.errorTitle', 'Oups !'),
        text: t('support.errorText', "Un problème est survenu lors de l'envoi. Veuillez réessayer."),
        confirmButtonColor: '#f43f5e',
        background: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#f8fafc' : '#0f172a',
        borderRadius: '1.5rem'
      });
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* En-tête */}
        <header className="h-20 shrink-0 bg-[#f4f7fb] dark:bg-slate-900 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LifeBuoy className="text-blue-600 dark:text-blue-400" size={24} />
            {t('support.pageTitle', 'Support & Assistance')}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-8 pb-12 pt-4 max-w-[1600px] w-full mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* === COLONNE GAUCHE === */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-slate-800 p-6 xl:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                      {t('support.header', "Besoin d'aide ?")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('support.subheader', "Notre équipe d'experts est disponible pour vous accompagner dans la gestion de votre budget au quotidien.")}
                    </p>
                  </div>

                  {/* Carte Mise en avant */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-slate-700/50 dark:to-slate-700 p-6 rounded-2xl border border-blue-200/50 dark:border-slate-600 mb-6 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
                      <MessageSquare size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                      {t('support.contactUs', 'Contactez-nous')}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t('support.contactDesc', 'Vous avez une question ou un problème technique ? Nous sommes là pour y répondre rapidement.')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Carte Email */}
                    <a href="mailto:support@monbudget.ma" className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('support.emailLabel', 'Email')}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">support@monbudget.dev</p>
                      </div>
                    </a>

                    {/* Carte Téléphone */}
                    <a href="tel:+212646517099" className="group bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('support.phoneLabel', 'Téléphone')}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">+212 6 00 00 00 00</p>
                      </div>
                    </a>
                  </div>

                </div>
              </div>

              {/* === COLONNE DROITE === */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-800 p-6 xl:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-1">
                      {t('support.formTitle', 'Envoyez-nous un message')}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {t('support.formSubtitle', 'Remplissez ce formulaire et nous vous contacterons sous 24h.')}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                          {t('support.name', 'Nom complet')}
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="Nom" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-white"
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        />
                      </div>

                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                          {t('support.email', 'Adresse Email')}
                        </label>
                        <input 
                          type="email" 
                          required
                          placeholder="vous@exemple.com" 
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-white"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                        {t('support.phoneInput', 'Téléphone (Optionnel)')}
                      </label>
                      <input 
                        type="tel" 
                        placeholder="+212 6 XX XX XX XX" 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm text-slate-800 dark:text-white"
                        value={formData.telephone}
                        onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                        {t('support.message', 'Votre Message')}
                      </label>
                      <textarea 
                        required
                        placeholder={t('support.messagePlaceholder', 'Décrivez votre demande en détail...')} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none text-sm text-slate-800 dark:text-white custom-scrollbar h-32"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          <span>{t('support.sendBtn', 'Envoyer le message')}</span>
                        </>
                      )}
                    </button>

                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Support;