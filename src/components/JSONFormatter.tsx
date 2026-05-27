import React, { useState, useMemo, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Braces, Play, Trash2, Copy, Check, FileJson, 
  Search, AlertCircle, CheckCircle, Minimize2, Maximize2,
  ChevronDown, ChevronRight, Download, Upload
} from 'lucide-react';

interface JSONNodeProps {
  key?: React.Key;
  name: string | number;
  value: any;
  depth: number;
  searchQuery: string;
}

function JSONNode({ name, value, depth, searchQuery }: JSONNodeProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  // Filter highlighting helper
  const matchesSearch = (str: string) => {
    if (!searchQuery) return false;
    return str.toLowerCase().includes(searchQuery.toLowerCase());
  };

  const nameStr = String(name);
  const nameHighlighted = searchQuery && matchesSearch(nameStr);

  const renderValuePreview = (val: any) => {
    if (val === null) return <span className="text-slate-400 dark:text-slate-500 font-semibold font-mono">null</span>;
    if (typeof val === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">{String(val)}</span>;
    }
    if (typeof val === 'number') {
      return <span className="text-amber-600 dark:text-amber-400 font-mono">{val}</span>;
    }
    if (typeof val === 'string') {
      const isStringMatch = searchQuery && matchesSearch(val);
      return (
        <span className={`font-mono text-emerald-600 dark:text-emerald-400 break-all ${isStringMatch ? 'bg-yellow-100 dark:bg-yellow-950/45 font-bold text-slate-900 dark:text-yellow-101 border-b border-yellow-300 dark:border-yellow-600/40' : ''}`}>
          "{val}"
        </span>
      );
    }
    return <span className="font-mono text-slate-505 dark:text-slate-400">{String(val)}</span>;
  };

  // If object or array and open, render kids
  const renderChildren = () => {
    if (!isObject) return null;

    const keys = Object.keys(value);
    if (keys.length === 0) {
      return (
        <span className="text-slate-400 dark:text-slate-550 font-mono italic ml-2">
          {isArray ? '[]' : '{}'}
        </span>
      );
    }

    return (
      <div className="pl-4 border-l border-slate-150 dark:border-slate-800 ml-1.5 mt-0.5 space-y-1">
        {keys.map((key) => {
          const childValue = value[key];
          return (
            <JSONNode
              key={key}
              name={isArray ? Number(key) : key}
              value={childValue}
              depth={depth + 1}
              searchQuery={searchQuery}
            />
          );
        })}
      </div>
    );
  };

  const headingText = typeof name === 'number' ? `[${name}]` : `"${name}"`;

  return (
    <div className="text-xs select-text">
      <div className="flex items-start gap-1 py-0.5 hover:bg-slate-50 dark:hover:bg-slate-850/40 rounded px-1 group transition-colors">
        {isObject ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 cursor-pointer self-center"
          >
            {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : (
          <div className="w-4 h-4" />
        )}

        <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
          <span className={nameHighlighted ? 'bg-yellow-100 dark:bg-yellow-950/40 font-bold text-slate-900 dark:text-yellow-101 border-b border-yellow-300' : ''}>
            {headingText}
          </span>
          <span className="text-slate-400 mr-2">:</span>
        </span>

        {!isObject ? (
          <div className="flex-1">{renderValuePreview(value)}</div>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-350 font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded select-none">
            {isArray ? `Array [${value.length}]` : `Object {${Object.keys(value).length}}`}
          </span>
        )}
      </div>

      {isObject && isOpen && renderChildren()}
    </div>
  );
}

export default function JSONFormatter() {
  const [rawText, setRawText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [indentation, setIndentation] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Paste a dynamic example
  const handleLoadExample = () => {
    const exampleObject = {
      app: "Diff Checker Premium",
      versao: "2.4.0",
      ativo: true,
      data_criacao: "2026-05-27T12:00:00Z",
      autor: {
        nome: "Ricardo Nascimento",
        cargo: "Especialista em Escrita",
        interesses: ["Processamento Linguistico", "Inteligencia Artificial", "UX/UI"]
      },
      funcionalidades: [
        { id: 1, nome: "Granularidade de Diferença", categoria: "Core" },
        { id: 2, nome: "Refinamento Gemini AI", categoria: "AI" },
        { id: 3, nome: "Visualizador de Árvore JSON", categoria: "Formatter" }
      ],
      estatisticas_uso: {
        comparacoes_realizadas: 1420,
        sugestoes_geradas: 345,
        sugestoes_aplicadas: 290
      }
    };
    setRawText(JSON.stringify(exampleObject, null, indentation));
    setFileError(null);
  };

  // Parsing result memo
  const parsedData = useMemo(() => {
    if (!rawText.trim()) return { data: null, error: null, valid: false };
    try {
      const data = JSON.parse(rawText);
      return { data, error: null, valid: true };
    } catch (err: any) {
      return { data: null, error: err.message || 'JSON inválido', valid: false };
    }
  }, [rawText]);

  // Copy code
  const handleCopy = async () => {
    if (!rawText) return;
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Formatting actions
  const formatJSON = (spaces: number) => {
    if (!parsedData.valid || !parsedData.data) return;
    setRawText(JSON.stringify(parsedData.data, null, spaces));
    setIndentation(spaces);
  };

  const minifyJSON = () => {
    if (!parsedData.valid || !parsedData.data) return;
    setRawText(JSON.stringify(parsedData.data));
  };

  // Upload JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        // Try parsing to validate JSON
        JSON.parse(content);
        setRawText(content);
      } catch (err) {
        setFileError('O arquivo selecionado não contém um JSON estruturado válido.');
      }
    };
    reader.onerror = () => {
      setFileError('Erro ao ler o arquivo.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col gap-5 px-4 py-3 md:px-0" id="json-formatter-container">
      {/* Header section with subtitle */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Braces className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Leitor e Formatador de JSON</h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Insira trechos de arquivos JSON para validar sua estrutura em tempo real, minificar ou formatar com recuo personalizado e explorar as chaves de forma interativa.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="px-3.5 py-1.5 text-xs font-semibold text-slate-705 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Fazer Upload (.json)</span>
            <input 
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>

          <button
            onClick={handleLoadExample}
            className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 hover:bg-indigo-100/90 dark:hover:bg-indigo-950/80 border border-indigo-150 dark:border-indigo-900/60 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Carregar Exemplo</span>
          </button>
        </div>
      </section>

      {/* Main Formatter area containing Two-column workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
        {/* Left Side: Paste / Editor */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden [min-height:350px] transition-colors" id="json-input-section">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 select-none">
            <div className="flex items-center gap-1.5">
              <Braces className="w-4 h-4 text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Colar Conteúdo JSON</span>
            </div>

            <div className="flex items-center gap-1.5">
              {parsedData.valid ? (
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-250 dark:border-emerald-800/40 uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span>Válido</span>
                </div>
              ) : rawText.trim() ? (
                <div className="flex items-center gap-1 text-[9px] font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-955/20 px-2 py-0.5 rounded border border-red-250 dark:border-red-900/50 uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span>Inválido</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Texarea space */}
          <div className="flex-1 relative font-mono text-xs flex flex-col p-4 bg-slate-900">
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setFileError(null);
              }}
              placeholder='Ex: { "projeto": "Diff Checker Premium", "ativo": true }'
              className="flex-1 w-full h-full min-h-[220px] bg-transparent text-slate-200 border-0 outline-hidden resize-none placeholder-slate-500 leading-relaxed font-mono"
              id="raw-json-textarea"
            />
          </div>

          {/* Editor Controls */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => formatJSON(2)}
                disabled={!parsedData.valid}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 border border-slate-200 dark:border-slate-700 rounded transition-all cursor-pointer"
                title="Formatador com parágrafo de 2 espaços"
              >
                Formatar (2 Espaços)
              </button>
              <button
                onClick={() => formatJSON(4)}
                disabled={!parsedData.valid}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 border border-slate-200 dark:border-slate-700 rounded transition-all cursor-pointer"
                title="Formatador com parágrafo de 4 espaços"
              >
                4 Espaços
              </button>
              <button
                onClick={minifyJSON}
                disabled={!parsedData.valid}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 border border-slate-200 dark:border-slate-700 rounded transition-all cursor-pointer"
                title="Minimizar espaços em branco para otimização de transmissão"
              >
                Minificar
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                disabled={!rawText.trim()}
                className="p-1.5 text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-150 dark:hover:border-indigo-500 rounded hover:border-indigo-150 transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                title="Copiar JSON Formatado"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-555" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setRawText('');
                  setFileError(null);
                }}
                disabled={!rawText.trim()}
                className="p-1.5 text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-150 dark:hover:border-red-500 rounded hover:border-red-150 transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent"
                title="Limpar Área de Texto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Interactive Node Tree View & Error Trace */}
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden [min-height:350px] transition-colors" id="json-viewer-section">
          {/* Viewer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 gap-2 select-none">
            <div className="flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest">Navegabilidade Interativa (Árvore)</span>
            </div>

            {parsedData.valid && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar chaves ou valores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white dark:bg-slate-900 text-xs text-slate-705 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded focus:outline-hidden focus:border-indigo-500 w-[180px] sm:w-[220px]"
                />
              </div>
            )}
          </div>

          {/* Rendering Box */}
          <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-slate-900 min-h-[220px]">
            {fileError && (
              <div className="bg-red-50 dark:bg-red-955/20 border border-red-150 dark:border-red-900/50 rounded-lg p-3.5 mb-4 flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400 leading-normal font-medium">{fileError}</p>
              </div>
            )}

            {!rawText.trim() ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Braces className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aguardando dados</p>
                <p className="text-[10px] text-slate-405 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Colha um JSON no painel esquerdo ou carregue os exemplos para ativar o modo de exibição estruturado.
                </p>
              </div>
            ) : parsedData.error ? (
              <div className="bg-red-50/70 dark:bg-red-955/20 border border-red-150 dark:border-red-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-[11px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider">Analizador de Sintaxe JSON</span>
                </div>
                <p className="text-xs text-slate-105 dark:text-red-400 leading-relaxed bg-red-100/50 dark:bg-red-950/45 p-2.5 border border-red-200 dark:border-red-900/30 rounded font-mono text-[11px] h-auto overflow-x-auto whitespace-pre-wrap mb-2">
                  {parsedData.error}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-450 italic leading-normal">
                  Dica: Verifique se existem vírgulas extras no final das propriedades, aspas faltando nas chaves ou strings conturbadas.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-3 border-b border-slate-100 dark:border-slate-800 pb-1.5 flex justify-between select-none">
                  <span>EXPANDIR TODOS OS RECURRENTES</span>
                  {searchQuery && <span className="text-indigo-600 dark:text-indigo-400 uppercase">Filtro Ativado</span>}
                </div>
                
                <JSONNode 
                  name="root" 
                  value={parsedData.data} 
                  depth={0} 
                  searchQuery={searchQuery} 
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
