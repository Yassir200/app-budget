import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, 
  ArrowRight, 
  PieChart, 
  ShieldCheck, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext'; // Assure-toi que le chemin est correct

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const currentYear = new Date().getFullYear();

  // Redirection gérée via le hook useNavigate pour le bouton principal
  const handleGetStarted = () => {
    navigate('/Register');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      
      {/* ==========================================
          EN-TÊTE (NAVBAR)
      ========================================== */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          
          {/* Nouveau Logo Image + Texte */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            {/* L'icône du logo */}
            <img 
              src="/petit-logo.png" 
              alt="Icône MyBudget" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
            {/* Le bloc avec les deux phrases */}
            <div className="flex flex-col justify-center">
              <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                MyBudget
              </span>
              <span className="text-[0.65rem] md:text-xs font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] mt-0.5 uppercase">
                Gestion Budget
              </span>
            </div>
          </Link>

          {/* Actions à droite */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Toggle Mode Sombre/Clair */}
            <button 
              onClick={toggleDarkMode} 
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Se connecter */}
            <Link 
              to="/Login" 
              className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
            >
              {t('landing.login', 'Se connecter')}
            </Link>

            {/* S'inscrire */}
            <Link 
              to="/Register" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              {t('landing.register', "S'inscrire")}
            </Link>
          </div>
        </div>
      </header>

      {/* ==========================================
          SECTION HERO (PRINCIPALE)
      ========================================== */}
      {/* pt-32 compense la hauteur de la navbar fixed */}
      <main className="flex-1 pt-32 pb-16 flex flex-col items-center justify-center">
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Contenu Texte (Gauche) */}
          <div className="flex flex-col items-start text-left space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-white">
              Gérez votre budget facilement
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              {t('landing.heroSubtitle', 'Prenez le contrôle de votre budget, suivez vos dépenses au quotidien et atteignez vos objectifs financiers grâce à des outils intuitifs et sécurisés.')}
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              {/* Gros bouton Call-to-Action */}
              <button 
                onClick={handleGetStarted}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all hover:-translate-y-1"
              >
                {t('landing.cta', 'Commencer gratuitement')}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* === IMAGE / ILLUSTRATION (Droite) === */}
          <div className="relative w-full h-80 md:h-[450px] rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-white/50 dark:border-slate-700/50 overflow-hidden flex items-center justify-center group bg-slate-100 dark:bg-slate-800">
            
            {/* L'image qui va remplir le cadre */}
            <img 
              src="/hh.jfif" 
              alt="MyBudget App Dashboard" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Un léger voile dégradé par-dessus pour mieux l'intégrer au Dark Mode */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 dark:opacity-100 pointer-events-none transition-opacity"></div>
            
          </div>
        </section>

        {/* ==========================================
            SECTION FONCTIONNALITÉS (FEATURES)
        ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full mt-32 mb-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('landing.featuresTitle', 'CE QUE MyBudget VOUS OFFRE')}
            </h2>
          </div>

          {/* Grille de 3 cartes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Carte 1 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="text-emerald-600 dark:text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                {t('landing.feature1Title', 'Suivi intuitif')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.feature1Desc', 'Ajoutez vos revenus et dépenses en quelques clics. Catégorisez vos transactions pour une vision claire de votre budget.')}
              </p>
            </div>

            {/* Carte 2 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <PieChart className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                {t('landing.feature2Title', 'Statistiques claires')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.feature2Desc', 'Visualisez vos habitudes financières grâce à des graphiques dynamiques et des rapports mensuels exportables en PDF.')}
              </p>
            </div>

            {/* Carte 3 */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-rose-600 dark:text-rose-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                {t('landing.feature3Title', 'Sécurité renforcée')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('landing.feature3Desc', 'Vos données vous appartiennent. Nous utilisons des standards de sécurité élevés pour garantir la confidentialité de vos finances.')}
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* ==========================================
          PIED DE PAGE (FOOTER)
      ========================================== */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
          <p>
            {t('landing.footer', '© {{year}} MyBudget. Tous droits réservés.', { year: currentYear })}
          </p>
        </div>
      </footer>

    </div>
  );
}