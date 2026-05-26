import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Settings2, 
  ArrowLeftRight, 
  Trash2, 
  Type, 
  Check, 
  Sparkles,
  Columns,
  Rows,
  AlignLeft,
  Binary,
  BookOpen,
  Scale,
  Copy
} from 'lucide-react';
import { SAMPLES } from './data/samples';
import { DiffMode, ViewLayout, DiffStats } from './types';
import { getDiff, calculateStats } from './utils/diffUtils';
import StatsBanner from './components/StatsBanner';
import DiffViewer from './components/DiffViewer';
import AIPanel from './components/AIPanel';

export default function App() {
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');
  const [diffMode, setDiffMode] = useState<DiffMode>('words');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('split');
  const [fontType, setFontType] = useState<'sans' | 'mono'>('sans');
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [copiedInput, setCopiedInput] = useState<'none' | 'A' | 'B'>('none');

  // Load the first sample (Cláusula Contratual) on mount to demonstrate the app's power instantly!
  useEffect(() => {
    if (SAMPLES && SAMPLES.length > 0) {
      setTextA(SAMPLES[0].textA);
      setTextB(SAMPLES[0].textB);
    }
  }, []);

  const handleSelectSample = (sampleId: string) => {
    const selected = SAMPLES.find(s => s.id === sampleId);
    if (selected) {
      setTextA(selected.textA);
      setTextB(selected.textB);
    }
  };

  const handleSwapTexts = () => {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
  };

  const handleClear = () => {
    setTextA('');
    setTextB('');
  };

  const handleApplySuggestion = (originalFragment: string, suggestedFragment: string) => {
    setTextB((prev) => {
      if (prev.includes(originalFragment)) {
        return prev.replace(originalFragment, suggestedFragment);
      }
      const index = prev.toLowerCase().indexOf(originalFragment.toLowerCase());
      if (index !== -1) {
        return prev.substring(0, index) + suggestedFragment + prev.substring(index + originalFragment.length);
      }
      return prev;
    });
  };

  // Generate diff changes dynamically
  const changes = useMemo(() => {
    return getDiff(textA, textB, diffMode, ignoreCase);
  }, [textA, textB, diffMode, ignoreCase]);

  // Compute stats
  const stats = useMemo(() => {
    return calculateStats(changes, textA, textB);
  }, [changes, textA, textB]);

  const copyInputText = async (type: 'A' | 'B', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedInput(type);
      setTimeout(() => setCopiedInput('none'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const isBothEmpty = !textA && !textB;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-800 font-sans flex flex-col justify-between" id="app-wrapper">
      {/* Navbar directly matching the Design style */}
      <nav className="h-16 flex items-center justify-between px-6 md:px-8 bg-white border-b border-slate-200 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <Scale className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900">
            DiffCheck<span className="text-indigo-600">Modern</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
            Comparador de Textos
          </span>
        </div>

        {/* Quick preset selector inside navbar or header */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            Exemplos:
          </span>
          <div className="flex gap-1">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-md transition-all cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Container with High Density padding */}
      <main className="flex-1 p-4 md:p-6 flex flex-col gap-5 max-w-7xl w-full mx-auto">
        
        {/* Mobile samples container */}
        <div className="md:hidden bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Selecione um Exemplo:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample.id)}
                className="px-2.5 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 transition-all cursor-pointer"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Areas Section with original/modified slate-like headers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5" id="section-inputs">
          {/* TextArea Original (A) */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm" id="col-text-a">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Texto Original (A)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyInputText('A', textA)}
                    disabled={!textA}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Copiar Texto A"
                  >
                    {copiedInput === 'A' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setTextA('')}
                    disabled={!textA}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Limpar Texto A"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {textA.split(/\s+/).filter(Boolean).length} palavras / {textA.length} ch
                </span>
              </div>
            </div>
            
            <textarea
              className="w-full h-44 p-4 text-xs font-mono leading-relaxed text-slate-600 bg-white rounded-b-xl outline-none resize-none transition-all placeholder-slate-450 focus:bg-slate-50/20"
              placeholder="Cole aqui o seu texto original (A)..."
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              id="textarea-a"
            />
          </div>

          {/* TextArea Modified (B) */}
          <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm" id="col-text-b">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Texto Modificado (B)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyInputText('B', textB)}
                    disabled={!textB}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Copiar Texto B"
                  >
                    {copiedInput === 'B' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setTextB('')}
                    disabled={!textB}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                    title="Limpar Texto B"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {textB.split(/\s+/).filter(Boolean).length} palavras / {textB.length} ch
                </span>
              </div>
            </div>
            
            <textarea
              className="w-full h-44 p-4 text-xs font-mono leading-relaxed text-slate-600 bg-white rounded-b-xl outline-none resize-none transition-all placeholder-slate-450 focus:bg-slate-50/20"
              placeholder="Cole aqui o seu texto modificado (B)..."
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              id="textarea-b"
            />
          </div>
        </section>

        {/* Global Toolbar and Controls with High Density layout */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4" id="toolbar-controls">
          <div className="flex flex-wrap items-center gap-5">
            {/* Diff Mode (Word / Char / Line) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Granularidade</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setDiffMode('words')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${diffMode === 'words' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  Palavras
                </button>
                <button
                  onClick={() => setDiffMode('chars')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${diffMode === 'chars' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  Caracteres
                </button>
                <button
                  onClick={() => setDiffMode('lines')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${diffMode === 'lines' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  Linhas
                </button>
              </div>
            </div>

            {/* Layout (Split / Inline) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modo de Exibição</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewLayout('split')}
                  className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 ${viewLayout === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  <Columns className="w-3 h-3" />
                  Side-by-Side
                </button>
                <button
                  onClick={() => setViewLayout('inline')}
                  className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 ${viewLayout === 'inline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  <AlignLeft className="w-3 h-3" />
                  Unified
                </button>
              </div>
            </div>

            {/* Font Selector (Sans / Mono) */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estilo da Fonte</label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setFontType('sans')}
                  className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 ${fontType === 'sans' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  <Type className="w-3 h-3" />
                  Prosa
                </button>
                <button
                  onClick={() => setFontType('mono')}
                  className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 ${fontType === 'mono' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'} cursor-pointer`}
                >
                  <Binary className="w-3 h-3" />
                  Mono
                </button>
              </div>
            </div>

            {/* Case Insensitive Checkbox Switch */}
            <div className="flex items-center gap-2 mt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 bg-slate-300"></div>
                <span className="ml-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ignorar caixa (A/a)</span>
              </label>
            </div>
          </div>

          {/* Actions: Reverter / Limpar */}
          <div className="flex gap-2 self-end md:self-center">
            <button
              onClick={handleSwapTexts}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Inverter textos das caixas original/modificado"
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span>Inverter</span>
            </button>
            <button
              onClick={handleClear}
              disabled={isBothEmpty}
              className="px-4 py-1.5 text-xs font-semibold text-red-650 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:hover:bg-red-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-red-600"
              title="Limpar textos e redefinir o comparador"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Comparação</span>
            </button>
          </div>
        </section>

        {/* Diff View Display Area */}
        <section id="renderer-workspace" className="flex-1 flex flex-col">
          {isBothEmpty ? (
            /* Empty State matching the aesthetic of the system */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[260px] flex-1"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3 animate-pulse">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nenhum texto inserido</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Utilize os botões de exemplo no topo ou insira trechos de texto para que a engine analise e realce as diferenças imediatamente.
              </p>
            </motion.div>
          ) : (
            /* Visual Component workspace */
            <div className="space-y-5">
              {/* Stats overview */}
              <StatsBanner stats={stats} />

              {/* AI suggestion panel */}
              <AIPanel
                textA={textA}
                textB={textB}
                onApplySuggestion={handleApplySuggestion}
              />

              {/* Real highlights workspace */}
              <DiffViewer
                changes={changes}
                layout={viewLayout}
                fontType={fontType}
                mode={diffMode}
              />
            </div>
          )}
        </section>
      </main>

      {/* Styled High Density dark footer with system statistics */}
      <footer className="h-10 bg-slate-900 flex items-center justify-between px-6 md:px-8 shrink-0 select-none">
        <div className="flex gap-6">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">UTF-8 ENCODING</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">DIFF ENGINE V2.4</span>
        </div>
        <div className="text-[10px] text-slate-500 font-semibold tracking-wider font-mono hidden sm:block">
          PRONTO - ANÁLISE EM TEMPO REAL COMPATÍVEL
        </div>
      </footer>
    </div>
  );
}
