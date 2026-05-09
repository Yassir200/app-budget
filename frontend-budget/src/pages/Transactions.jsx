import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Tag, LogOut, Wallet, PlusCircle, Trash2, Pencil, X, AlertCircle, CheckCircle2, ArrowRightLeft, ChevronDown, Search, Mic,
  Heart, Gamepad2, Home, Utensils, GraduationCap, Bus, ShoppingCart, Users, Dumbbell, Shirt, Apple, Briefcase, Coffee, Plane, FileText, Car, Train, Ship, Bike, Fuel, Pizza, Croissant, Beer, Wine, Tv, Film, Music, Ticket, Smartphone, Laptop, Monitor, Mouse, Sofa, Bed, Bath, Lightbulb, Stethoscope, Syringe, Pill, Baby, Cat, Dog, CreditCard, Coins, Landmark, PiggyBank, Receipt, Gift, Scissors, Wrench, Umbrella, Globe
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const ICON_MAP = {
  Heart, Gamepad2, Home, Utensils, GraduationCap, Bus, ShoppingCart, Users, Dumbbell, Shirt, Apple, Briefcase, Coffee, Plane, FileText, Wallet, Car, Train, Ship, Bike, Fuel, Pizza, Croissant, Beer, Wine, Tv, Film, Music, Mic, Ticket, Smartphone, Laptop, Monitor, Mouse, Sofa, Bed, Bath, Lightbulb, Stethoscope, Syringe, Pill, Baby, Cat, Dog, CreditCard, Coins, Landmark, PiggyBank, Receipt, Gift, Scissors, Wrench, Umbrella, Globe
};

const MySwal = withReactContent(Swal);

function Transactions() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour la modale de modification
  const [editingTx, setEditingTx] = useState(null);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);

  // Stocker la date d'aujourd'hui pour bloquer le futur
  const todayString = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState(() => {
    const savedDraft = sessionStorage.getItem('transactionDraft');
    if (savedDraft) {
      return JSON.parse(savedDraft);
    }
    return {
      titre: '', montant: '', type: 'depense', categorieId: '', description: '',
      date: todayString
    };
  });

  const fetchData = async () => {
    try {
      const [resCat, resTx] = await Promise.all([
        api.get('/categories'),
        api.get('/transactions')
      ]);
      setCategories(resCat.data);
      setTransactions(resTx.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur de chargement", err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    sessionStorage.setItem('transactionDraft', JSON.stringify(formData));
  }, [formData]);

  const setQuickDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setFormData({ ...formData, date: date.toISOString().split('T')[0] });
  };

  const setEditQuickDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    setEditingTx({ ...editingTx, date: date.toISOString().split('T')[0] });
  };

  // --- AJOUTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    if (!formData.categorieId) return setStatus({ type: 'error', message: t('transactions.chooseCategoryError', 'Choisissez une catégorie.') });
    
    if (formData.date > todayString) {
      return setStatus({ type: 'error', message: t('transactions.futureDateError', 'La date ne peut pas être dans le futur.') });
    }

    try {
      await api.post('/transactions', formData);
      setStatus({ type: 'success', message: t('transactions.addSuccess', 'Opération ajoutée !') });
      setFormData({ titre: '', montant: '', type: 'depense', categorieId: '', description: '', date: todayString });
      sessionStorage.removeItem('transactionDraft');
      fetchData();
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || t('transactions.addError', "Erreur d'ajout") });
    }
  };

  // --- MODIFIER ---
  const handleEditClick = (tx) => {
    setEditingTx({
      ...tx,
      categorieId: tx.categorie?._id || '',
      date: new Date(tx.date).toISOString().split('T')[0]
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingTx.categorieId) {
      MySwal.fire({ icon: 'warning', title: 'Oups', text: t('transactions.chooseCategoryError', 'Choisissez une catégorie.') });
      return;
    }

    if (editingTx.date > todayString) {
      MySwal.fire({ icon: 'warning', title: 'Oups', text: t('transactions.futureDateError', 'La date ne peut pas être dans le futur.') });
      return;
    }

    try {
      await api.put(`/transactions/${editingTx._id}`, editingTx);
      setEditingTx(null);
      fetchData();
      MySwal.fire({ icon: 'success', title: 'Modifiée !', toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });
    } catch (error) {
      MySwal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de modifier la transaction.' });
    }
  };

  // --- SUPPRIMER ---
  const handleDelete = (id) => {
    const isDark = document.documentElement.classList.contains('dark');
    
    MySwal.fire({
      title: t('transactions.deleteTitle', 'Supprimer cette opération ?'),
      text: t('transactions.deleteWarning', "Cette action est irréversible !"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#64748b',
      confirmButtonText: t('transactions.confirmBtn', 'Oui, supprimer'),
      cancelButtonText: t('transactions.cancelBtn', 'Annuler'),
      background: isDark ? '#1e293b' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      borderRadius: '1.5rem'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try { 
          await api.delete(`/transactions/${id}`); 
          fetchData(); 
          MySwal.fire({
            title: t('transactions.deletedTitle', 'Supprimée !'),
            text: t('transactions.deletedMsg', 'Votre opération a bien été effacée.'),
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a'
          });
        } catch (err) { 
          MySwal.fire({
            title: t('transactions.errorTitle', 'Erreur'),
            text: t('transactions.errorMsg', 'Impossible de supprimer cette opération.'),
            icon: 'error',
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a'
          });
        }
      }
    });
  };

  const RenderIcon = ({ name, size = 24, className = "" }) => {
    const IconComponent = ICON_MAP[name] || ICON_MAP['FileText'];
    return <IconComponent size={size} className={className} />;
  };

  const formatDevise = (montant) => new Intl.NumberFormat('en-US').format(montant) + ' DH';
  const formaterDate = (date) => new Date(date).toLocaleDateString(i18n.language || 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const selectedCategory = categories.find(c => c._id === formData.categorieId);
  const editSelectedCategory = editingTx ? categories.find(c => c._id === editingTx.categorieId) : null;
  
  const filteredTransactions = transactions.filter(tx => {
    const search = searchTerm.toLowerCase();
    const titreMatch = tx.titre ? tx.titre.toLowerCase().includes(search) : false;
    const categorieMatch = tx.categorie?.nom ? tx.categorie.nom.toLowerCase().includes(search) : false;
    const descriptionMatch = tx.description ? tx.description.toLowerCase().includes(search) : false;
    return titreMatch || categorieMatch || descriptionMatch;
  });

  const handleNaviguerVersCategories = () => {
    navigate('/Categories');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-slate-900 text-slate-800 dark:text-white">Chargement...</div>;

  return (
    <>
      <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Sidebar />
        
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-20 shrink-0 bg-[#f4f7fb] dark:bg-slate-900 px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold">{t('transactions.pageTitle', 'Saisie des transactions')}</h1>
          </header>

          <div className="flex-1 px-8 pb-8 max-w-[1600px] w-full mx-auto overflow-hidden flex flex-col min-h-0">
            
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
              
              {/* === FORMULAIRE D'AJOUT (Gauche) === */}
              <div className="lg:col-span-5 flex flex-col min-h-0">
                <div className="bg-white dark:bg-slate-800 p-6 xl:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex-1 flex flex-col relative z-20 overflow-y-auto custom-scrollbar ">
                  
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t('transactions.newTitle', 'Nouvelle transaction')}</h2>
                  </div>

                  {status.message && (
                    <div className={`p-3 rounded-xl mb-4 text-sm font-medium shrink-0 ${status.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                      {status.message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.amount', 'Montant (DH)')}</label>
                        <input type="number" placeholder="0.00" required step="0.01" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-xl font-bold text-slate-800 dark:text-white" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
                      </div>
                      <div className="w-1/3 flex flex-col">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.type', 'Type')}</label>
                        <div className="flex bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600 flex-1 min-h-[48px]">
                          <button type="button" onClick={() => setFormData({...formData, type: 'depense'})} className={`flex-1 rounded-lg text-sm font-bold transition-all ${formData.type === 'depense' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}>{t('transactions.expense', 'Dépense')}</button>
                          <button type="button" onClick={() => setFormData({...formData, type: 'revenu'})} className={`flex-1 rounded-lg text-sm font-bold transition-all ${formData.type === 'revenu' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>{t('transactions.income', 'Revenu')}</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.titleLabel', 'Titre')}</label>
                      <input type="text" placeholder={t('transactions.titlePlaceholder', 'Ex: Déjeuner...')} required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={formData.titre} onChange={(e) => setFormData({...formData, titre: e.target.value})} />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.date', 'Date')}</label>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-600">
                          <button type="button" onClick={() => setQuickDate(0)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${formData.date === todayString ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t('transactions.todayBtn', 'Auj.')}</button>
                          <button type="button" onClick={() => setQuickDate(1)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${formData.date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t('transactions.yesterdayBtn', 'Hier')}</button>
                          <button type="button" onClick={() => setQuickDate(2)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${formData.date === new Date(Date.now() - 172800000).toISOString().split('T')[0] ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t('transactions.twoDaysBtn', '-2 Jours')}</button>
                        </div>
                        <input type="date" required max={todayString} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none text-sm cursor-pointer" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                      </div>
                    </div>

                    <div className="relative z-30">
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.category', 'Catégorie')}</label>
                      <div onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer flex items-center justify-between">
                        {selectedCategory ? (
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: selectedCategory.couleur }}><RenderIcon name={selectedCategory.icone} size={14} /></div>
                            <span className="font-bold text-sm">{selectedCategory.nom}</span>
                          </div>
                        ) : <span className="text-slate-400 text-sm">{t('transactions.chooseCategory', 'Choisir une catégorie...')}</span>}
                        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                      </div>
                      {isCategoryOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)}></div>
                          
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden flex flex-col">
                            <div className="max-h-48 overflow-y-auto custom-scrollbar py-2">
                              {categories.map(cat => (
                                <div key={cat._id} onClick={() => { setFormData({ ...formData, categorieId: cat._id }); setIsCategoryOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.couleur || '#cbd5e1' }}>
                                    <RenderIcon name={cat.icone} size={16} />
                                  </div>
                                  <span className="font-bold text-sm">{cat.nom}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNaviguerVersCategories();
                                  setIsCategoryOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg cursor-pointer transition-colors"
                              >
                                <PlusCircle size={18} />
                                <span className="text-sm">Créer une catégorie</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.descLabel', 'Description')}</label>
                      {/* 💡 CORRECTIONS APPORTÉES ICI : h-24, custom-scrollbar, break-all */}
                      <textarea 
                        placeholder={t('transactions.descPlaceholder', 'Ajoutez des détails')} 
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none h-24 text-slate-800 dark:text-white text-sm custom-scrollbar break-all" 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      />
                    </div>

                    <button type="submit" className="mt-auto w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg text-sm">
                      {t('transactions.addBtn', 'Ajouter')} {formData.montant ? `${formData.montant} DH` : ''}
                    </button>
                  </form>
                </div>
              </div>

              {/* === HISTORIQUE DES TRANSACTIONS (Droite) === */}
              <div className="lg:col-span-7 flex flex-col min-h-0">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 flex-1 flex flex-col min-h-0 relative z-10">
                  
                  <div className="flex justify-between items-center mb-8 gap-4 shrink-0">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t('transactions.history', 'Historique Complet')}</h2>
                    <div className="relative w-64">
                      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder={t('transactions.search', 'Chercher...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-2.5">
                    {filteredTransactions.map((tx) => (
                      <div key={tx._id} className="flex flex-col px-4 py-3.5 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 rounded-xl transition group bg-white dark:bg-slate-800">
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0" style={{ backgroundColor: tx.categorie?.couleur || '#cbd5e1' }}>
                              <RenderIcon name={tx.categorie?.icone || 'FileText'} size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-base leading-tight">{tx.titre}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{tx.categorie?.nom || t('transactions.general', 'Général')} • {formaterDate(tx.date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-base font-bold mr-1 ${tx.type === 'revenu' ? 'text-emerald-500' : 'text-rose-600'}`}>{tx.type === 'revenu' ? '+' : '-'}{formatDevise(tx.montant)}</span>
                            
                            <button onClick={() => handleEditClick(tx)} className="text-slate-300 hover:text-blue-500 transition opacity-0 group-hover:opacity-100 p-1.5" title="Modifier">
                              <Pencil size={16} />
                            </button>

                            <button onClick={() => handleDelete(tx._id)} className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 p-1.5" title="Supprimer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {tx.description && (
                          <div className="mt-2.5 ml-[3.25rem] bg-slate-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-[12px] text-slate-600 dark:text-slate-300 italic leading-snug">"{tx.description}"</p>
                          </div>
                        )}

                      </div>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <div className="text-center py-12 text-slate-400"><p>{t('transactions.noTransactions', 'Aucune transaction trouvée.')}</p></div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* === MODALE DE MODIFICATION === */}
      {editingTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Modifier la transaction</h2>
              <button onClick={() => setEditingTx(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="edit-form" onSubmit={handleUpdate} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.amount', 'Montant (DH)')}</label>
                    <input type="number" required step="0.01" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-xl font-bold text-slate-800 dark:text-white" value={editingTx.montant} onChange={(e) => setEditingTx({...editingTx, montant: e.target.value})} />
                  </div>
                  <div className="w-1/3 flex flex-col">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.type', 'Type')}</label>
                    <div className="flex bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl border border-slate-200 dark:border-slate-600 flex-1 min-h-[48px]">
                      <button type="button" onClick={() => setEditingTx({...editingTx, type: 'depense'})} className={`flex-1 rounded-lg text-sm font-bold transition-all ${editingTx.type === 'depense' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}>{t('transactions.expense', 'Dépense')}</button>
                      <button type="button" onClick={() => setEditingTx({...editingTx, type: 'revenu'})} className={`flex-1 rounded-lg text-sm font-bold transition-all ${editingTx.type === 'revenu' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}>{t('transactions.income', 'Revenu')}</button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.titleLabel', 'Titre')}</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white" value={editingTx.titre} onChange={(e) => setEditingTx({...editingTx, titre: e.target.value})} />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.date', 'Date')}</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-600">
                      <button type="button" onClick={() => setEditQuickDate(0)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${editingTx.date === todayString ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t('transactions.todayBtn', 'Auj.')}</button>
                      <button type="button" onClick={() => setEditQuickDate(1)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition ${editingTx.date === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{t('transactions.yesterdayBtn', 'Hier')}</button>
                    </div>
                    <input type="date" required max={todayString} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none text-sm cursor-pointer" value={editingTx.date} onChange={(e) => setEditingTx({...editingTx, date: e.target.value})} />
                  </div>
                </div>

                <div className="relative z-30">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.category', 'Catégorie')}</label>
                  <div onClick={() => setIsEditCategoryOpen(!isEditCategoryOpen)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer flex items-center justify-between">
                    {editSelectedCategory ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: editSelectedCategory.couleur }}><RenderIcon name={editSelectedCategory.icone} size={14} /></div>
                        <span className="font-bold text-sm">{editSelectedCategory.nom}</span>
                      </div>
                    ) : <span className="text-slate-400 text-sm">Choisir...</span>}
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isEditCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isEditCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsEditCategoryOpen(false)}></div>
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden flex flex-col">
                        <div className="max-h-48 overflow-y-auto custom-scrollbar py-2">
                          {categories.map(cat => (
                            <div key={cat._id} onClick={() => { setEditingTx({ ...editingTx, categorieId: cat._id }); setIsEditCategoryOpen(false); }} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: cat.couleur || '#cbd5e1' }}><RenderIcon name={cat.icone} size={16} /></div>
                              <span className="font-bold text-sm">{cat.nom}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1.5">{t('transactions.descLabel', 'Description')}</label>
                  {/* 💡 CORRECTIONS APPORTÉES ICI AUSSI : h-24, custom-scrollbar, break-all */}
                  <textarea 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition resize-none h-24 text-slate-800 dark:text-white text-sm custom-scrollbar break-all" 
                    value={editingTx.description} 
                    onChange={(e) => setEditingTx({...editingTx, description: e.target.value})} 
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 shrink-0">
              <button form="edit-form" type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg text-sm">
                Enregistrer les modifications
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}

export default Transactions;