
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { MapTheme, Destination, Language } from '../types';
import { POPULAR_DESTINATIONS, TRANSLATIONS } from '../constants';
import { getDistance } from 'ol/sphere';

interface HeaderProps {
  theme: MapTheme;
  language: Language;
  mapCenter: [number, number];
  onThemeToggle: () => void;
  onLanguageChange: (l: Language) => void;
  onLocate: () => void;
  onOpenLayers: () => void;
  onSuggestionSelect: (dest: Destination) => void;
  onAISearch: (query: string) => void;
  isMobile: boolean;
}

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 lg:w-8 lg:h-8">
    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="4" fill="currentColor"/>
  </svg>
);

const DISCOVERY_PROMPTS = [
  "Analyze urban density...",
  "Search for coffee nodes...",
  "Navigate to Lalbagh Core...",
  "Check atmospherics...",
  "Locate EV stations...",
  "Explore green belts..."
];

export const Header: React.FC<HeaderProps> = ({ 
  theme, language, mapCenter, onThemeToggle, onOpenLayers, onSuggestionSelect, onAISearch, isMobile
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [placeholderText, setPlaceholderText] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const fuse = useMemo(() => new Fuse(POPULAR_DESTINATIONS, {
    keys: [`name.${language}`, 'category.en'],
    threshold: 0.3,
  }), [language]);

  useEffect(() => {
    const handleTyping = () => {
      const currentPrompt = DISCOVERY_PROMPTS[promptIndex];
      const isFinishing = !isDeleting && placeholderText === currentPrompt;
      const isStartingDeleting = isDeleting && placeholderText === '';

      if (isFinishing) {
        setTypingSpeed(2000);
        setIsDeleting(true);
      } else if (isStartingDeleting) {
        setTypingSpeed(100);
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % DISCOVERY_PROMPTS.length);
      } else {
        setTypingSpeed(isDeleting ? 50 : 100);
        setPlaceholderText(current => 
          isDeleting 
            ? current.slice(0, -1) 
            : currentPrompt.slice(0, current.length + 1)
        );
      }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, promptIndex, typingSpeed]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = fuse.search(query).map(result => {
        const dest = result.item;
        const distance = getDistance(dest.coords, mapCenter) / 1000;
        return { ...dest, distance };
      }).slice(0, 5);
      setSuggestions(results);
    }, 150);
    return () => clearTimeout(timer);
  }, [query, fuse, mapCenter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }} animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[2000] p-2 lg:p-6 flex justify-center pointer-events-none"
    >
      <div className="max-w-7xl w-full flex items-center gap-2 lg:gap-5 pointer-events-auto">
        <div className={`flex items-center gap-1.5 lg:gap-5 px-2 lg:px-8 h-[44px] lg:h-[72px] rounded-xl lg:rounded-[36px] transition-all shadow-xl ${theme === MapTheme.DARK ? 'glass text-white' : 'glass-light text-slate-900 border-white/50'}`}>
          <div className="w-7 h-7 lg:w-11 lg:h-11 bg-blue-600 rounded-lg lg:rounded-[20px] flex items-center justify-center text-white shrink-0 shadow-lg">
            <LogoIcon />
          </div>
          <span className="font-black text-xs lg:text-2xl tracking-tighter hidden sm:block">Disha</span>
        </div>

        <div className="flex-1 relative" ref={dropdownRef}>
          <div className={`flex items-center px-3 lg:px-10 h-[44px] lg:h-[72px] rounded-xl lg:rounded-[36px] transition-all shadow-xl ${
            theme === MapTheme.DARK ? `glass ${isFocused ? 'ring-2 ring-blue-500' : ''}` : `glass-light border-white/50 ${isFocused ? 'ring-2 ring-blue-500' : ''}`
          }`}>
            <div className="relative flex-1 h-full flex items-center">
              <input 
                type="text" value={query} onFocus={() => setIsFocused(true)} 
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAISearch(query)}
                className="bg-transparent border-none outline-none w-full text-[10px] lg:text-xl font-black tracking-tight z-10"
                style={{ color: theme === MapTheme.DARK ? 'white' : '#0f172a' }}
              />
              {!query && (
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <span className={`text-[9px] lg:text-xl font-black tracking-tight opacity-30 ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>
                    Vayu: {placeholderText}
                    <span className="animate-pulse">|</span>
                  </span>
                </div>
              )}
            </div>
            <button onClick={() => onAISearch(query)} className="ml-1 text-slate-500 hover:text-blue-500 transition-colors">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="lg:w-5 lg:h-5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>

          <AnimatePresence>
            {isFocused && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 8 }} exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full left-0 right-0 rounded-2xl lg:rounded-[48px] shadow-3xl overflow-hidden border ${theme === MapTheme.DARK ? 'glass border-white/10' : 'glass-light border-black/5'}`}
              >
                <div className="max-h-[35vh] overflow-y-auto py-1.5 lg:py-4 no-scrollbar">
                  {suggestions.map((dest, idx) => (
                    <div key={idx} onClick={() => { onSuggestionSelect(dest); setIsFocused(false); setQuery(dest.name[language]); }}
                      className="px-4 lg:px-10 py-2 lg:py-5 flex items-center gap-3 lg:gap-8 cursor-pointer hover:bg-blue-600/10 transition-colors group"
                    >
                      <div className="text-lg lg:text-4xl w-8 h-8 lg:w-14 lg:h-14 rounded-lg bg-slate-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">{dest.image}</div>
                      <div className="flex-1">
                        <div className="font-black text-[10px] lg:text-xl truncate leading-tight">{dest.name[language]}</div>
                        <div className="text-[7px] lg:text-[12px] font-bold opacity-30 uppercase tracking-widest">{dest.distance.toFixed(1)} km away</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-1 lg:gap-4 shrink-0">
          <button onClick={onOpenLayers} className={`w-[44px] lg:w-[72px] h-[44px] lg:h-[72px] rounded-xl lg:rounded-[32px] flex items-center justify-center shadow-xl transition-all ${theme === MapTheme.DARK ? 'glass text-blue-400' : 'glass-light text-blue-600'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="lg:w-6 lg:h-6"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline></svg>
          </button>
          <button onClick={onThemeToggle} className={`w-[44px] lg:w-[72px] h-[44px] lg:h-[72px] rounded-xl lg:rounded-[32px] flex items-center justify-center shadow-xl transition-all ${theme === MapTheme.DARK ? 'glass text-yellow-400' : 'glass-light text-blue-600'}`}>
            <span className="text-sm lg:text-2xl">{theme === MapTheme.DARK ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};
