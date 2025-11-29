import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator as CalcIcon, Stethoscope, Menu, X, ChevronLeft, Heart, Brain, Activity, Droplets, Zap, ShieldAlert, Wind, Scale, TestTube, Baby, Bandage, Utensils, Thermometer, Scissors, Target, Siren, Sun, Moon, AlertTriangle } from 'lucide-react';
import { CALCULATORS } from './data/calculators';
import { Calculator, CalculatorCategory } from './types';
import { CalculatorInput } from './components/CalculatorInput';
import { ResultCard } from './components/ResultCard';

// Category Icons Map
const CategoryIcons: Record<CalculatorCategory | string, React.ReactNode> = {
  Cardiology: <Heart className="h-5 w-5" />,
  Nephrology: <Droplets className="h-5 w-5" />,
  Neurology: <Brain className="h-5 w-5" />,
  Emergency: <ShieldAlert className="h-5 w-5" />,
  Hepatology: <Activity className="h-5 w-5" />,
  General: <Stethoscope className="h-5 w-5" />,
  Pulmonology: <Wind className="h-5 w-5" />,
  Endocrinology: <Scale className="h-5 w-5" />,
  Hematology: <TestTube className="h-5 w-5" />,
  Pediatrics: <Baby className="h-5 w-5" />,
  Obstetrics: <Baby className="h-5 w-5" />,
  Trauma: <Bandage className="h-5 w-5" />,
  Gastroenterology: <Utensils className="h-5 w-5" />,
  'Critical Care': <Zap className="h-5 w-5" />,
  'Infectious Disease': <Thermometer className="h-5 w-5" />,
  Surgery: <Scissors className="h-5 w-5" />,
  Oncology: <Target className="h-5 w-5" />,
};

const DisclaimerModal = ({ onAccept }: { onAccept: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-700 transform transition-all animate-slide-up">
      <div className="flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-500">
        <AlertTriangle className="h-8 w-8" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Medical Disclaimer</h2>
      </div>
      <div className="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-300 mb-6">
        <p>
          <strong>MediCalc Pro AI</strong> is a clinical decision support tool intended for use by healthcare professionals for educational purposes only.
        </p>
        <p>
          It does not provide medical advice. The calculations and AI interpretations should <strong>never</strong> be used as the sole basis for patient management decisions. Always verify results with standard clinical guidelines and your own professional judgment.
        </p>
      </div>
      <button
        onClick={onAccept}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
      >
        I Understand & Accept
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [selectedCalcId, setSelectedCalcId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(true); // Default true to avoid flash, check effect

  // Initialize Settings
  useEffect(() => {
    // Theme
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');

    // Disclaimer
    const accepted = localStorage.getItem('medical_disclaimer_accepted');
    if (!accepted) setDisclaimerAccepted(false);
  }, []);

  const toggleTheme = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const acceptDisclaimer = () => {
    localStorage.setItem('medical_disclaimer_accepted', 'true');
    setDisclaimerAccepted(true);
  };
  
  // Calculator State
  const [inputs, setInputs] = useState<Record<string, any>>({});
  
  // Reset inputs when calculator changes
  useEffect(() => {
    if (selectedCalcId) {
      const calc = CALCULATORS.find(c => c.id === selectedCalcId);
      if (calc) {
        const defaults: Record<string, any> = {};
        calc.inputs.forEach(i => {
            defaults[i.id] = i.defaultValue ?? (i.type === 'boolean' ? false : 0);
        });
        setInputs(defaults);
      }
    }
  }, [selectedCalcId]);

  const filteredCalculators = useMemo(() => {
    return CALCULATORS.filter(calc => {
      const matchesSearch = calc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            calc.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            calc.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || calc.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const categories = ['All', ...Array.from(new Set(CALCULATORS.map(c => c.category))).sort()];

  const selectedCalculator = useMemo(() => 
    CALCULATORS.find(c => c.id === selectedCalcId), 
  [selectedCalcId]);

  const result = useMemo(() => {
    if (!selectedCalculator) return null;
    try {
        return selectedCalculator.calculate(inputs);
    } catch (e) {
        return null;
    }
  }, [selectedCalculator, inputs]);

  const handleInputChange = (id: string, val: any) => {
    setInputs(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300`}>
      
      {!disclaimerAccepted && <DisclaimerModal onAccept={acceptDisclaimer} />}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSelectedCalcId(null); setSidebarOpen(false); }}>
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30">
                <CalcIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">MediCalc</h1>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Pro AI Edition</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 pt-6">
            <div>
              <h3 className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Specialties</h3>
              <div className="space-y-0.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setSidebarOpen(false); setSelectedCalcId(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      activeCategory === cat 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {CategoryIcons[cat] || <Zap className="h-4 w-4" />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-2">
                 <span>Version 3.1.0</span>
                 <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Offline Ready</span>
             </div>
             <p className="text-[10px] text-gray-300 dark:text-gray-600 text-center">
                 For educational use only.
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Universal Header */}
        <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-30 sticky top-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
                <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Global Search Bar (Desktop: Center, Mobile: Flex Grow) */}
          <div className="flex-1 max-w-xl mx-4 relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
             <input 
                type="text"
                placeholder="Search calculators (e.g. 'PE', 'GCS', 'Calcium')..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-800 border-none rounded-full text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 scroll-smooth">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-24">
            
            {!selectedCalculator ? (
              // Library Grid View
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCategory === 'All' ? 'Clinical Library' : activeCategory}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select a tool to begin calculation</p>
                    </div>
                    <span className="hidden sm:inline-flex text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">{filteredCalculators.length} tools</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCalculators.map(calc => (
                    <button
                      key={calc.id}
                      onClick={() => setSelectedCalcId(calc.id)}
                      className="flex flex-col text-left p-5 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all group duration-300"
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div className={`p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
                           {CategoryIcons[calc.category] || <Activity className="h-5 w-5" />}
                        </div>
                        {calc.shortName && <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-full">{calc.shortName}</span>}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{calc.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{calc.description}</p>
                    </button>
                  ))}
                  {filteredCalculators.length === 0 && (
                      <div className="col-span-full py-12 text-center">
                          <div className="bg-gray-100 dark:bg-slate-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Search className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-gray-900 dark:text-white font-medium">No results found</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
                      </div>
                  )}
                </div>
              </div>
            ) : (
              // Calculator Detail View
              <div className="animate-slide-up">
                 <button 
                  onClick={() => setSelectedCalcId(null)} 
                  className="group mb-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                 >
                   <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Library
                 </button>

                 <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-black/20 border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/50 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-700/10 dark:ring-blue-400/20">{selectedCalculator.category}</span>
                            {selectedCalculator.shortName && <span className="text-xs text-gray-400 font-mono">ID: {selectedCalculator.shortName}</span>}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedCalculator.name}</h2>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">{selectedCalculator.description}</p>
                    </div>

                    <div className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            {/* Inputs Column */}
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-6">
                                    <Activity className="h-4 w-4" />
                                    Clinical Inputs
                                </h3>
                                <div className="space-y-2">
                                    {selectedCalculator.inputs.map(input => (
                                        <CalculatorInput
                                            key={input.id}
                                            definition={input}
                                            value={inputs[input.id]}
                                            onChange={(val) => handleInputChange(input.id, val)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Results Column */}
                            <div className="xl:border-l xl:border-gray-100 dark:xl:border-gray-800 xl:pl-12">
                                <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-6">
                                    <Stethoscope className="h-4 w-4" />
                                    Assessment
                                </h3>
                                <ResultCard 
                                    result={result} 
                                    calculator={selectedCalculator}
                                    inputs={inputs}
                                />
                                
                                <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 mb-2">Clinical References:</p>
                                    <ul className="list-disc pl-4 space-y-1">
                                        {selectedCalculator.references?.map((ref, idx) => (
                                            <li key={idx} className="text-xs text-gray-500 dark:text-gray-400">{ref}</li>
                                        )) || <li className="text-xs text-gray-500 dark:text-gray-400">Standard Clinical Algorithm / MDCalc / UpToDate</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;