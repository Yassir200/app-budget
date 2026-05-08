import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; 
import api from '../services/api';
import { Mail, Lock, Wallet, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/utilisateurs/login', { email, motDePasse: password });
      
      // 💡 ON ENREGISTRE LES INFOS DONT L'AVATAR IMMÉDIATEMENT
      localStorage.setItem('utilisateur', JSON.stringify(response.data.utilisateur));
      
      login(response.data.token);
      navigate('/Dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 font-sans p-4 transition-colors duration-500">
      
      <button
        onClick={toggleDarkMode}
        className="fixed top-6 right-6 p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
      >
        {isDarkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-blue-600" />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-colors duration-500">
        
        <div className="flex justify-center items-center gap-3 mb-8 text-blue-600 dark:text-blue-500">
          <Wallet size={36} />
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">MyBudget</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bienvenue</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Vous n'avez pas de compte ? <Link to="/Register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Créer un compte</Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 p-4 rounded-xl mb-6 text-sm font-medium">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adresse Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Mot de passe</label>
              <Link to="/ForgotPassword" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center gap-2 transition-all mt-8 ${
              loading ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
            }`}
          >
            {loading ? 'Connexion...' : <>Se connecter <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;