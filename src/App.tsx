import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
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
  Copy,
  Braces,
  Menu,
  X,
  FileJson,
  Code,
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import { SAMPLES } from './data/samples';
import { DiffMode, ViewLayout, DiffStats } from './types';
import { getDiff, calculateStats } from './utils/diffUtils';
import StatsBanner from './components/StatsBanner';
import DiffViewer from './components/DiffViewer';
import JSONFormatter from './components/JSONFormatter';
import JWTDebugger from './components/JWTDebugger';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'diff' | 'json' | 'jwt'>('home');

  // Theme support state (light or dark)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // States for Diff Checker
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');
  const [diffMode, setDiffMode] = useState<DiffMode>('words');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('split');
  const [fontType, setFontType] = useState<'sans' | 'mono'>('sans');
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [copiedInput, setCopiedInput] = useState<'none' | 'A' | 'B'>('none');

  // Load the first sample (Cláusula Contratual) on mount
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
    <SidebarProvider>
      <TooltipProvider>
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex w-full transition-colors duration-200" id="app-wrapper">
          
          <Sidebar className="border-r border-slate-200 dark:border-slate-800">
            <SidebarHeader className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 shrink-0 select-none bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-600 shadow-lg text-white">
                  <Scale className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-tight">
                    DiffCheck <span className="text-indigo-600 dark:text-indigo-400 font-medium">Pro</span>
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-505 font-bold uppercase tracking-widest block -mt-0.5">
                    Workspace Core
                  </span>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4 space-y-1 bg-white dark:bg-slate-900">
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-3 mb-2">
                  Utilitários Principais
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem className="list-none">
                      <SidebarMenuButton
                        onClick={() => setActiveTab('home')}
                        isActive={activeTab === 'home'}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-left ${
                          activeTab === 'home'
                            ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-600 hover:text-white'
                            : 'text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Home className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="block font-bold">Início</span>
                          <span className="text-[9.5px] opacity-75 block font-normal">Página de boas-vindas</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-1 list-none">
                      <SidebarMenuButton
                        onClick={() => setActiveTab('diff')}
                        isActive={activeTab === 'diff'}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-left ${
                          activeTab === 'diff'
                            ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-600 hover:text-white'
                            : 'text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-855'
                        }`}
                      >
                        <Scale className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="block font-bold">Comparador de Texto</span>
                          <span className="text-[9.5px] opacity-75 block font-normal">Analise e compare diferenças</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-1 list-none">
                      <SidebarMenuButton
                        onClick={() => setActiveTab('json')}
                        isActive={activeTab === 'json'}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-left ${
                          activeTab === 'json'
                            ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-600 hover:text-white'
                            : 'text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-855'
                        }`}
                        id="sidebar-json-btn"
                      >
                        <Braces className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="block font-bold">Formatador JSON</span>
                          <span className="text-[9.5px] opacity-75 block font-normal">Leitor e árvore estruturada</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem className="mt-1 list-none">
                      <SidebarMenuButton
                        onClick={() => setActiveTab('jwt')}
                        isActive={activeTab === 'jwt'}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-lg transition-all cursor-pointer text-left ${
                          activeTab === 'jwt'
                            ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-600 hover:text-white'
                            : 'text-slate-650 dark:text-slate-350 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-855'
                        }`}
                        id="sidebar-jwt-btn"
                      >
                        <Lock className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="block font-bold">Depurador JWT</span>
                          <span className="text-[9.5px] opacity-75 block font-normal">Decodifique e certifique tokens</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 select-none justify-end bg-white dark:bg-slate-900">
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 text-[9px] tracking-wide font-mono text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-400 dark:text-slate-500">ENGINE WORKSPACE ACTV</span>
                <span>ENCODING: UTF-8</span>
                <span>DIFFER: WORDS, CHARS, LINES</span>
              </div>

              <div className="text-[10px] text-center text-slate-400 dark:text-slate-505 font-semibold py-1">
                © 2026 DiffCheck Modern
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main workspace container */}
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            
            {/* Header containing Sidebar trigger button */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 select-none transition-colors duration-200">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-hidden cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-850" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-indigo-600 md:hidden">
                    <Scale className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-205 md:block hidden animate-fade-in">
                    {activeTab === 'home' ? 'Início / Painel de Utilidades' : activeTab === 'diff' ? 'Comparador Analítico de Textos' : activeTab === 'json' ? 'Leitor e Formatador JSON' : 'Depurador de Tokens JWT'}
                  </span>
                  <span className="font-bold text-sm tracking-tight text-slate-850 dark:text-slate-100 md:hidden block">
                    DiffCheck
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                {/* Theme Selector Toggle */}
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="p-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-105 dark:hover:bg-slate-750 text-slate-705 dark:text-slate-295 border border-slate-200 dark:border-slate-700 rounded-lg transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
                  title={theme === 'light' ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
                >
                  {theme === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Escuro</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Claro</span>
                    </>
                  )}
                </button>

                <span className="text-[10px] bg-indigo-50 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/60 text-indigo-750 dark:text-indigo-300 font-bold px-2.5 py-0.5 rounded uppercase tracking-wider select-none animate-pulse">
                  {activeTab === 'home' ? 'Home' : activeTab === 'diff' ? 'Texto' : activeTab === 'json' ? 'JSON' : 'JWT'}
                </span>
              </div>
            </header>

            {/* Actual Dynamic Work Panel */}
            <div className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="w-full flex-1 md:py-6 max-w-7xl mx-auto px-4 md:px-8 space-y-6">
            
            {activeTab === 'home' ? (
              /* ==================== INTERFACE PRINCIPAL (HOME/WELCOME) ==================== */
              <div className="flex flex-col gap-8 animate-fade-in py-4 select-none">
                {/* Hero section */}
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-900/40 dark:to-indigo-950/20 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 md:p-10 shadow-xs relative overflow-hidden transition-all duration-305">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
                  
                  <div className="max-w-3xl relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      Bem-vindo ao DiffCheck Pro
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                      Utilitários Avançados de <span className="text-indigo-600 dark:text-indigo-400">Texto e JSON</span> para Produtividade.
                    </h1>
                    
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                      Uma suíte de ferramentas projetada especificamente para desenvolvedores, revisores de conteúdo, tradutores e analistas de dados. Analise diferenças com precisão milimétrica ou organize estruturas complexas de dados de forma 100% segura e local.
                    </p>
                  </div>
                </div>

                {/* Main Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Comparador de Texto Card */}
                  <div 
                    onClick={() => setActiveTab('diff')}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform duration-300">
                        <Scale className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                          Comparador de Texto
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-100/40 dark:border-indigo-900/30">Disponível</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Efetue o cruzamento gramático de versões para evidenciar acréscimos e supressões de forma legível e ágil. Ideal para contratos, códigos fonte e revisões.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Recursos Principais</span>
                        <ul className="space-y-1.5">
                          <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            Comparação de palavras, caracteres ou linhas
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            Visualização Lado a Lado (Split) ou Unificada
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            Estatísticas detalhadas em tempo real
                          </li>
                        </ul>
                      </div>
                    </div>

                    <button className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                      Acessar Comparador
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Formatador JSON Card */}
                  <div 
                    onClick={() => setActiveTab('json')}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-900/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                        <Braces className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                          Formatador JSON
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded border border-emerald-100/40 dark:border-emerald-900/30">Disponível</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Insira trechos de arquivos JSON para validar sua estrutura, minificar ou formatar com recuo e navegar pelas chaves em uma árvore dinâmica.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-555 font-bold uppercase tracking-wider block">Recursos Principais</span>
                        <ul className="space-y-1.5">
                          <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Árvore dinâmica e interativa expansível
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-650 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Análise de sintaxe em tempo real com erros
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            Formatador rápido e minificação instantânea
                          </li>
                        </ul>
                      </div>
                    </div>

                    <button className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                      Acessar Formatador
                      <FileJson className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Depurador JWT Card */}
                  <div 
                    onClick={() => setActiveTab('jwt')}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-900/60 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-955/40 border border-violet-100/50 dark:border-violet-900/40 flex items-center justify-center text-violet-605 dark:text-violet-400 group-hover:scale-105 transition-transform duration-300">
                        <Lock className="w-5 h-5" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center gap-2">
                          Depurador JWT
                          <span className="text-[10px] uppercase font-bold tracking-wider font-mono bg-violet-50 dark:bg-violet-955/40 text-violet-650 dark:text-violet-400 px-2 py-0.5 rounded border border-violet-100/40 dark:border-violet-900/30">Novo</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Decodifique, analise e assine tokens JWT criptografados localmente. Perfeito para verificar tempos de expiração ou permissões em APIs.
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-555 font-bold uppercase tracking-wider block">Recursos Principais</span>
                        <ul className="space-y-1.5">
                          <li className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-violet-550 rounded-full" />
                            Decodificação colorida de Header e Payload
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-violet-550 rounded-full" />
                            Geração e assinatura HS256 em tempo real
                          </li>
                          <li className="flex items-center gap-2 text-xs text-slate-655 dark:text-slate-350">
                            <span className="w-1.5 h-1.5 bg-violet-550 rounded-full" />
                            Leitura e destaque de metadados temporários (claims)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <button className="mt-6 w-full py-2.5 px-4 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-750 dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm">
                      Acessar Depurador
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Privacy and Security Banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors shadow-xs">
                  <div className="flex items-start md:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <Settings2 className="w-4 h-4 text-slate-500 dark:text-slate-405" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">🔒 Processamento Local de Alta Privacidade</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                        Seus dados são inteiramente processados direto na sua máquina (Client-Side). Seus textos ou arquivos JSON confidenciais nunca saem do seu navegador, garantindo máxima biossegurança e conformidade de privacidade.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-550 font-mono self-end md:self-center shrink-0">
                    UTF-8 • SECURE RUNTIME • V2.4
                  </div>
                </div>
              </div>
            ) : activeTab === 'diff' ? (
              /* ==================== INTERFACE COMPARADOR DE TEXTO ==================== */
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Intro details Header */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Scale className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                      Comparador Analítico de Textos
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                      Efetue o cruzamento gramático de versões para evidenciar acréscimos e supressões de forma legível e organizada.
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      Presets:
                    </span>
                    <div className="flex gap-1">
                      {SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => handleSelectSample(sample.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-605 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-150 rounded-md transition-all cursor-pointer"
                        >
                          {sample.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Mobile Preset Selector widget */}
                <div className="sm:hidden bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <div className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Selecione um Preset de Exemplo:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
                      >
                        {sample.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Inputs text block */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="section-inputs">
                  {/* TextArea Original (A) */}
                  <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" id="col-text-a">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between rounded-t-xl select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest">Texto Original (A)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyInputText('A', textA)}
                            disabled={!textA}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Copiar Texto A"
                          >
                            {copiedInput === 'A' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setTextA('')}
                            disabled={!textA}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Limpar Texto A"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {textB.trim() ? textA.split(/\s+/).filter(Boolean).length : 0} palavras / {textA.length} ch
                        </span>
                      </div>
                    </div>
                    
                    <textarea
                      className="w-full h-44 p-4 text-xs font-mono leading-relaxed text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-b-xl outline-hidden resize-none transition-all placeholder-slate-450 dark:placeholder-slate-500 focus:bg-slate-50/20 dark:focus:bg-slate-850/20 border-0"
                      placeholder="Cole aqui o seu text original (A)..."
                      value={textA}
                      onChange={(e) => setTextA(e.target.value)}
                      id="textarea-a"
                    />
                  </div>

                  {/* TextArea Modified (B) */}
                  <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden" id="col-text-b">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between rounded-t-xl select-none">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-widest">Texto Modificado (B)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyInputText('B', textB)}
                            disabled={!textB}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Copiar Texto B"
                          >
                            {copiedInput === 'B' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setTextB('')}
                            disabled={!textB}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                            title="Limpar Texto B"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {textB.trim() ? textB.split(/\s+/).filter(Boolean).length : 0} palavras / {textB.length} ch
                        </span>
                      </div>
                    </div>
                    
                    <textarea
                      className="w-full h-44 p-4 text-xs font-mono leading-relaxed text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-b-xl outline-hidden resize-none transition-all placeholder-slate-450 dark:placeholder-slate-500 focus:bg-slate-50/20 dark:focus:bg-slate-850/20 border-0"
                      placeholder="Cole aqui o seu texto modificado (B)..."
                      value={textB}
                      onChange={(e) => setTextB(e.target.value)}
                      id="textarea-b"
                    />
                  </div>
                </section>

                {/* Toolbar navigation, layout togglers */}
                <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-colors" id="toolbar-controls">
                  <div className="flex flex-wrap items-center gap-5">
                    {/* Granularity mode */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Granularidade</span>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-850 select-none">
                        <button
                          onClick={() => setDiffMode('words')}
                          className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                            diffMode === 'words'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Palavras
                        </button>
                        <button
                          onClick={() => setDiffMode('chars')}
                          className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                            diffMode === 'chars'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Caracteres
                        </button>
                        <button
                          onClick={() => setDiffMode('lines')}
                          className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-all ${
                            diffMode === 'lines'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          Linhas
                        </button>
                      </div>
                    </div>

                    {/* Exbition Layout */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Modo de Exibição</span>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-855 select-none">
                        <button
                          onClick={() => setViewLayout('split')}
                          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                            viewLayout === 'split'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Columns className="w-3 h-3" />
                          Side-by-Side
                        </button>
                        <button
                          onClick={() => setViewLayout('inline')}
                          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer transition-all ${
                            viewLayout === 'inline'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <AlignLeft className="w-3 h-3" />
                          Unified
                        </button>
                      </div>
                    </div>

                    {/* Font type Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Estilo da Fonte</span>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-855 select-none">
                        <button
                          onClick={() => setFontType('sans')}
                          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition-all ${
                            fontType === 'sans'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Type className="w-3 h-3" />
                          Prosa
                        </button>
                        <button
                          onClick={() => setFontType('mono')}
                          className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 cursor-pointer transition-all ${
                            fontType === 'mono'
                              ? 'bg-white dark:bg-slate-800 text-slate-905 dark:text-slate-100 shadow-xs'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Binary className="w-3 h-3" />
                          Mono
                        </button>
                      </div>
                    </div>

                    {/* Ignore Case check */}
                    <div className="flex items-center gap-2 mt-2 select-none">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ignoreCase}
                          onChange={(e) => setIgnoreCase(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 bg-slate-270 dark:bg-slate-800"></div>
                        <span className="ml-2 text-[11px] font-bold text-slate-500 dark:text-slate-405 uppercase tracking-wider">Ignorar caixa (A/a)</span>
                      </label>
                    </div>
                  </div>

                  {/* Swap and clear commands triggers */}
                  <div className="flex gap-2 self-end md:self-center">
                    <button
                      onClick={handleSwapTexts}
                      className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Inverter textos das caixas original/modificado"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Inverter</span>
                    </button>
                    <button
                      onClick={handleClear}
                      disabled={isBothEmpty}
                      className="px-4 py-1.5 text-xs font-semibold text-red-650 bg-red-50 hover:bg-red-100 disabled:opacity-40 disabled:hover:bg-red-55 border border-red-200 disabled:cursor-not-allowed rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-red-650 dark:bg-red-950/20 dark:border-red-900/60 dark:text-red-400"
                      title="Limpar textos das duas caixas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Comparação</span>
                    </button>
                  </div>
                </section>

                {/* Diff Viewer space rendered */}
                <section id="renderer-workspace" className="flex-1 flex flex-col">
                  {isBothEmpty ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[260px] flex-1 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/45 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 animate-pulse">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Nenhum texto inserido</h3>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        Preencha as áreas superiores ou clique em nossos presets de exemplos para analisar e realçar as diferenças imediatamente.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Stats Banner indicators */}
                      <StatsBanner stats={stats} />

                      {/* Highlight differences display engine */}
                      <DiffViewer
                        changes={changes}
                        layout={viewLayout}
                        fontType={fontType}
                        mode={diffMode}
                      />
                    </div>
                  )}
                </section>
              </div>
            ) : activeTab === 'json' ? (
              /* ==================== INTERFACE FORMATADOR DE JSON ==================== */
              <div className="animate-fade-in">
                <JSONFormatter />
              </div>
            ) : (
              /* ==================== INTERFACE DEPURADOR DE JWT ==================== */
              <div className="animate-fade-in">
                <JWTDebugger />
              </div>
            )}

          </div>

          {/* Core Footer statistic strip */}
          <footer className="h-10 bg-slate-900 flex items-center justify-between px-6 md:px-8 mt-12 shrink-0 select-none">
            <div className="flex gap-6">
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">WORKSPACE CORE ACTV</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">DIFF ENGINE V2.4</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold tracking-wider font-mono hidden sm:block">
              SISTEMA INTEGRADO PRONTO EM REAL-TIME
            </div>
          </footer>
        </div>
      </div>
    </div>
  </TooltipProvider>
</SidebarProvider>
  );
}
