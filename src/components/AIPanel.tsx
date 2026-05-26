import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Loader2, Brain, Check, RefreshCw, X, AlertTriangle, ArrowRight, Lightbulb } from "lucide-react";
import { ImprovementResult, ImprovementSuggestion } from "../types";

interface AIPanelProps {
  textA: string;
  textB: string;
  onApplySuggestion: (originalFragment: string, suggestedFragment: string) => void;
}

export default function AIPanel({ textA, textB, onApplySuggestion }: AIPanelProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImprovementResult | null>(null);
  const [appliedFragments, setAppliedFragments] = useState<Set<string>>(new Set());

  const loadingPhrases = [
    "Iniciando análise com Gemini...",
    "Comparando Texto A e Texto B...",
    "Refinando fluidez e gramática...",
    "Projetando sugestões de coesão...",
    "Finalizando formatação das dicas...",
  ];
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState<number>(0);

  const fetchSuggestions = async () => {
    if (!textA.trim() || !textB.trim()) {
      setError("É necessário preencher ambos os textos para obter sugestões do Gemini.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAppliedFragments(new Set());
    setLoadingPhraseIndex(0);

    // Dynamic phrase rotation to delight the user in high-density premium style
    const phraseInterval = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 1800);

    try {
      const response = await fetch("/api/suggest-improvements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textA, textB }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao consultar o serviço do Gemini.");
      }

      const data: ImprovementResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro inesperado. Verifique se o servidor está ativo.");
    } finally {
      clearInterval(phraseInterval);
      setLoading(false);
    }
  };

  const handleApply = (suggestion: ImprovementSuggestion) => {
    onApplySuggestion(suggestion.original_fragment, suggestion.suggested_fragment);
    
    // Track applied suggestion to change visual state of button
    setAppliedFragments((prev) => {
      const next = new Set(prev);
      next.add(suggestion.original_fragment);
      return next;
    });
  };

  return (
    <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-5 mt-4" id="ai-panel-root">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-indigo-100 text-indigo-700 font-bold uppercase tracking-widest text-[9px] rounded-md flex items-center gap-1.5 animate-pulse">
            <Brain className="w-3.5 h-3.5" />
            <span>Gemini AI</span>
          </div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Assistente de Escrita & Revisão
          </h3>
        </div>
        {!loading && !result && (
          <button
            onClick={fetchSuggestions}
            disabled={!textA.trim() || !textB.trim()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Sugerir melhorias</span>
          </button>
        )}
        {result && (
          <button
            onClick={fetchSuggestions}
            className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/85 border border-indigo-200 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
            title="Gerar novas sugestões com a versão atual"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Atualizar Análise</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {loadingPhrases[loadingPhraseIndex]}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
              O Gemini está avaliando seu texto e gerando sugestões sob medida para torná-lo formidável.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-150 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide mb-1">
                Falha na sugestão de revisões
              </h4>
              <p className="text-xs text-red-700">{error}</p>
              <button
                onClick={fetchSuggestions}
                className="mt-2.5 text-xs font-bold text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Tentar novamente
              </button>
            </div>
          </motion.div>
        )}

        {!loading && !error && !result && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-6 border border-dashed border-slate-200 rounded-lg bg-white"
          >
            <Lightbulb className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-[11px] font-bold text-slate-650 uppercase tracking-widest leading-relaxed">
              Conselhos de Revisão Gramatical e Vocabulário
            </p>
            <p className="text-[10px] text-slate-400 mt-1 max-w-md mx-auto leading-normal px-4">
              Preencha os textos A (Original) e B (Modificado) acima e acione o botão para que a inteligência artificial do Gemini
              gere sugestões e permita que você as aplique pontualmente com um clique.
            </p>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* General Advice block */}
            {result.general_advice && (
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                    Parecer Geral do Analista Gemini
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {result.general_advice}
                </p>
              </div>
            )}

            {/* Individual Suggestion Cards */}
            {result.suggestions && result.suggestions.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Recomendações de Trechos ({result.suggestions.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.suggestions.map((s, idx) => {
                    const isApplied = appliedFragments.has(s.original_fragment);
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-4 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          {/* Segment mapping */}
                          <div className="space-y-2 mb-3">
                            <div className="bg-red-50 border-l-2 border-red-400 p-2 rounded text-xs">
                              <span className="text-[9px] font-bold text-red-500 uppercase block select-none tracking-wider mb-0.5">
                                Em Texto B:
                              </span>
                              <span className="text-red-950 font-mono text-[11px] line-through decoration-red-300">
                                {s.original_fragment}
                              </span>
                            </div>
                            <div className="flex justify-center text-slate-300">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="bg-green-50 border-l-2 border-green-400 p-2 rounded text-xs bg-emerald-50/50 border-emerald-400">
                              <span className="text-[9px] font-bold text-emerald-600 uppercase block select-none tracking-wider mb-0.5">
                                Sugestão:
                              </span>
                              <span className="text-emerald-950 font-mono text-[11px] font-bold">
                                {s.suggested_fragment}
                              </span>
                            </div>
                          </div>

                          {/* Explanation */}
                          <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100 leading-normal mb-3">
                            {s.explanation}
                          </p>
                        </div>

                        {/* Apply Action */}
                        <div className="flex justify-end pt-1">
                          {isApplied ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-650 bg-emerald-50 border border-green-200 px-2.5 py-1 rounded-lg">
                              <Check className="w-3.5 h-3.5" />
                              <span>Aplicado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApply(s)}
                              className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-200 rounded-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95"
                            >
                              Aplicar mudança
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-slate-450 italic py-2">
                O Gemini analisou os fragmentos e achou que o texto modificado (B) já está muito bem escrito e não precisa de ajustes locais!
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
