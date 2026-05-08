import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { LayoutDashboard, Tag, Wallet, PlusCircle, ArrowDownRight, ArrowUpRight, Calendar, ArrowRightLeft, Download, Sun, Moon, Globe, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import WelcomeOnboarding from '../components/WelcomeOnboarding';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTranslation } from 'react-i18next'; 

ChartJS.register(ArcElement, Tooltip, Legend);
const MySwal = withReactContent(Swal);

function Dashboard() {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation(); 
  
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // --- UI State pour le Language Switcher (FR / EN uniquement) ---
  const [isLangOpen, setIsLangOpen] = useState(false);
  const languages = [
    { code: 'fr', label: 'Français', flag: 'FR' },
    { code: 'en', label: 'English', flag: 'GB' }
  ];

  const currentLangObj = languages.find(l => l.code === i18n.language?.substring(0, 2)) || languages[0];

  const fetchDashboardData = async () => {
    try {
      const resTx = await api.get('/transactions');
      setAllTransactions(resTx.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const formatDevise = (montant) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      .format(montant).replace('$', '') + ' MAD';
  };
  // 👇 NOUVELLE FONCTION À AJOUTER ICI 👇
  const formatDeviseCompact = (montant) => {
    // Si le montant dépasse 100 000, on utilise le format compact (K, M, B, T)
    if (Math.abs(montant) >= 100000) {
      return new Intl.NumberFormat('en-US', { 
        notation: "compact", 
        compactDisplay: "short", 
        maximumFractionDigits: 1 
      }).format(montant) + ' MAD';
    }
    return formatDevise(montant); // Sinon on garde l'affichage normal
  };

  const formaterDateCourte = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language || 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    return allTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      switch (timeFilter) {
        case 'day': return txDate.toDateString() === now.toDateString();
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
          startOfWeek.setHours(0, 0, 0, 0);
          return txDate >= startOfWeek && txDate <= now;
        case 'month': return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
        case 'year': return txDate.getFullYear() === now.getFullYear();
        case 'custom':
          if (!customDates.start || !customDates.end) return true;
          const start = new Date(customDates.start); start.setHours(0, 0, 0, 0);
          const end = new Date(customDates.end); end.setHours(23, 59, 59, 999);
          return txDate >= start && txDate <= end;
        default: return true;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const genererRapportMensuel = () => {
    const [year, month] = reportMonth.split('-');
    const transactionsDuMois = allTransactions.filter(tx => {
      const d = new Date(tx.date);
      return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    });

    if (transactionsDuMois.length === 0) {
      MySwal.fire({
        title: t('dashboard.emptyMonth', 'Mois vide'),
        text: t('dashboard.emptyMonthDesc', "Il n'y a aucune transaction pour ce mois. Le rapport PDF ne peut pas être généré."),
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#f8fafc' : '#0f172a',
        borderRadius: '1.5rem'
      });
      return;
    }

    const totRev = transactionsDuMois.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
    const totDep = transactionsDuMois.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
    const soldeMois = totRev - totDep;
    const dateAffichage = new Date(year, month - 1).toLocaleDateString(i18n.language || 'fr-FR', { month: 'long', year: 'numeric' });

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(30, 27, 75);
    doc.text(`Rapport financier du mois: ${dateAffichage.charAt(0).toUpperCase() + dateAffichage.slice(1)}`, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Édité le : ${new Date().toLocaleDateString(i18n.language || 'fr-FR')}`, 14, 28);

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total de Revenus : + ${formatDevise(totRev)}`, 20, 55);
    doc.text(`Total de Dépenses : - ${formatDevise(totDep)}`, 20, 62);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (soldeMois >= 0) {
      doc.setTextColor(16, 185, 129);
      doc.text(`Excédent : + ${formatDevise(soldeMois)}`, 20, 72);
    } else {
      doc.setTextColor(244, 63, 94);
      doc.text(`Déficit : ${formatDevise(soldeMois)}`, 20, 72);
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 27, 75);
    doc.setFont("helvetica", "normal");
    doc.text("Liste détaillée des transactions", 14, 90);

    const tableColumn = ["Date", "Titre", "Catégorie", "Type", "Montant"];
    const tableRows = transactionsDuMois.map(tx => [
      new Date(tx.date).toLocaleDateString(i18n.language || 'fr-FR'),
      tx.titre,
      tx.categorie?.nom || 'Général',
      tx.type === 'revenu' ? 'Revenu' : 'Dépense',
      `${tx.type === 'revenu' ? '+' : '-'}${tx.montant} MAD`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [30, 27, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] }
    });

    doc.save(`MyBudget_Rapport_${reportMonth}.pdf`);
  };

  const totalRevenus = filteredTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0);
  const totalDepenses = filteredTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);
  const soldeGlobal = allTransactions.filter(t => t.type === 'revenu').reduce((acc, t) => acc + t.montant, 0)
    - allTransactions.filter(t => t.type === 'depense').reduce((acc, t) => acc + t.montant, 0);

  const depMap = {};
  const revMap = {};

  filteredTransactions.forEach(tx => {
    const nomCat = tx.categorie?.nom || 'Général';
    const couleurCat = tx.categorie?.couleur || (tx.type === 'revenu' ? '#10b981' : '#f43f5e');

    if (tx.type === 'depense') {
      if (!depMap[nomCat]) depMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 };
      depMap[nomCat].total += tx.montant;
    } else {
      if (!revMap[nomCat]) revMap[nomCat] = { nom: nomCat, couleur: couleurCat, total: 0 };
      revMap[nomCat].total += tx.montant;
    }
  });

  const depensesData = Object.values(depMap).sort((a, b) => b.total - a.total);
  const revenusData = Object.values(revMap).sort((a, b) => b.total - a.total);

  const optionsDoughnut = { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } };

  const doughnutDepenses = {
    labels: depensesData.length > 0 ? depensesData.map(c => c.nom) : [t('dashboard.empty', 'Aucune dépense')],
    datasets: [{
      data: depensesData.length > 0 ? depensesData.map(c => c.total) : [1],
      backgroundColor: depensesData.length > 0 ? depensesData.map(c => c.couleur) : [isDarkMode ? '#334155' : '#f1f5f9'],
      borderWidth: 0, hoverOffset: 4
    }]
  };

  const doughnutRevenus = {
    labels: revenusData.length > 0 ? revenusData.map(c => c.nom) : [t('dashboard.empty', 'Aucun revenu')],
    datasets: [{
      data: revenusData.length > 0 ? revenusData.map(c => c.total) : [1],
      backgroundColor: revenusData.length > 0 ? revenusData.map(c => c.couleur) : [isDarkMode ? '#334155' : '#f1f5f9'],
      borderWidth: 0, hoverOffset: 4
    }]
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#f4f7fb] dark:bg-slate-900 dark:text-white transition-colors duration-300">Chargement...</div>;

  return (
    <>
      <WelcomeOnboarding onComplete={fetchDashboardData} />
      <div className="h-screen overflow-hidden bg-[#f4f7fb] dark:bg-slate-900 flex font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Sidebar />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-20 shrink-0 px-8 flex justify-between items-center bg-[#f4f7fb] dark:bg-slate-900 transition-colors duration-300">
            
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/Transactions')} className="bg-slate-900 dark:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-800 dark:hover:bg-blue-700 transition">
                <PlusCircle size={16} /> {t('header.add', 'Ajouter')}
              </button>

              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="px-3 border-r border-slate-200 dark:border-slate-700">
                  <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 outline-none py-2 cursor-pointer" />
                </div>
                <button onClick={genererRapportMensuel} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm transition-colors" title="Générer le rapport">
                  <Download size={16} /> Rapport
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              
              

              {/* 🌙 DARK MODE TOGGLE */}
              <div onClick={toggleDarkMode} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <span className="text-sm hidden sm:block">{t('header.darkMode', 'Mode Sombre')}</span>
                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
              </div>

            </div>
          </header>

          <div className="flex-1 px-8 pb-6 max-w-[1600px] w-full mx-auto overflow-hidden flex flex-col min-h-0">
            <div className="shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors duration-300">
              <div className="flex gap-1 overflow-x-auto w-full md:w-auto p-1">
                {['day', 'week', 'month', 'year', 'all'].map((filter) => {
                  // 💡 CORRECTION DU BUG ICI : 'day' pointe vers la clé 'today' du JSON
                  const jsonKey = filter === 'day' ? 'today' : filter;
                  const fallbackTxt = filter === 'day' ? "Aujourd'hui" : filter === 'week' ? 'Semaine' : filter === 'month' ? 'Ce mois' : filter === 'year' ? 'Cette année' : 'Tout';
                  
                  return (
                    <button key={filter} onClick={() => { setTimeFilter(filter); setShowCustomPicker(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${timeFilter === filter ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                      {t(`filters.${jsonKey}`, fallbackTxt)} 
                    </button>
                  )
                })}
                <button onClick={() => { setTimeFilter('custom'); setShowCustomPicker(true); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${timeFilter === 'custom' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                  <Calendar size={16} /> {t('filters.custom', 'Personnalisée')}
                </button>
              </div>

              {showCustomPicker && (
                <div className="flex items-center gap-3 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl animate-fade-in transition-colors">
                  <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Du:</span>
                  <input type="date" value={customDates.start} onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })} className="bg-white dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-sm outline-none text-slate-700 dark:text-slate-200 shadow-sm" />
                  <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300 ml-2">Au:</span>
                  <input type="date" value={customDates.end} onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })} className="bg-white dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-sm outline-none text-slate-700 dark:text-slate-200 shadow-sm" />
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
              
              {/* stats revenus */}
              <div className="flex flex-col gap-4 min-h-0">
                <div className="shrink-0 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('dashboard.income', 'Revenus')}</h3>
                  </div>
                  <div className="relative h-40 flex justify-center">
                    <Doughnut data={doughnutRevenus} options={optionsDoughnut} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-emerald-500 dark:text-emerald-400 w-full px-4 text-center truncate" title={formatDevise(totalRevenus)}>{formatDeviseCompact(totalRevenus)} 
                      </span>
                    </div>
                  </div>
                </div>

                {/* DETAILS REVENUS */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                  <div className="shrink-0 flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-slate-200">{t('dashboard.incomeDetails', 'Détails Revenus')}</h3></div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                    {revenusData.map((cat, idx) => {
                      const pct = totalRevenus > 0 ? Math.round((cat.total / totalRevenus) * 100) : 0;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-700 dark:text-slate-300">{cat.nom}</span><span className="text-slate-500 dark:text-slate-400">{pct}%</span></div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.couleur }}></div></div>
                        </div>
                      );
                    })}
                    {revenusData.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>

              {/* stats depenses */}
              <div className="flex flex-col gap-4 min-h-0">
                <div className="shrink-0 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('dashboard.expenses', 'Dépenses')}</h3>
                  </div>
                  <div className="relative h-40 flex justify-center">
                    <Doughnut data={doughnutDepenses} options={optionsDoughnut} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold text-rose-500 dark:text-rose-400 w-full px-4 text-center truncate" title={formatDevise(totalDepenses)}>{formatDeviseCompact(totalDepenses)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DETAILS DEPENSES */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                  <div className="shrink-0 flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 dark:text-slate-200">{t('dashboard.expensesDetails', 'Détails Dépenses')}</h3></div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                    {depensesData.map((cat, idx) => {
                      const pct = totalDepenses > 0 ? Math.round((cat.total / totalDepenses) * 100) : 0;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-700 dark:text-slate-300">{cat.nom}</span><span className="text-slate-500 dark:text-slate-400">{pct}%</span></div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5"><div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.couleur }}></div></div>
                        </div>
                      );
                    })}
                    {depensesData.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>

              {/* solde global et liste des transactions */}
              <div className="flex flex-col gap-4 min-h-0">
                <div className="shrink-0 grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-rose-400 to-rose-500 p-4 rounded-3xl text-white shadow-md shadow-rose-200 dark:shadow-none">
                    <p className="text-[11px] opacity-90 mb-1 uppercase tracking-wide">{t('dashboard.expenses', 'Dépenses')}</p>
                    <div className="flex items-center justify-between"><span className="text-lg font-bold">{formatDevise(totalDepenses)}</span><ArrowDownRight size={16} className="opacity-80" /></div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 p-4 rounded-3xl text-white shadow-md shadow-emerald-200 dark:shadow-none">
                    <p className="text-[11px] opacity-90 mb-1 uppercase tracking-wide">{t('dashboard.income', 'Revenus')}</p>
                    <div className="flex items-center justify-between"><span className="text-lg font-bold">{formatDevise(totalRevenus)}</span><ArrowUpRight size={16} className="opacity-80" /></div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-3xl text-white shadow-md shadow-orange-200 dark:shadow-none col-span-2">
                    <p className="text-[17px] opacity-90 mb-1 uppercase tracking-wide">{t('dashboard.balance', 'Solde Global')}</p>
                    <div className="flex items-center justify-between"><span className="text-2xl font-bold">{formatDevise(soldeGlobal)}</span></div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-colors">
                  <div className="shrink-0 flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">{t('dashboard.transactions', 'Transactions')}</h3>
                    <span onClick={() => navigate('/Transactions')} className="text-xs font-bold text-blue-500 dark:text-blue-400 cursor-pointer hover:underline">{t('dashboard.seeAll', 'Voir tout')}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-3">
                    {filteredTransactions.slice(0, 200).map((tx) => (
                      <div key={tx._id} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-700/50 pb-2.5 last:border-0 last:pb-0">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{tx.titre}</h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{tx.categorie?.nom || 'Général'} • {formaterDateCourte(tx.date)}</p>
                        </div>
                        <span className={`text-sm font-bold ${tx.type === 'revenu' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                          {tx.type === 'revenu' ? '+' : '-'}{formatDevise(tx.montant)}
                        </span>
                      </div>
                    ))}
                    {filteredTransactions.length === 0 && <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t('dashboard.empty', 'Aucune transaction.')}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;