import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, XCircle, RefreshCw, Eye, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type AppMode = 'podstawy' | 'operacje' | 'przekroje' | 'rozszerzone' | 'miary';

interface AppState {
  mode: AppMode;

  // Podstawy mode
  A_podstawy: number[];
  isCorrect_card: boolean | null;
  showSolution_card: boolean;
  showHelp_card: boolean;
  userCard: string;

  isCorrect_hgt: boolean | null;
  showSolution_hgt: boolean;
  showHelp_hgt: boolean;
  userHgt: string;

  isCorrect_supp: boolean | null;
  showSolution_supp: boolean;
  showHelp_supp: boolean;
  userSupp: string;

  // Operacje mode
  A_operacje: number[];
  B_operacje: number[];
  
  isCorrect_suma: boolean | null;
  showSolution_suma: boolean;
  showHelp_suma: boolean;
  userSuma: string[];

  isCorrect_iloczyn: boolean | null;
  showSolution_iloczyn: boolean;
  showHelp_iloczyn: boolean;
  userIloczyn: string[];

  isCorrect_dopelnienie: boolean | null;
  showSolution_dopelnienie: boolean;
  showHelp_dopelnienie: boolean;
  userDopelnienie: string[];

  // Przekroje mode
  A_przekroje: number[];
  alpha: number;
  
  isCorrect_przekroj: boolean | null;
  showSolution_przekroj: boolean;
  showHelp_przekroj: boolean;
  userPrzekroj: string[];

  // Rozszerzone mode
  A_rozszerzone: number[];
  B_rozszerzone: number[];
  isCorrect_roznica: boolean | null; showSolution_roznica: boolean; showHelp_roznica: boolean; userRoznica: string[];
  isCorrect_einstein: boolean | null; showSolution_einstein: boolean; showHelp_einstein: boolean; userEinstein: string[];

  // Miary mode
  A_miary: number[];
  S_miary: number[]; // Do miary T1
  isCorrect_in: boolean | null; showSolution_in: boolean; showHelp_in: boolean; userIn: string;
  isCorrect_t1: boolean | null; showSolution_t1: boolean; showHelp_t1: boolean; userT1: string;

  alertMsg: string | null;
}

const round1 = (val: number) => Math.round(val * 10) / 10;
const generateFuzzySet = (length: number) => Array.from({ length }, () => round1(Math.random()));

const calcCard = (A: number[]) => round1(A.reduce((a, b) => a + b, 0));
const calcHgt = (A: number[]) => Math.max(...A);
const calcSuppSize = (A: number[]) => A.filter(x => x > 0).length;

const fuzzyUnion = (A: number[], B: number[]) => A.map((a, i) => Math.max(a, B[i]));
const fuzzyIntersection = (A: number[], B: number[]) => A.map((a, i) => Math.min(a, B[i]));
const fuzzyComplement = (A: number[]) => A.map(a => round1(1 - a));
const calcAlphaCut = (A: number[], alpha: number) => A.map(a => a >= alpha ? 1 : 0);

// Nowe funkcje:
const fuzzyDifference = (A: number[], B: number[]) => A.map((a, i) => round1(Math.min(a, 1 - B[i])));
const fuzzyEinsteinSum = (A: number[], B: number[]) => A.map((a, i) => round1((a + B[i]) / (1 + a * B[i])));

const calcIn = (A: number[]) => round1(calcSuppSize(A) / A.length);
const calcT1 = (S: number[]) => {
  const r = S.reduce((acc, val) => acc + val, 0);
  const proportion = r / S.length;
  return round1(proportion * proportion); // Q(x) = x^2 (Względny)
};

// Custom Ninja Icons
const SenseiWuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
    <path d="M 20 50 Q 50 100 80 50 Z" fill="#f8fafc" />
    <ellipse cx="50" cy="45" rx="25" ry="18" fill="#fcd34d" />
    <circle cx="42" cy="45" r="3" fill="#1e293b" />
    <circle cx="58" cy="45" r="3" fill="#1e293b" />
    <path d="M 36 40 Q 42 38 48 40" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
    <path d="M 64 40 Q 58 38 52 40" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
    <path d="M 40 52 Q 50 45 60 52" fill="none" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" />
    <path d="M 15 35 Q 50 10 85 35 Q 50 42 15 35 Z" fill="#d97706" />
    <path d="M 15 35 Q 50 25 85 35" fill="none" stroke="#b45309" strokeWidth="2" />
  </svg>
);

const NinjaIcon = ({ color, darkColor, className }: { color: string, darkColor: string, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className} width="24" height="24">
    <circle cx="32" cy="32" r="28" fill={color} />
    <ellipse cx="32" cy="30" rx="20" ry="12" fill="#fef08a" />
    <path d="M 12 30 Q 32 45 52 30" fill="none" stroke={darkColor} strokeWidth="4" strokeLinecap="round" />
    <path d="M 16 20 Q 32 25 48 20" fill="none" stroke={darkColor} strokeWidth="4" strokeLinecap="round" />
    <circle cx="24" cy="28" r="3" fill="#1e293b" />
    <circle cx="40" cy="28" r="3" fill="#1e293b" />
    <path d="M 20 24 L 26 26" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <path d="M 44 24 L 38 26" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
    <path d="M 56 32 Q 62 40 58 48" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <path d="M 56 32 Q 64 36 62 42" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const TaskControls = ({
  onCheck, onToggleSolution, showSolution, onToggleHelp, showHelp
}: {
  onCheck: () => void, onToggleSolution: () => void, showSolution: boolean, onToggleHelp: () => void, showHelp: boolean
}) => (
  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
    <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.9rem' }} onClick={onCheck}>
      <ArrowRight size={16} /> Sprawdź
    </button>
    <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.9rem' }} onClick={onToggleSolution}>
      <Eye size={16} /> {showSolution ? 'Ukryj odp.' : 'Odpowiedź'}
    </button>
    <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.9rem' }} onClick={onToggleHelp}>
      <HelpCircle size={16} /> {showHelp ? 'Ukryj' : 'Podpowiedź'}
    </button>
  </div>
);

const TaskResult = ({ isCorrect }: { isCorrect: boolean | null }) => {
  if (isCorrect === null) return null;
  if (isCorrect) return (
    <div className="result-banner result-success" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}>
      <CheckCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Świetnie! Poprawna odpowiedź.</span>
    </div>
  );
  return (
    <div className="result-banner result-error" style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}>
      <XCircle size={20} /> <span style={{ marginLeft: '0.5rem' }}>Błąd. Spróbuj jeszcze raz!</span>
    </div>
  );
};

const ModalAlert = ({ msg, onClose }: { msg: string | null, onClose: () => void }) => {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div className="lego-panel" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--theme-primary)' }}>
          <XCircle size={64} />
        </div>
        <h2 style={{ fontFamily: 'Bangers', fontSize: '2.5rem', marginTop: 0, color: 'var(--theme-primary)', textShadow: '2px 2px 0 var(--gold), 3px 3px 0 var(--theme-shadow)', letterSpacing: '1px' }}>Uwaga Ninja!</h2>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '1.5rem' }}>{msg}</p>
        <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }} onClick={onClose}>
          Zrozumiałem
        </button>
      </div>
    </div>
  );
};

const TaskSection = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    marginBottom: '2rem', padding: '1rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }}>
    {children}
  </div>
);

function App() {
  const [state, setState] = useState<AppState>({
    mode: 'podstawy',

    // Podstawy
    A_podstawy: [],
    isCorrect_card: null, showSolution_card: false, showHelp_card: false, userCard: '',
    isCorrect_hgt: null, showSolution_hgt: false, showHelp_hgt: false, userHgt: '',
    isCorrect_supp: null, showSolution_supp: false, showHelp_supp: false, userSupp: '',

    // Operacje
    A_operacje: [], B_operacje: [],
    isCorrect_suma: null, showSolution_suma: false, showHelp_suma: false, userSuma: [],
    isCorrect_iloczyn: null, showSolution_iloczyn: false, showHelp_iloczyn: false, userIloczyn: [],
    isCorrect_dopelnienie: null, showSolution_dopelnienie: false, showHelp_dopelnienie: false, userDopelnienie: [],

    // Przekroje
    A_przekroje: [], alpha: 0,
    isCorrect_przekroj: null, showSolution_przekroj: false, showHelp_przekroj: false, userPrzekroj: [],

    // Rozszerzone
    A_rozszerzone: [], B_rozszerzone: [],
    isCorrect_roznica: null, showSolution_roznica: false, showHelp_roznica: false, userRoznica: [],
    isCorrect_einstein: null, showSolution_einstein: false, showHelp_einstein: false, userEinstein: [],

    // Miary
    A_miary: [], S_miary: [],
    isCorrect_in: null, showSolution_in: false, showHelp_in: false, userIn: '',
    isCorrect_t1: null, showSolution_t1: false, showHelp_t1: false, userT1: '',

    alertMsg: null,
  });

  const generateProblem = (modeOverride?: AppMode) => {
    const currentMode = modeOverride || state.mode;
    const len = 5; // Długość zbioru np. x1, x2, x3, x4, x5

    if (currentMode === 'podstawy') {
      setState(s => ({
        ...s,
        mode: 'podstawy',
        A_podstawy: generateFuzzySet(len),
        isCorrect_card: null, showSolution_card: false, showHelp_card: false, userCard: '',
        isCorrect_hgt: null, showSolution_hgt: false, showHelp_hgt: false, userHgt: '',
        isCorrect_supp: null, showSolution_supp: false, showHelp_supp: false, userSupp: '',
      }));
    } else if (currentMode === 'operacje') {
      setState(s => ({
        ...s,
        mode: 'operacje',
        A_operacje: generateFuzzySet(len),
        B_operacje: generateFuzzySet(len),
        isCorrect_suma: null, showSolution_suma: false, showHelp_suma: false, userSuma: new Array(len).fill(''),
        isCorrect_iloczyn: null, showSolution_iloczyn: false, showHelp_iloczyn: false, userIloczyn: new Array(len).fill(''),
        isCorrect_dopelnienie: null, showSolution_dopelnienie: false, showHelp_dopelnienie: false, userDopelnienie: new Array(len).fill(''),
      }));
    } else if (currentMode === 'przekroje') {
      setState(s => ({
        ...s,
        mode: 'przekroje',
        A_przekroje: generateFuzzySet(len),
        alpha: round1(Math.random() * 0.8 + 0.1), // alpha od 0.1 do 0.9
        isCorrect_przekroj: null, showSolution_przekroj: false, showHelp_przekroj: false, userPrzekroj: new Array(len).fill(''),
      }));
    } else if (currentMode === 'rozszerzone') {
      setState(s => ({
        ...s,
        mode: 'rozszerzone',
        A_rozszerzone: generateFuzzySet(len),
        B_rozszerzone: generateFuzzySet(len),
        isCorrect_roznica: null, showSolution_roznica: false, showHelp_roznica: false, userRoznica: new Array(len).fill(''),
        isCorrect_einstein: null, showSolution_einstein: false, showHelp_einstein: false, userEinstein: new Array(len).fill(''),
      }));
    } else if (currentMode === 'miary') {
      setState(s => ({
        ...s,
        mode: 'miary',
        A_miary: generateFuzzySet(len),
        S_miary: generateFuzzySet(len),
        isCorrect_in: null, showSolution_in: false, showHelp_in: false, userIn: '',
        isCorrect_t1: null, showSolution_t1: false, showHelp_t1: false, userT1: '',
      }));
    }
  };

  useEffect(() => {
    generateProblem('podstawy');
  }, []);

  const switchMode = (mode: AppMode) => {
    generateProblem(mode);
  };

  const handleCheck = (taskType: string) => {
    // PODSTAWY
    if (taskType === 'card') {
      const parsed = parseFloat(state.userCard.trim().replace(',', '.'));
      if (isNaN(parsed)) {
        setState(s => ({ ...s, alertMsg: 'Wpisz poprawną liczbę.' }));
        return;
      }
      const correct = calcCard(state.A_podstawy);
      setState(s => ({ ...s, isCorrect_card: Math.abs(parsed - correct) < 0.05 }));
    } else if (taskType === 'hgt') {
      const parsed = parseFloat(state.userHgt.trim().replace(',', '.'));
      if (isNaN(parsed)) {
        setState(s => ({ ...s, alertMsg: 'Wpisz poprawną liczbę.' }));
        return;
      }
      const correct = calcHgt(state.A_podstawy);
      setState(s => ({ ...s, isCorrect_hgt: Math.abs(parsed - correct) < 0.05 }));
    } else if (taskType === 'supp') {
      const parsed = parseInt(state.userSupp.trim(), 10);
      if (isNaN(parsed)) {
        setState(s => ({ ...s, alertMsg: 'Wpisz poprawną liczbę całkowitą.' }));
        return;
      }
      const correct = calcSuppSize(state.A_podstawy);
      setState(s => ({ ...s, isCorrect_supp: parsed === correct }));
    } 
    // OPERACJE
    else if (taskType === 'suma') {
      const parsed = state.userSuma.map(s => parseFloat(s.trim().replace(',', '.')));
      if (parsed.some(isNaN)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij wszystkie okienka poprawnymi liczbami.' }));
        return;
      }
      const correct = fuzzyUnion(state.A_operacje, state.B_operacje);
      const isMatch = parsed.every((val, i) => Math.abs(val - correct[i]) < 0.05);
      setState(s => ({ ...s, isCorrect_suma: isMatch }));
    } else if (taskType === 'iloczyn') {
      const parsed = state.userIloczyn.map(s => parseFloat(s.trim().replace(',', '.')));
      if (parsed.some(isNaN)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij wszystkie okienka poprawnymi liczbami.' }));
        return;
      }
      const correct = fuzzyIntersection(state.A_operacje, state.B_operacje);
      const isMatch = parsed.every((val, i) => Math.abs(val - correct[i]) < 0.05);
      setState(s => ({ ...s, isCorrect_iloczyn: isMatch }));
    } else if (taskType === 'dopelnienie') {
      const parsed = state.userDopelnienie.map(s => parseFloat(s.trim().replace(',', '.')));
      if (parsed.some(isNaN)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij wszystkie okienka poprawnymi liczbami.' }));
        return;
      }
      const correct = fuzzyComplement(state.A_operacje);
      const isMatch = parsed.every((val, i) => Math.abs(val - correct[i]) < 0.05);
      setState(s => ({ ...s, isCorrect_dopelnienie: isMatch }));
    }
    // PRZEKROJE
    else if (taskType === 'przekroj') {
      const parsed = state.userPrzekroj.map(s => parseInt(s.trim(), 10));
      if (parsed.some(isNaN) || parsed.some(v => v !== 0 && v !== 1)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij okienka wartościami 0 lub 1 (zbiór ostry).' }));
        return;
      }
      const correct = calcAlphaCut(state.A_przekroje, state.alpha);
      const isMatch = parsed.every((val, i) => val === correct[i]);
      setState(s => ({ ...s, isCorrect_przekroj: isMatch }));
    }
    // ROZSZERZONE
    else if (taskType === 'roznica') {
      const parsed = state.userRoznica.map(s => parseFloat(s.trim().replace(',', '.')));
      if (parsed.some(isNaN)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij wszystkie okienka poprawnymi liczbami.' }));
        return;
      }
      const correct = fuzzyDifference(state.A_rozszerzone, state.B_rozszerzone);
      const isMatch = parsed.every((val, i) => Math.abs(val - correct[i]) < 0.05);
      setState(s => ({ ...s, isCorrect_roznica: isMatch }));
    } else if (taskType === 'einstein') {
      const parsed = state.userEinstein.map(s => parseFloat(s.trim().replace(',', '.')));
      if (parsed.some(isNaN)) {
        setState(s => ({ ...s, alertMsg: 'Wypełnij wszystkie okienka poprawnymi liczbami.' }));
        return;
      }
      const correct = fuzzyEinsteinSum(state.A_rozszerzone, state.B_rozszerzone);
      const isMatch = parsed.every((val, i) => Math.abs(val - correct[i]) < 0.05);
      setState(s => ({ ...s, isCorrect_einstein: isMatch }));
    }
    // MIARY
    else if (taskType === 'in') {
      const parsed = parseFloat(state.userIn.trim().replace(',', '.'));
      if (isNaN(parsed)) {
        setState(s => ({ ...s, alertMsg: 'Wpisz poprawną liczbę.' }));
        return;
      }
      const correct = calcIn(state.A_miary);
      setState(s => ({ ...s, isCorrect_in: Math.abs(parsed - correct) < 0.05 }));
    } else if (taskType === 't1') {
      const parsed = parseFloat(state.userT1.trim().replace(',', '.'));
      if (isNaN(parsed)) {
        setState(s => ({ ...s, alertMsg: 'Wpisz poprawną liczbę.' }));
        return;
      }
      const correct = calcT1(state.S_miary);
      setState(s => ({ ...s, isCorrect_t1: Math.abs(parsed - correct) < 0.05 }));
    }
  };

  let themeClass = 'theme-lloyd';
  if (state.mode === 'operacje') themeClass = 'theme-kai';
  if (state.mode === 'przekroje') themeClass = 'theme-jay';
  if (state.mode === 'rozszerzone') themeClass = 'theme-cole';
  if (state.mode === 'miary') themeClass = 'theme-zane';

  useEffect(() => {
    document.body.className = themeClass;
  }, [themeClass]);

  // Loading safety
  if (state.mode === 'podstawy' && state.A_podstawy.length === 0) return null;
  if (state.mode === 'operacje' && state.A_operacje.length === 0) return null;
  if (state.mode === 'przekroje' && state.A_przekroje.length === 0) return null;
  if (state.mode === 'rozszerzone' && state.A_rozszerzone.length === 0) return null;
  if (state.mode === 'miary' && state.A_miary.length === 0) return null;

  const ninjaQuotes: Record<AppMode, string> = {
    podstawy: '"Fair? Fair isn\'t a word from where I come from!" ~ Lloyd',
    operacje: '"Sensei once told me it\'s not the size of the ninja in a fight, but the size of the fight in the ninja" ~ Kai',
    przekroje: '"ALRIGHT?! WHO TOOK MY PUDDING CUP?" ~ Jay',
    rozszerzone: '"Cake is usually the answer to anything." ~ Cole',
    miary: '"This isn\'t about numbers, this is about family." ~ Zane',
  };

  const formatSet = (set: number[]) => {
    return `{ ${set.map((val, idx) => `${val}/x${idx + 1}`).join(' + ')} }`;
  };

  return (
    <div className={cn("theme-container", themeClass)}>
      <div className="lego-panel">
        <h1 className="title">Ninja Fuzzy Set</h1>
        <p className="subtitle" style={{ color: 'var(--theme-primary)' }}>{ninjaQuotes[state.mode]}</p>

        <div className="tab-switcher" style={{ marginBottom: '2rem' }}>
          <button className={cn("tab-btn", state.mode === 'podstawy' && "active")} onClick={() => switchMode('podstawy')}>
            <NinjaIcon color="#22c55e" darkColor="#15803d" /> Podstawy
          </button>
          <button className={cn("tab-btn", state.mode === 'operacje' && "active")} onClick={() => switchMode('operacje')}>
            <NinjaIcon color="#ef4444" darkColor="#991b1b" /> Operacje
          </button>
          <button className={cn("tab-btn", state.mode === 'przekroje' && "active")} onClick={() => switchMode('przekroje')}>
            <NinjaIcon color="#3b82f6" darkColor="#1e3a8a" /> Przekroje
          </button>
          <button className={cn("tab-btn", state.mode === 'rozszerzone' && "active")} onClick={() => switchMode('rozszerzone')}>
            <NinjaIcon color="#334155" darkColor="#0f172a" /> Rozszerzone
          </button>
          <button className={cn("tab-btn", state.mode === 'miary' && "active")} onClick={() => switchMode('miary')}>
            <NinjaIcon color="#e2e8f0" darkColor="#64748b" /> Miary
          </button>
        </div>

        {/* ----------------- PODSTAWY ----------------- */}
        {state.mode === 'podstawy' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="operation-type">Zbiór rozmyty A w przestrzeni X = {'{'}x1, x2, x3, x4, x5{'}'}</div>
              <div className="array-display">
                <span className="array-label">A =</span>
                <span className="array-values">{formatSet(state.A_podstawy)}</span>
              </div>
            </div>

            {/* Kardynalność */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">1. Kardynalność zbioru (Moc zbioru)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Oblicz card(A).</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-dark)' }}>card(A) = </span>
                  <input type="text" className="answer-box" style={{ width: '6rem' }} value={state.userCard}
                    onChange={(e) => setState(s => ({ ...s, userCard: e.target.value, isCorrect_card: null }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck('card')} />
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('card')}
                showSolution={state.showSolution_card} onToggleSolution={() => setState(s => ({ ...s, showSolution_card: !s.showSolution_card }))}
                showHelp={state.showHelp_card} onToggleHelp={() => setState(s => ({ ...s, showHelp_card: !s.showHelp_card }))}
              />
              <TaskResult isCorrect={state.isCorrect_card} />
              {state.showHelp_card && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Kardynalność zbioru rozmytego to suma wszystkich jego wartości przynależności (liczb przed znakiem /).</p>
                  </div>
                </div>
              )}
              {state.showSolution_card && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: card(A) = {calcCard(state.A_podstawy).toFixed(1)}</span>
                </div>
              )}
            </TaskSection>

            {/* Wysokość */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">2. Wysokość zbioru</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Oblicz hgt(A).</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-dark)' }}>hgt(A) = </span>
                  <input type="text" className="answer-box" style={{ width: '6rem' }} value={state.userHgt}
                    onChange={(e) => setState(s => ({ ...s, userHgt: e.target.value, isCorrect_hgt: null }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck('hgt')} />
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('hgt')}
                showSolution={state.showSolution_hgt} onToggleSolution={() => setState(s => ({ ...s, showSolution_hgt: !s.showSolution_hgt }))}
                showHelp={state.showHelp_hgt} onToggleHelp={() => setState(s => ({ ...s, showHelp_hgt: !s.showHelp_hgt }))}
              />
              <TaskResult isCorrect={state.isCorrect_hgt} />
              {state.showHelp_hgt && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Wysokość zbioru rozmytego to jego maksymalna wartość przynależności. Jeżeli hgt(A)=1, zbiór nazywamy normalnym.</p>
                  </div>
                </div>
              )}
              {state.showSolution_hgt && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: hgt(A) = {calcHgt(state.A_podstawy).toFixed(1)}</span>
                </div>
              )}
            </TaskSection>

            {/* Nośnik */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">3. Wielkość nośnika (Support)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Ile elementów należy do nośnika zbioru A? (czyli podaj wielkość zbioru supp(A))</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-dark)' }}>|supp(A)| = </span>
                  <input type="text" className="answer-box" style={{ width: '6rem' }} value={state.userSupp}
                    onChange={(e) => setState(s => ({ ...s, userSupp: e.target.value, isCorrect_supp: null }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck('supp')} />
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('supp')}
                showSolution={state.showSolution_supp} onToggleSolution={() => setState(s => ({ ...s, showSolution_supp: !s.showSolution_supp }))}
                showHelp={state.showHelp_supp} onToggleHelp={() => setState(s => ({ ...s, showHelp_supp: !s.showHelp_supp }))}
              />
              <TaskResult isCorrect={state.isCorrect_supp} />
              {state.showHelp_supp && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Nośnik zbioru rozmytego (support) to ostry zbiór elementów przestrzeni rozważań, których stopień przynależności jest <strong>ostro większy od zera</strong> (μ(x) &gt; 0). Policz ile jest takich elementów.</p>
                  </div>
                </div>
              )}
              {state.showSolution_supp && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: |supp(A)| = {calcSuppSize(state.A_podstawy)}</span>
                </div>
              )}
            </TaskSection>
          </>
        )}

        {/* ----------------- OPERACJE ----------------- */}
        {state.mode === 'operacje' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="operation-type">Zbiory rozmyte A i B w przestrzeni X</div>
              <div className="array-display">
                <span className="array-label">A =</span>
                <span className="array-values">{formatSet(state.A_operacje)}</span>
              </div>
              <div className="array-display" style={{ marginTop: '0.5rem' }}>
                <span className="array-label">B =</span>
                <span className="array-values">{formatSet(state.B_operacje)}</span>
              </div>
            </div>

            {/* Suma */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">1. Suma Zbiorów (A ∪ B)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Wpisz wartości przynależności sumy zbiorów dla elementów x1, ..., x5.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userSuma.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userSuma]; newAns[idx] = e.target.value; setState(s => ({ ...s, userSuma: newAns, isCorrect_suma: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('suma'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('suma')}
                showSolution={state.showSolution_suma} onToggleSolution={() => setState(s => ({ ...s, showSolution_suma: !s.showSolution_suma }))}
                showHelp={state.showHelp_suma} onToggleHelp={() => setState(s => ({ ...s, showHelp_suma: !s.showHelp_suma }))}
              />
              <TaskResult isCorrect={state.isCorrect_suma} />
              {state.showHelp_suma && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Suma zbiorów rozmytych (standardowa t-konorma, operator MAX): Dla każdego elementu wybierz <strong>większą</strong> wartość przynależności z obu zbiorów. Wzór: μ<sub>A∪B</sub>(x) = max(μ<sub>A</sub>(x), μ<sub>B</sub>(x)).</p>
                  </div>
                </div>
              )}
              {state.showSolution_suma && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: A ∪ B = {formatSet(fuzzyUnion(state.A_operacje, state.B_operacje))}</span>
                </div>
              )}
            </TaskSection>

            {/* Iloczyn */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">2. Iloczyn (Przekrój) Zbiorów (A ∩ B)</div>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userIloczyn.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userIloczyn]; newAns[idx] = e.target.value; setState(s => ({ ...s, userIloczyn: newAns, isCorrect_iloczyn: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('iloczyn'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('iloczyn')}
                showSolution={state.showSolution_iloczyn} onToggleSolution={() => setState(s => ({ ...s, showSolution_iloczyn: !s.showSolution_iloczyn }))}
                showHelp={state.showHelp_iloczyn} onToggleHelp={() => setState(s => ({ ...s, showHelp_iloczyn: !s.showHelp_iloczyn }))}
              />
              <TaskResult isCorrect={state.isCorrect_iloczyn} />
              {state.showHelp_iloczyn && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Iloczyn zbiorów rozmytych (standardowa t-norma, operator MIN): Dla każdego elementu wybierz <strong>mniejszą</strong> wartość przynależności. Wzór: μ<sub>A∩B</sub>(x) = min(μ<sub>A</sub>(x), μ<sub>B</sub>(x)).</p>
                  </div>
                </div>
              )}
              {state.showSolution_iloczyn && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: A ∩ B = {formatSet(fuzzyIntersection(state.A_operacje, state.B_operacje))}</span>
                </div>
              )}
            </TaskSection>

            {/* Dopełnienie */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">3. Dopełnienie Zbioru (A<sup>c</sup>)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Wyznacz dopełnienie zbioru A.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userDopelnienie.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userDopelnienie]; newAns[idx] = e.target.value; setState(s => ({ ...s, userDopelnienie: newAns, isCorrect_dopelnienie: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('dopelnienie'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('dopelnienie')}
                showSolution={state.showSolution_dopelnienie} onToggleSolution={() => setState(s => ({ ...s, showSolution_dopelnienie: !s.showSolution_dopelnienie }))}
                showHelp={state.showHelp_dopelnienie} onToggleHelp={() => setState(s => ({ ...s, showHelp_dopelnienie: !s.showHelp_dopelnienie }))}
              />
              <TaskResult isCorrect={state.isCorrect_dopelnienie} />
              {state.showHelp_dopelnienie && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Dopełnienie zbioru to po prostu odjęcie wartości przynależności od jedności. Wzór: μ<sub>A<sup>c</sup></sub>(x) = 1 - μ<sub>A</sub>(x).</p>
                  </div>
                </div>
              )}
              {state.showSolution_dopelnienie && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: A<sup>c</sup> = {formatSet(fuzzyComplement(state.A_operacje))}</span>
                </div>
              )}
            </TaskSection>
          </>
        )}

        {/* ----------------- PRZEKROJE ----------------- */}
        {state.mode === 'przekroje' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="operation-type">Zbiór rozmyty A w przestrzeni X</div>
              <div className="array-display">
                <span className="array-label">A =</span>
                <span className="array-values">{formatSet(state.A_przekroje)}</span>
              </div>
            </div>

            {/* Alpha cut */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">Ostry α-przekrój (α = {state.alpha.toFixed(1)})</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Wpisz 1, jeśli element należy do przekroju, w przeciwnym razie wpisz 0.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userPrzekroj.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userPrzekroj]; newAns[idx] = e.target.value; setState(s => ({ ...s, userPrzekroj: newAns, isCorrect_przekroj: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('przekroj'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('przekroj')}
                showSolution={state.showSolution_przekroj} onToggleSolution={() => setState(s => ({ ...s, showSolution_przekroj: !s.showSolution_przekroj }))}
                showHelp={state.showHelp_przekroj} onToggleHelp={() => setState(s => ({ ...s, showHelp_przekroj: !s.showHelp_przekroj }))}
              />
              <TaskResult isCorrect={state.isCorrect_przekroj} />
              {state.showHelp_przekroj && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>α-przekrój to zbiór ostry (klasyczny), do którego wchodzą wszystkie elementy, których przynależność jest <strong>większa lub równa α</strong>. Wstaw 1, jeśli μ(x) ≥ {state.alpha.toFixed(1)}, w przeciwnym razie 0.</p>
                  </div>
                </div>
              )}
              {state.showSolution_przekroj && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: α-przekrój = {'{'} {calcAlphaCut(state.A_przekroje, state.alpha).map((v, i) => `${v}/x${i+1}`).join(', ')} {'}'}</span>
                </div>
              )}
            </TaskSection>
          </>
        )}

        {/* ----------------- ROZSZERZONE ----------------- */}
        {state.mode === 'rozszerzone' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="operation-type">Zbiory rozmyte A i B w przestrzeni X</div>
              <div className="array-display">
                <span className="array-label">A =</span>
                <span className="array-values">{formatSet(state.A_rozszerzone)}</span>
              </div>
              <div className="array-display" style={{ marginTop: '0.5rem' }}>
                <span className="array-label">B =</span>
                <span className="array-values">{formatSet(state.B_rozszerzone)}</span>
              </div>
            </div>

            {/* Roznica */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">1. Różnica Zbiorów (A \ B)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Wpisz wartości różnicy zbiorów $A \cap B^c$.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userRoznica.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userRoznica]; newAns[idx] = e.target.value; setState(s => ({ ...s, userRoznica: newAns, isCorrect_roznica: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('roznica'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('roznica')}
                showSolution={state.showSolution_roznica} onToggleSolution={() => setState(s => ({ ...s, showSolution_roznica: !s.showSolution_roznica }))}
                showHelp={state.showHelp_roznica} onToggleHelp={() => setState(s => ({ ...s, showHelp_roznica: !s.showHelp_roznica }))}
              />
              <TaskResult isCorrect={state.isCorrect_roznica} />
              {state.showHelp_roznica && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Różnicę zbiorów liczymy zwykle jako przecięcie z dopełnieniem: <strong>min(μ<sub>A</sub>(x), 1 - μ<sub>B</sub>(x))</strong>.</p>
                  </div>
                </div>
              )}
              {state.showSolution_roznica && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: A \ B = {formatSet(fuzzyDifference(state.A_rozszerzone, state.B_rozszerzone))}</span>
                </div>
              )}
            </TaskSection>

            {/* Suma Einsteina */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">2. Suma Einsteina (A ⊕ B)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Wpisz wartości sumy Einsteina (do 1 miejsca po przecinku).</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  {state.userEinstein.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ fontFamily: 'Fira Code', fontSize: '1.15rem', fontWeight: 800, whiteSpace: 'nowrap' }}>x{idx + 1}:</span>
                      <input type="text" className="answer-box" style={{ width: '4rem', height: '3.5rem', fontSize: '1.25rem' }} value={val}
                        onChange={(e) => { const newAns = [...state.userEinstein]; newAns[idx] = e.target.value; setState(s => ({ ...s, userEinstein: newAns, isCorrect_einstein: null })); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCheck('einstein'); }} />
                    </div>
                  ))}
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('einstein')}
                showSolution={state.showSolution_einstein} onToggleSolution={() => setState(s => ({ ...s, showSolution_einstein: !s.showSolution_einstein }))}
                showHelp={state.showHelp_einstein} onToggleHelp={() => setState(s => ({ ...s, showHelp_einstein: !s.showHelp_einstein }))}
              />
              <TaskResult isCorrect={state.isCorrect_einstein} />
              {state.showHelp_einstein && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Suma Einsteina (s-norma) to wzór: <strong>(a + b) / (1 + ab)</strong>, gdzie a i b to wartości μ(x) ze zbiorów A i B.</p>
                  </div>
                </div>
              )}
              {state.showSolution_einstein && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: A ⊕ B = {formatSet(fuzzyEinsteinSum(state.A_rozszerzone, state.B_rozszerzone))}</span>
                </div>
              )}
            </TaskSection>
          </>
        )}

        {/* ----------------- MIARY ----------------- */}
        {state.mode === 'miary' && (
          <>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="operation-type">Zbiór rozmyty A oraz podsumowanie z S</div>
              <div className="array-display">
                <span className="array-label">A =</span>
                <span className="array-values">{formatSet(state.A_miary)}</span>
              </div>
              <div className="array-display" style={{ marginTop: '0.5rem' }}>
                <span className="array-label">S =</span>
                <span className="array-values">{formatSet(state.S_miary)}</span>
              </div>
            </div>

            {/* Indeks rozmycia */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">1. Stopień rozmycia in(A)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Oblicz stopień rozmycia in(A) podanego zbioru A.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-dark)' }}>in(A) = </span>
                  <input type="text" className="answer-box" style={{ width: '6rem' }} value={state.userIn}
                    onChange={(e) => setState(s => ({ ...s, userIn: e.target.value, isCorrect_in: null }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck('in')} />
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('in')}
                showSolution={state.showSolution_in} onToggleSolution={() => setState(s => ({ ...s, showSolution_in: !s.showSolution_in }))}
                showHelp={state.showHelp_in} onToggleHelp={() => setState(s => ({ ...s, showHelp_in: !s.showHelp_in }))}
              />
              <TaskResult isCorrect={state.isCorrect_in} />
              {state.showHelp_in && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Zgodnie ze wzorem z zajęć, stopień rozmycia definiujemy jako <strong>|supp(A)| / |X|</strong>.</p>
                    <p>Oblicz moc nośnika zbioru (ile liczb jest &gt; 0) i podziel przez całkowitą liczbę elementów przestrzeni X (która tutaj wynosi 5).</p>
                  </div>
                </div>
              )}
              {state.showSolution_in && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: in(A) = {calcSuppSize(state.A_miary)} / {state.A_miary.length} = {calcIn(state.A_miary).toFixed(1)}</span>
                </div>
              )}
            </TaskSection>

            {/* Miara T1 */}
            <TaskSection>
              <div className="card">
                <div className="operation-type">2. Miara prawdziwości T1 (Kwantyfikator względny)</div>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>Mamy podsumowanie "Większość obiektów jest S". Kwantyfikator "Większość" dany jest wzorem μ<sub>Q</sub>(x) = x<sup>2</sup>. Oblicz T<sub>1</sub> dla podanego zbioru S.</p>
              </div>
              <div className="input-group">
                <div className="answers-row">
                  <span style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-dark)' }}>T1 = </span>
                  <input type="text" className="answer-box" style={{ width: '6rem' }} value={state.userT1}
                    onChange={(e) => setState(s => ({ ...s, userT1: e.target.value, isCorrect_t1: null }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheck('t1')} />
                </div>
              </div>
              <TaskControls
                onCheck={() => handleCheck('t1')}
                showSolution={state.showSolution_t1} onToggleSolution={() => setState(s => ({ ...s, showSolution_t1: !s.showSolution_t1 }))}
                showHelp={state.showHelp_t1} onToggleHelp={() => setState(s => ({ ...s, showHelp_t1: !s.showHelp_t1 }))}
              />
              <TaskResult isCorrect={state.isCorrect_t1} />
              {state.showHelp_t1 && (
                <div className="sensei-container" style={{ marginTop: '1rem' }}>
                  <SenseiWuIcon className="sensei-avatar" />
                  <div className="help-box">
                    <p>Dla podsumowania bez kwalifikatora z kwantyfikatorem względnym, obliczamy <strong>r = Σ μ<sub>S</sub>(x)</strong> i używamy wzoru: <strong>T<sub>1</sub> = μ<sub>Q</sub>(r / m)</strong>, gdzie m to wielkość bazy (tutaj 5).</p>
                    <p>W skrócie: Oblicz średnią wartość ze zbioru S, a następnie podnieś ją do kwadratu!</p>
                  </div>
                </div>
              )}
              {state.showSolution_t1 && (
                <div className="solution-box" style={{ marginTop: '1rem' }}>
                  <span>Odpowiedź: T1 = {calcT1(state.S_miary).toFixed(2)}</span>
                </div>
              )}
            </TaskSection>
          </>
        )}

        <button className="btn btn-secondary" style={{ width: '100%', padding: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }} onClick={() => generateProblem()}>
          <RefreshCw size={24} style={{ marginRight: '0.75rem' }} />
          Wylosuj Nowe Zadania
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>
          "Never put off until tomorrow what can be done today!" ~ Sensei Wu
        </div>
      </div>

      <ModalAlert msg={state.alertMsg} onClose={() => setState(s => ({ ...s, alertMsg: null }))} />
    </div>
  );
}

export default App;
