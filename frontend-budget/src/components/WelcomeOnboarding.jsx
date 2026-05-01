import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Home, Bus, Utensils, Gamepad2, ShoppingCart, Heart, Briefcase, GraduationCap } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

// 💡 1. Configuration avec les vraies couleurs (Hex) et les noms d'icônes
const CATEGORIES_SUGGEREES = [
  { nom: "Alimentation", icone: "Utensils", couleur: "#eab308", type: "depense" }, // Jaune
  { nom: "Transport", icone: "Bus", couleur: "#0ea5e9", type: "depense" }, // Bleu clair
  { nom: "Logement", icone: "Home", couleur: "#3b82f6", type: "depense" }, // Bleu
  { nom: "Loisirs", icone: "Gamepad2", couleur: "#10b981", type: "depense" }, // Vert
  { nom: "Courses", icone: "ShoppingCart", couleur: "#6366f1", type: "depense" }, // Indigo
  { nom: "Santé", icone: "Heart", couleur: "#ef4444", type: "depense" }, // Rouge
  { nom: "Éducation", icone: "GraduationCap", couleur: "#a855f7", type: "depense" }, // Violet
  { nom: "Salaire", icone: "Briefcase", couleur: "#10b981", type: "revenu" }, // Vert (Revenu)
];

// Fonction pour rendre la bonne icône dynamiquement
const renderIcon = (iconName) => {
  switch(iconName) {
    case 'Utensils': return <Utensils size={24} color="white" />;
    case 'Bus': return <Bus size={24} color="white" />;
    case 'Home': return <Home size={24} color="white" />;
    case 'Gamepad2': return <Gamepad2 size={24} color="white" />;
    case 'ShoppingCart': return <ShoppingCart size={24} color="white" />;
    case 'Heart': return <Heart size={24} color="white" />;
    case 'GraduationCap': return <GraduationCap size={24} color="white" />;
    case 'Briefcase': return <Briefcase size={24} color="white" />;
    default: return <Sparkles size={24} color="white" />;
  }
};

export default function WelcomeOnboarding({ onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCats, setSelectedCats] = useState(CATEGORIES_SUGGEREES);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const checkCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data.length === 0) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Erreur vérification catégories", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkCategories();
  }, []);

  const toggleCategory = (cat) => {
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleSave = async () => {
    if (selectedCats.length === 0) {
      return Swal.fire({ icon: 'warning', title: 'Oups', text: 'Sélectionnez au moins une catégorie.' });
    }

    setIsSaving(true);
    try {
      // 💡 2. On envoie TOUTES les données au backend (nom, type, icone, couleur)
      await Promise.all(
        selectedCats.map(cat => 
          api.post('/categories', { 
            nom: cat.nom, 
            type: cat.type,
            icone: cat.icone,
            couleur: cat.couleur
          })
        )
      );
      
      setIsVisible(false);
      if (onComplete) onComplete(); 

      Swal.fire({
        icon: 'success',
        title: 'Espace configuré !',
        text: 'Vos catégories sont prêtes.',
        timer: 3000,
        showConfirmButton: false
      });
      
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: "Impossible de créer les catégories." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 transition-all duration-500">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="bg-blue-600 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm mb-4">
              <Sparkles size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Bienvenue sur MyBudget !</h2>
            <p className="text-blue-100 text-lg">Configurons votre espace en sélectionnant vos catégories principales.</p>
          </div>
        </div>

        <div className="p-8">
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-6 text-center">
            Cliquez pour sélectionner ou désélectionner (Vous pourrez les modifier plus tard).
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {CATEGORIES_SUGGEREES.map((cat, index) => {
              const isSelected = selectedCats.includes(cat);
              return (
                <button
                  key={index}
                  onClick={() => toggleCategory(cat)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-105 shadow-md' 
                    : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-800">
                      <Check size={14} strokeWidth={4} />
                    </div>
                  )}
                  
                  {/* 💡 3. Utilisation de la vraie couleur (style={{backgroundColor}}) et de la vraie icône */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner"
                    style={{ backgroundColor: cat.couleur }}
                  >
                    {renderIcon(cat.icone)}
                  </div>
                  <span className={`font-bold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {cat.nom}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSaving ? 'Configuration en cours...' : `Commencer avec ${selectedCats.length} catégories`}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}