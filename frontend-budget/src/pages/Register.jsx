import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, User, Wallet, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Register() {
  const [formData, setFormData] = useState({ nom: '', email: '', motDePasse: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  const [etape, setEtape] = useState(1); 
  const [otpCode, setOtpCode] = useState('');
  
  const navigate = useNavigate();

  const handleInscription = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/utilisateurs', formData);
      setStatus({ type: 'success', message: 'Un code a été envoyé à votre email !' });
      setEtape(2); 
    } catch (err) {
      // 💡 AFFICHAGE EXPLICITE SI L'EMAIL EST DÉJÀ PRIS OU INVALIDE
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription.";
      setStatus({ type: 'error', message: errorMessage });
      
      // Optionnel : On peut aussi afficher une belle popup SweetAlert pour plus d'impact
      MySwal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
          confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/utilisateurs/verify-email', { email: formData.email, otp: otpCode });
      setStatus({ type: 'success', message: 'Email vérifié ! Redirection vers la connexion...' });
      
      MySwal.fire({
          icon: 'success',
          title: 'Compte validé !',
          showConfirmButton: false,
          timer: 2000
      });

      setTimeout(() => navigate('/Login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Code incorrect ou expiré.";
      setStatus({ type: 'error', message: errorMessage });
      
      MySwal.fire({
          icon: 'error',
          title: 'Code invalide',
          text: errorMessage,
          confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        <div className="flex justify-center items-center gap-3 mb-8 text-blue-600 dark:text-blue-500">
          <Wallet size={36} />
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white">MyBudget</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {etape === 1 ? "Créer un compte" : "Vérifiez votre email"}
          </h2>
          {etape === 1 ? (
            <div className="text-slate-500 dark:text-slate-400 text-sm flex flex-col gap-1">
              <span>Vous avez déjà un compte ? <Link to="/Login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">Connectez-vous</Link></span>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nous avons envoyé un code à <br/><span className="font-bold text-slate-800 dark:text-slate-200">{formData.email}</span></p>
          )}
        </div>

        {status.message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 text-sm font-bold ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} 
            {status.message}
          </div>
        )}

        {etape === 1 ? (
          <form onSubmit={handleInscription} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom complet</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" spellCheck="false" required value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none font-medium text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none font-medium text-slate-900 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" required placeholder="••••••••" value={formData.motDePasse} onChange={(e) => setFormData({...formData, motDePasse: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none font-medium text-slate-900 dark:text-white" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-8 transition-colors disabled:opacity-70">
              {loading ? 'Création...' : <>S'inscrire <ArrowRight size={20} /></>}
            </button>
          </form>

        ) : (

          <form onSubmit={handleVerification} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">Code à 6 chiffres</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required 
                  maxLength="6"
                  placeholder="123456"
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none font-bold text-center text-xl tracking-widest text-slate-900 dark:text-white" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full py-4 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold rounded-xl flex justify-center items-center mt-6 transition-colors disabled:opacity-50">
              {loading ? 'Vérification...' : 'Valider mon compte'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default Register;