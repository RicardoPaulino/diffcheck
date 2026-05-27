import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Trash2,
  FileText,
  Code,
  Info,
  RefreshCw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface JWTDecoded {
  header: any;
  payload: any;
  signature: string;
  headerStr: string;
  payloadStr: string;
  headerB64: string;
  payloadB64: string;
}

// Custom safe base64url decoding
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    // Fallback if decodeURIComponent fails (e.g. invalid UTF-8 sequences)
    return atob(base64);
  }
}

// Custom safe base64url encoding
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binString = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// HS256 signing using browser Web Crypto API
async function signHS256(headerB64: string, payloadB64: string, secret: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const keyData = encoder.encode(secret || 'secret-key');
    
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await window.crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      data
    );
    
    const sigBytes = new Uint8Array(signatureBuffer);
    let binString = '';
    for (let i = 0; i < sigBytes.byteLength; i++) {
      binString += String.fromCharCode(sigBytes[i]);
    }
    return btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error('Signing failed:', e);
    return '';
  }
}

// HS256 verify using browser Web Crypto API
async function verifyHS256(headerB64: string, payloadB64: string, signatureB64: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const keyData = encoder.encode(secret || 'secret-key');
    
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );
    
    // Convert signature from base64url representation to Uint8Array
    let sigBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (sigBase64.length % 4) {
      sigBase64 += '=';
    }
    const sigStr = atob(sigBase64);
    const sigBytes = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBytes[i] = sigStr.charCodeAt(i);
    }
    
    return await window.crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      sigBytes,
      data
    );
  } catch (e) {
    return false;
  }
}

const DEFAULT_SECRET = 'your-256-bit-secret';
const DEFAULT_HEADER = {
  alg: 'HS256',
  typ: 'JWT'
};
const DEFAULT_PAYLOAD = {
  sub: '1234567890',
  name: 'John Doe',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  admin: true,
  iss: 'https://diffcheck.pro',
  aud: 'users-api'
};

export default function JWTDebugger() {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [headerInput, setHeaderInput] = useState<string>('');
  const [payloadInput, setPayloadInput] = useState<string>('');
  const [secret, setSecret] = useState<string>(DEFAULT_SECRET);
  const [isSecretBase64Encoded, setIsSecretBase64Encoded] = useState<boolean>(false);

  // Parsed and status states
  const [error, setError] = useState<string | null>(null);
  const [headerJsonError, setHeaderJsonError] = useState<string | null>(null);
  const [payloadJsonError, setPayloadJsonError] = useState<string | null>(null);
  const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);
  const [isAlgorithmSupported, setIsAlgorithmSupported] = useState<boolean>(true);
  
  // Timestamps / claims interpretation
  const [claimsMeta, setClaimsMeta] = useState<Array<{ name: string; label: string; raw: any; value: string; status: 'valid' | 'expired' | 'upcoming' | 'neutral' }>>([]);

  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedHeader, setCopiedHeader] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Initialize with a default token
  useEffect(() => {
    generateTokenFromText(JSON.stringify(DEFAULT_HEADER, null, 2), JSON.stringify(DEFAULT_PAYLOAD, null, 2), DEFAULT_SECRET);
  }, []);

  // Hook to handle updating on inputs
  const parseToken = async (jwt: string, currentSecret: string) => {
    if (!jwt.trim()) {
      setError('Por favor, insira um token JWT.');
      setIsSignatureValid(null);
      return;
    }

    const parts = jwt.split('.');
    if (parts.length < 2 || parts.length > 3) {
      setError('Token JWT inválido. Um JWT deve conter Header, Payload e opcionalmente Assinatura separados por ponto (.)');
      setIsSignatureValid(null);
      return;
    }

    const [headerB64, payloadB64, signatureB65 = ''] = parts;

    try {
      setError(null);
      const decodedHeaderStr = base64UrlDecode(headerB64);
      const decodedPayloadStr = base64UrlDecode(payloadB64);

      let parsedHeader: any = {};
      let parsedPayload: any = {};

      try {
        parsedHeader = JSON.parse(decodedHeaderStr);
        setHeaderJsonError(null);
      } catch (e: any) {
        setHeaderJsonError('JSON do Header inválido: ' + e.message);
      }

      try {
        parsedPayload = JSON.parse(decodedPayloadStr);
        setPayloadJsonError(null);
      } catch (e: any) {
        setPayloadJsonError('JSON do Payload inválido: ' + e.message);
      }

      // Sync decoded text states to editors
      setHeaderInput(JSON.stringify(parsedHeader, null, 2));
      setPayloadInput(JSON.stringify(parsedPayload, null, 2));

      // Verify signature
      const alg = (parsedHeader?.alg || '').toUpperCase();
      if (alg === 'HS256') {
        setIsAlgorithmSupported(true);
        const isValid = await verifyHS256(headerB64, payloadB64, signatureB65, currentSecret);
        setIsSignatureValid(isValid);
      } else {
        setIsAlgorithmSupported(alg === 'NONE');
        setIsSignatureValid(alg === 'NONE' ? true : null);
      }

      // Interpret payload claims (timestamps, etc.)
      interpretClaims(parsedPayload);
    } catch (e: any) {
      setError('Falha ao decodificar partes do token: ' + e.message);
      setIsSignatureValid(null);
    }
  };

  const interpretClaims = (payload: any) => {
    const list: typeof claimsMeta = [];
    const nowSecs = Math.floor(Date.now() / 1000);

    if (payload?.exp !== undefined) {
      const expDate = new Date(payload.exp * 1000);
      const isExpired = nowSecs > payload.exp;
      list.push({
        name: 'exp',
        label: 'Expiration Time (Data de Expiração)',
        raw: payload.exp,
        value: expDate.toLocaleString() + ` (${isExpired ? 'Expirou' : 'Válido'})`,
        status: isExpired ? 'expired' : 'valid'
      });
    }

    if (payload?.iat !== undefined) {
      const iatDate = new Date(payload.iat * 1000);
      const isUpcoming = payload.iat > nowSecs;
      list.push({
        name: 'iat',
        label: 'Issued At (Emitido em/às)',
        raw: payload.iat,
        value: iatDate.toLocaleString() + ` (${isUpcoming ? 'Futuro' : 'Passado'})`,
        status: isUpcoming ? 'upcoming' : 'neutral'
      });
    }

    if (payload?.nbf !== undefined) {
      const nbfDate = new Date(payload.nbf * 1000);
      const isUpcoming = payload.nbf > nowSecs;
      list.push({
        name: 'nbf',
        label: 'Not Before (Não antes de)',
        raw: payload.nbf,
        value: nbfDate.toLocaleString() + ` (${isUpcoming ? 'Ainda inativo' : 'Ativo'})`,
        status: isUpcoming ? 'upcoming' : 'valid'
      });
    }

    if (payload?.iss !== undefined) {
      list.push({
        name: 'iss',
        label: 'Issuer (Emissor)',
        raw: payload.iss,
        value: String(payload.iss),
        status: 'neutral'
      });
    }

    if (payload?.aud !== undefined) {
      list.push({
        name: 'aud',
        label: 'Audience (Audiência/Destinatário)',
        raw: payload.aud,
        value: Array.isArray(payload.aud) ? payload.aud.join(', ') : String(payload.aud),
        status: 'neutral'
      });
    }

    if (payload?.sub !== undefined) {
      list.push({
        name: 'sub',
        label: 'Subject (Assunto/ID do Usuário)',
        raw: payload.sub,
        value: String(payload.sub),
        status: 'neutral'
      });
    }

    setClaimsMeta(list);
  };

  // Generate Token (Left input) when header/payload/secret edits happen (Right editors)
  const generateTokenFromText = async (hStr: string, pStr: string, curSecret: string) => {
    try {
      let hObj = {};
      let pObj = {};
      
      try {
        hObj = JSON.parse(hStr);
        setHeaderJsonError(null);
      } catch (e: any) {
        setHeaderJsonError('JSON do Header inválido');
        return;
      }

      try {
        pObj = JSON.parse(pStr);
        setPayloadJsonError(null);
      } catch (e: any) {
        setPayloadJsonError('JSON do Payload inválido');
        return;
      }

      const hB64 = base64UrlEncode(JSON.stringify(hObj));
      const pB64 = base64UrlEncode(JSON.stringify(pObj));
      
      const alg = (hObj as any)?.alg || 'HS256';
      let signature = '';
      
      if (alg.toUpperCase() === 'HS256') {
        signature = await signHS256(hB64, pB64, curSecret);
        setIsAlgorithmSupported(true);
        setIsSignatureValid(true);
      } else if (alg.toUpperCase() === 'NONE') {
        signature = '';
        setIsAlgorithmSupported(true);
        setIsSignatureValid(true);
      } else {
        // Unsupported algorithm for live-sign
        signature = 'unsupported-signature-representation';
        setIsAlgorithmSupported(false);
        setIsSignatureValid(null);
      }

      const freshToken = `${hB64}.${pB64}${signature ? '.' + signature : '.'}`;
      setTokenInput(freshToken);
      setError(null);
      interpretClaims(pObj);
    } catch (e: any) {
      setError('Falha ao re-codificar o token: ' + e.message);
    }
  };

  const handleTokenInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTokenInput(val);
    parseToken(val, secret);
  };

  const handleHeaderChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHeaderInput(val);
    generateTokenFromText(val, payloadInput, secret);
  };

  const handlePayloadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPayloadInput(val);
    generateTokenFromText(headerInput, val, secret);
  };

  const handleSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSecret(val);
    // If it's a token parsed from input, recheck it.
    // If we are editing, regenerate.
    if (tokenInput) {
      const parts = tokenInput.split('.');
      if (parts.length === 3) {
        // We look at header alg
        try {
          const loadedHeader = JSON.parse(base64UrlDecode(parts[0]));
          if (loadedHeader?.alg?.toUpperCase() === 'HS256') {
            verifyHS256(parts[0], parts[1], parts[2], val).then((isValid) => {
              setIsSignatureValid(isValid);
            });
            return;
          }
        } catch (err) {}
      }
      generateTokenFromText(headerInput, payloadInput, val);
    }
  };

  const handleLoadSample = () => {
    const sampleHeader = { alg: 'HS256', typ: 'JWT' };
    const samplePayload = {
      sub: 'usr_secure_942',
      name: 'Paula Souza',
      email: 'paula.souza@example.com',
      role: 'Staff Engineer',
      department: 'Plataforma',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200,
      iss: 'auth.corporativo.net',
      aud: 'internal-microservices'
    };
    setHeaderInput(JSON.stringify(sampleHeader, null, 2));
    setPayloadInput(JSON.stringify(samplePayload, null, 2));
    setSecret('chave-secreta-corporativa-super-segura-2026');
    generateTokenFromText(
      JSON.stringify(sampleHeader),
      JSON.stringify(samplePayload),
      'chave-secreta-corporativa-super-segura-2026'
    );
  };

  const copyToClipboard = (type: 'token' | 'header' | 'payload', text: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else if (type === 'header') {
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    } else if (type === 'payload') {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  // Visual text split for color illustration
  const renderTokenSegments = () => {
    const parts = tokenInput.split('.');
    if (parts.length !== 3) {
      return <span className="break-all">{tokenInput}</span>;
    }
    return (
      <div className="text-xs font-mono leading-relaxed select-all [word-break:break-all]">
        <span className="text-rose-600 dark:text-rose-400 font-semibold">{parts[0]}</span>
        <span className="text-slate-400">.</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{parts[1]}</span>
        <span className="text-slate-400">.</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{parts[2]}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-5 px-4 py-3 md:px-0" id="jwt-debugger-root">
      {/* Header section */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Depurador e Analisador de JWT</h2>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Decodifique, analise e valide seus tokens JWT. Altere o header ou payload para gerar novos tokens em tempo real. Compatível com assinatura HS256 local.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/45 hover:bg-indigo-100 border border-indigo-150 dark:border-indigo-900/60 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Usar Token Exemplo</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Side: Paste Token Input (Col 5) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-fit transition-colors">
            
            {/* Header segment indicator info */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-805">
              <div className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Token Formatado (Codificado)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard('token', tokenInput)}
                  disabled={!tokenInput}
                  className="p-1 px-2.5 text-slate-550 dark:text-slate-405 hover:text-indigo-600 border border-slate-150 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-xs font-semibold cursor-pointer disabled:opacity-30 transition-all flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedToken ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => {
                    setTokenInput('');
                    setHeaderInput('{}');
                    setPayloadInput('{}');
                    setClaimsMeta([]);
                    setError(null);
                    setIsSignatureValid(null);
                  }}
                  disabled={!tokenInput}
                  className="p-1 text-slate-550 dark:text-slate-405 hover:text-red-505 border border-slate-150 dark:border-slate-800 rounded bg-white dark:bg-slate-900 cursor-pointer disabled:opacity-30 transition-all"
                  title="Limpar Token"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editing Box */}
            <div className="p-4 flex flex-col gap-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Insira ou Cole o JWT</label>
              <textarea
                value={tokenInput}
                onChange={handleTokenInputChange}
                placeholder="Insira seu JWT em texto codificado..."
                rows={8}
                className="w-full p-3 font-mono text-xs text-slate-705 dark:text-indigo-305 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-lg focus:outline-hidden focus:border-indigo-500 font-medium leading-relaxed resize-y"
              />

              {/* segments breakdown legend */}
              {tokenInput && (
                <div className="bg-slate-50/50 dark:bg-slate-955/20 border border-slate-150 dark:border-slate-800/80 rounded-lg p-3.5 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Identificação do Segmento de Cores</div>
                  {renderTokenSegments()}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      Header
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-650 dark:text-indigo-400">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      Payload
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-450">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      Assinatura
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Validation Error Banner */}
          {error && (
            <div className="bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex gap-3 items-start animate-fade-in text-xs">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-red-800 dark:text-red-400 block uppercase tracking-wide">Erro de Sintaxe do Token</span>
                <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Status Banner based on signature state */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors">
            <h3 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-3">Verificação da Assinatura</h3>
            
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all duration-300 ${
              isSignatureValid === true 
                ? 'bg-emerald-50/70 dark:bg-emerald-955/15 border-emerald-150 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400' 
                : isSignatureValid === false 
                  ? 'bg-red-50/70 dark:bg-red-955/15 border-red-150 dark:border-red-900/40 text-red-800 dark:text-red-400' 
                  : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400'
            }`}>
              {isSignatureValid === true ? (
                <ShieldCheck className="w-6 h-6 text-emerald-555 shrink-0" />
              ) : isSignatureValid === false ? (
                <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
              ) : (
                <Key className="w-6 h-6 text-slate-400 shrink-0" />
              )}

              <div className="space-y-1.5 flex-1 select-text">
                <div className="font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  {isSignatureValid === true 
                    ? 'Assinatura Verificada!' 
                    : isSignatureValid === false 
                      ? 'Falha na Validação da Assinatura' 
                      : 'Sem Verificação Ativa'}
                </div>
                
                <p className="text-[11px] leading-relaxed font-medium">
                  {isSignatureValid === true 
                    ? 'A assinatura confere com o segredo fornecido e as partes do cabeçalho e carga útil estão totalmente íntegras e seguras.' 
                    : isSignatureValid === false 
                      ? 'O segredo/chave secreta fornecida não corresponde ou o token foi sofrer alterações não autorizadas nos dados.' 
                      : 'Nenhuma assinatura correspondente HS256 encontrada para checagem ou o algoritmo declarado não requer segredo.'}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Editors & Decoded details (Col 7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors">
            
            {/* Header title */}
            <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-805 px-4 py-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Header (Cabeçalho - Metadados)
              </span>
              <button
                onClick={() => copyToClipboard('header', headerInput)}
                className="p-1 px-2 text-rose-650 dark:text-rose-450 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-rose-150 dark:border-rose-950/60"
              >
                {copiedHeader ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeader ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-4 space-y-2">
              <textarea
                value={headerInput}
                onChange={handleHeaderChange}
                rows={4}
                className="w-full p-3 font-mono text-xs text-rose-700 dark:text-rose-450 bg-rose-50/20 dark:bg-rose-955/5 border border-rose-200/55 dark:border-rose-955/20 rounded-lg focus:outline-hidden focus:border-rose-500 leading-normal resize-y"
              />
              {headerJsonError && (
                <span className="text-[10px] font-bold text-red-500 block">{headerJsonError}</span>
              )}
            </div>
          </section>

          {/* Payload segment */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors">
            
            <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-805 px-4 py-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Payload (Carga Útil - Claims/Dados)
              </span>
              <button
                onClick={() => copyToClipboard('payload', payloadInput)}
                className="p-1 px-2 text-indigo-650 dark:text-indigo-450 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-indigo-150 dark:border-indigo-950/60"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              <textarea
                value={payloadInput}
                onChange={handlePayloadChange}
                rows={9}
                className="w-full p-3 font-mono text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50/15 dark:bg-indigo-955/5 border border-indigo-200/55 dark:border-indigo-955/20 rounded-lg focus:outline-hidden focus:border-indigo-500 leading-normal resize-y"
              />
              {payloadJsonError && (
                <span className="text-[10px] font-bold text-red-500 block">{payloadJsonError}</span>
              )}
            </div>
          </section>

          {/* Interactive Signature details / Verify signature credentials */}
          <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors">
            <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-805 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Segredo da Assinatura HMAC-SHA255 (HS256)
              </span>
            </div>

            <div className="p-4 space-y-3.5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider block">Insira o Segredo / Chave Secreta</label>
                  <input
                    type="text"
                    value={secret}
                    onChange={handleSecretChange}
                    placeholder="Introduza a chave secreta..."
                    className="w-full px-3.5 py-2 font-mono text-xs text-slate-705 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950/45 p-3 rounded-lg border border-slate-150 dark:border-slate-850">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                  Modificar este segredo instruirá o gerador a criar uma nova assinatura criptografada que constará na terceira parte do token (em verde). O DiffCheck realiza essa criptografia 100% em hardware local.
                </p>
              </div>
            </div>
          </section>

          {/* Human Readable Claims parser */}
          {claimsMeta.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 transition-colors">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Metadados e Prazos Interpretados (Claims)</h3>
              </div>

              <div className="space-y-2">
                {claimsMeta.map((claim) => (
                  <div key={claim.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/20 text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30 select-all">
                        {claim.name}
                      </span>
                      <span className="font-semibold text-slate-550 dark:text-slate-400">{claim.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-2.5 justify-between sm:justify-start">
                      <span className="font-mono text-[11px] text-slate-650 dark:text-slate-200 font-semibold select-all break-all">{claim.value}</span>
                      
                      {claim.status === 'valid' && (
                        <span className="text-[9px] font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-150 px-2 py-0.5 uppercase rounded select-none">Ativo</span>
                      )}
                      {claim.status === 'expired' && (
                        <span className="text-[9px] font-bold text-red-650 bg-red-50 dark:bg-red-955/20 border border-red-150 px-2 py-0.5 uppercase rounded select-none">Expirou</span>
                      )}
                      {claim.status === 'upcoming' && (
                        <span className="text-[9px] font-bold text-amber-650 bg-amber-50 dark:bg-amber-950/25 border border-amber-150 px-2 py-0.5 uppercase rounded select-none">Futuro</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
