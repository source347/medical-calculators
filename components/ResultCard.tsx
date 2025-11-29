import React, { useState } from 'react';
import { CalculationResult, Calculator } from '../types';
import { Sparkles, Loader2, AlertTriangle, CheckCircle, Info, Share2, Copy, Check } from 'lucide-react';
import { getClinicalInterpretation } from '../services/geminiService';

interface Props {
  result: CalculationResult | null;
  calculator: Calculator;
  inputs: Record<string, any>;
}

export const ResultCard: React.FC<Props> = ({ result, calculator, inputs }) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!result) return (
    <div className="mt-8 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center transition-colors">
      <p className="text-gray-400 dark:text-gray-500 font-medium">Enter values to see results</p>
    </div>
  );

  const getSeverityColor = (s?: string) => {
    switch(s) {
      case 'critical': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/30';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/30';
      case 'normal': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/30';
      default: return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/30';
    }
  };

  const getSeverityIcon = (s?: string) => {
    switch(s) {
      case 'critical': return <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'warning': return <Info className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'normal': return <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />;
      default: return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
    }
  };

  const handleAiAnalyze = async () => {
    setLoadingAi(true);
    const analysis = await getClinicalInterpretation(calculator, inputs, result);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const handleShare = async () => {
    const text = `MediCalc Report\n\nCalculator: ${calculator.name}\nResult: ${result.value} ${result.unit || ''}\nInterpretation: ${result.interpretation || 'N/A'}\n\nDisclaimer: Educational use only.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediCalc Result',
          text: text,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-6 space-y-4 animate-fade-in">
      <div className={`relative rounded-xl border p-6 ${getSeverityColor(result.severity)} shadow-sm transition-all`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Result</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">{result.value}</span>
              {result.unit && <span className="text-lg opacity-80 font-medium">{result.unit}</span>}
            </div>
            {result.interpretation && (
              <p className="mt-2 text-lg font-medium leading-6 opacity-90">
                {result.interpretation}
              </p>
            )}
          </div>
          <div className="p-2 bg-white/40 dark:bg-black/20 rounded-full">
            {getSeverityIcon(result.severity)}
          </div>
        </div>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-14 p-2 text-current opacity-60 hover:opacity-100 transition-opacity rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          title="Share Result"
        >
          {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
        </button>
      </div>

      {!aiAnalysis ? (
        <button
          onClick={handleAiAnalyze}
          disabled={loadingAi}
          className="w-full group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-white shadow-lg transition-all hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loadingAi ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          <span className="font-semibold">Explain with AI</span>
        </button>
      ) : (
        <div className="rounded-xl border border-violet-100 dark:border-violet-900/50 bg-white dark:bg-slate-800 p-5 shadow-sm ring-1 ring-violet-50 dark:ring-violet-900/20">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">AI Clinical Interpretation</h4>
            </div>
            <div className="prose prose-sm prose-indigo dark:prose-invert text-gray-600 dark:text-gray-300 max-w-none">
                {aiAnalysis.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 last:mb-0">{line}</p>
                ))}
            </div>
            <p className="mt-4 text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-2">
                Disclaimer: AI-generated content is for educational purposes only. Verify with standard clinical guidelines.
            </p>
        </div>
      )}

      {/* Persistent Disclaimer */}
      <div className="mt-4 text-[10px] text-gray-400 text-center leading-tight">
        <p>This tool is for educational purposes only. Results should not be used as the sole basis for clinical decisions. Always verify with official guidelines.</p>
      </div>
    </div>
  );
};