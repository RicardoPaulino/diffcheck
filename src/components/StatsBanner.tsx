import { DiffStats } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, ChevronRight, PlusCircle, MinusCircle, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsBannerProps {
  stats: DiffStats;
}

export default function StatsBanner({ stats }: StatsBannerProps) {
  const { additions, deletions, totalWordsA, totalWordsB, similarityPercentage } = stats;

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (percentage > 70) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-sky-600 bg-sky-50 border-sky-100';
  };

  const getPercentageBarColor = (percentage: number) => {
    if (percentage === 100) return 'bg-emerald-500';
    if (percentage > 70) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {/* Similarity Percentage Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors"
        id="stats-similarity-card"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Similaridade</span>
          <Percent className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">{similarityPercentage}%</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-405 font-semibold uppercase">compatível</span>
        </div>
        <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1 overflow-hidden">
          <motion.div 
            className={`h-full ${getPercentageBarColor(similarityPercentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${similarityPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Additions Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors"
        id="stats-additions-card"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Adições</span>
          <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <div>
          <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">+{additions}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-405 font-medium">caracteres inseridos</p>
        </div>
      </motion.div>

      {/* Deletions Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors"
        id="stats-deletions-card"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Remoções</span>
          <MinusCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        </div>
        <div>
          <span className="text-2xl font-bold font-mono tracking-tight text-red-600 dark:text-red-400">-{deletions}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-405 font-medium">caracteres removidos</p>
        </div>
      </motion.div>

      {/* Summary Message Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors"
        id="stats-words-card"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Extensão</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono">A → B</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono leading-none">{totalWordsA}</div>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Palavras A</p>
          </div>
          <ArrowRight className="w-3 text-slate-400" />
          <div>
            <div className="text-base font-bold text-slate-800 dark:text-slate-200 font-mono leading-none">{totalWordsB}</div>
            <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Palavras B</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-550 dark:text-slate-400 mt-1.5 truncate flex items-center gap-1">
          {similarityPercentage === 100 ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-[9px]">Textos Idênticos</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="uppercase tracking-wider font-bold text-[9px] text-indigo-705 dark:text-indigo-400">Diferenças Analisadas</span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
