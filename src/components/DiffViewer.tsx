import { Change, ViewLayout, DiffMode } from '../types';
import { motion } from 'motion/react';
import { Copy, Check, Eye, ChevronUp, ChevronDown, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DiffViewerProps {
  changes: Change[];
  layout: ViewLayout;
  fontType: 'sans' | 'mono';
  mode: DiffMode;
}

interface HighlightInfo {
  globalIdx: number;
  type: 'added' | 'removed';
  value: string;
}

export default function DiffViewer({ changes, layout, fontType, mode }: DiffViewerProps) {
  const [copiedState, setCopiedState] = useState<'none' | 'left' | 'right' | 'unified'>('none');
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number>(-1);

  const fontClass = fontType === 'mono' ? 'font-mono text-xs md:text-sm' : 'font-sans text-sm md:text-base';

  // Compute index of highlight spans to navigate them smoothly
  const highlights: HighlightInfo[] = [];
  changes.forEach((change, idx) => {
    if (change.added) {
      highlights.push({ globalIdx: idx, type: 'added', value: change.value });
    } else if (change.removed) {
      highlights.push({ globalIdx: idx, type: 'removed', value: change.value });
    }
  });

  // Reset highlight index when changes set is rebuilt
  useEffect(() => {
    setActiveHighlightIndex(-1);
  }, [changes]);

  const copyToClipboard = async (type: 'left' | 'right' | 'unified', textContent: string) => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopiedState(type);
      setTimeout(() => setCopiedState('none'), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const scrollToHighlight = (highlightIndex: number) => {
    const hl = highlights[highlightIndex];
    if (!hl) return;

    // Timeout to make sure render/layout is updated if any
    setTimeout(() => {
      const el = document.querySelector(`[data-diff-node="${hl.globalIdx}"]`);
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        // Add a highlight ring with transition to clearly see the scrolled location
        el.classList.add('ring-3', 'ring-indigo-600', 'ring-offset-2', 'transition-all', 'duration-300');
        setTimeout(() => {
          el.classList.remove('ring-3', 'ring-indigo-600', 'ring-offset-2');
        }, 1200);
      }
    }, 50);
  };

  const handleNext = () => {
    if (highlights.length === 0) return;
    const nextIdx = (activeHighlightIndex + 1) % highlights.length;
    setActiveHighlightIndex(nextIdx);
    scrollToHighlight(nextIdx);
  };

  const handlePrev = () => {
    if (highlights.length === 0) return;
    const prevIdx = (activeHighlightIndex - 1 + highlights.length) % highlights.length;
    setActiveHighlightIndex(prevIdx);
    scrollToHighlight(prevIdx);
  };

  // Extract raw text for side A (original minus added items)
  const textA = changes
    .filter((c) => !c.added)
    .map((c) => c.value)
    .join('');

  // Extract raw text for side B (new minus removed items)
  const textB = changes
    .filter((c) => !c.removed)
    .map((c) => c.value)
    .join('');

  return (
    <div className="w-full flex flex-col gap-4" id="diff-viewer-root">
      {/* High Density Navigation toolbar */}
      {highlights.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2.5 bg-slate-800 text-white rounded-xl shadow-xs gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Navegador de Alterações</span>
            <span className="text-[10px] bg-slate-700 font-semibold px-2 py-0.5 rounded text-indigo-300">
              {highlights.length} {highlights.length === 1 ? 'diferença' : 'diferenças'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-medium">
              {activeHighlightIndex === -1 ? (
                <span className="text-slate-400 font-bold text-[10px] uppercase">Nenhuma selecionada</span>
              ) : (
                <span>
                  Alteração <strong className="text-indigo-300 font-bold">{activeHighlightIndex + 1}</strong> de{' '}
                  <strong className="font-bold">{highlights.length}</strong> ({highlights[activeHighlightIndex].type === 'added' ? 'Adição' : 'Remoção'})
                </span>
              )}
            </span>

            <div className="flex gap-1 bg-slate-700 p-0.5 rounded-lg border border-slate-600">
              <button
                onClick={handlePrev}
                className="p-1 px-2.5 hover:bg-slate-600 active:bg-slate-500 rounded text-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                title="Alteração anterior"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                onClick={handleNext}
                className="p-1 px-2.5 hover:bg-slate-600 active:bg-slate-500 rounded text-slate-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold border-l border-slate-600"
                title="Próxima alteração"
              >
                <span>Próxima</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {layout === 'inline' ? (
        /* ==================== UNIFIED / INLINE VIEW ==================== */
        <motion.div
          key="inline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Visualização Mesclada</span>
            </div>
            <button
              onClick={() => {
                const plainText = changes
                  .map((c) => {
                     if (c.added) return `[+] ${c.value}`;
                     if (c.removed) return `[-] ${c.value}`;
                     return c.value;
                  })
                  .join('');
                copyToClipboard('unified', plainText);
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 hover:border-indigo-150 rounded transition-all cursor-pointer font-semibold"
              title="Copiar resultado com anotações de mudanças"
            >
              {copiedState === 'unified' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-700 font-bold">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar Mesclado</span>
                </>
              )}
            </button>
          </div>

          {/* Render box */}
          <div className={`p-5 min-h-[160px] max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed ${fontClass} bg-white`}>
            {changes.map((change, idx) => {
              const isSelected = activeHighlightIndex !== -1 && highlights[activeHighlightIndex]?.globalIdx === idx;
              const selectionStyle = isSelected ? 'bg-indigo-200 ring-2 ring-indigo-400 text-indigo-950 scale-[1.01]' : '';

              if (change.added) {
                return (
                  <span
                    key={idx}
                    data-diff-node={idx}
                    className={`bg-green-105 text-green-850 px-1 py-[1.5px] rounded border-b border-green-200 mx-0.5 inline bg-green-100 ${selectionStyle}`}
                    title="Adicionado"
                  >
                    {change.value}
                  </span>
                );
              }
              if (change.removed) {
                return (
                  <span
                    key={idx}
                    data-diff-node={idx}
                    className={`bg-red-105 text-red-850 line-through decoration-red-300 px-1 py-[1.5px] rounded mx-0.5 inline bg-red-100 ${selectionStyle}`}
                    title="Removido"
                  >
                    {change.value}
                  </span>
                );
              }
              return <span key={idx} className="text-slate-700">{change.value}</span>;
            })}
          </div>
        </motion.div>
      ) : (
        /* ==================== SPLIT / SIDE-BY-SIDE VIEW ==================== */
        <motion.div
          key="split"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Left panel: Original (Text A) with DELETIONS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="panel-original">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Texto A (Original)</span>
              <button
                onClick={() => copyToClipboard('left', textA)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded transition-all cursor-pointer font-semibold bg-white"
              >
                {copiedState === 'left' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Original</span>
                  </>
                )}
              </button>
            </div>
            <div className={`p-5 min-h-[160px] max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed ${fontClass} bg-white flex-1`}>
              {changes.map((change, idx) => {
                const isSelected = activeHighlightIndex !== -1 && highlights[activeHighlightIndex]?.globalIdx === idx;
                const selectionStyle = isSelected ? 'bg-indigo-200 ring-2 ring-indigo-400 text-indigo-950 scale-[1.01]' : '';

                if (change.added) {
                  // Omit added chunks in original panel
                  return null;
                }
                if (change.removed) {
                  return (
                    <span
                      key={idx}
                      data-diff-node={idx}
                      className={`text-red-850 line-through decoration-red-300 px-1 py-[1.5px] rounded mx-0.5 inline bg-red-100 ${selectionStyle}`}
                      title="Removido"
                    >
                      {change.value}
                    </span>
                  );
                }
                return <span key={idx} className="text-slate-700 inline">{change.value}</span>;
              })}
            </div>
          </div>

          {/* Right panel: Modernized (Text B) with ADDITIONS */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="panel-modificado">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-550 uppercase tracking-widest text-indigo-600">Texto B (Modificado)</span>
              <button
                onClick={() => copyToClipboard('right', textB)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-150 rounded transition-all cursor-pointer font-semibold bg-white"
              >
                {copiedState === 'right' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Modificado</span>
                  </>
                )}
              </button>
            </div>
            <div className={`p-5 min-h-[160px] max-h-[500px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed ${fontClass} bg-white flex-1`}>
              {changes.map((change, idx) => {
                const isSelected = activeHighlightIndex !== -1 && highlights[activeHighlightIndex]?.globalIdx === idx;
                const selectionStyle = isSelected ? 'bg-indigo-200 ring-2 ring-indigo-400 text-indigo-950 scale-[1.01]' : '';

                if (change.removed) {
                  // Omit removed chunks in modified panel
                  return null;
                }
                if (change.added) {
                  return (
                    <span
                      key={idx}
                      data-diff-node={idx}
                      className={`text-green-850 px-1 py-[1.5px] rounded border-b border-green-250 mx-0.5 inline bg-green-100 ${selectionStyle}`}
                      title="Adicionado"
                    >
                      {change.value}
                    </span>
                  );
                }
                return <span key={idx} className="text-slate-700 inline">{change.value}</span>;
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
