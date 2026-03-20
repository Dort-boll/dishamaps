
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapLayerType, MapTheme } from '../types';

interface LayerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeLayers: MapLayerType[];
  onToggleLayer: (layer: MapLayerType) => void;
  theme: MapTheme;
  isOnline: boolean;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({ isOpen, onClose, activeLayers, onToggleLayer, theme, isOnline }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [cacheSize, setCacheSize] = useState('14.2 MB');

  const handleOfflineSync = () => {
    setIsSyncing(true);
    // Simulate region-based tile coordinate caching in IndexedDB
    setTimeout(() => {
      setIsSyncing(false);
      setCacheSize('68.4 MB');
    }, 3500);
  };

  const baseLayers = [
    { id: MapLayerType.SATELLITE, label: 'Orbital Recon', icon: '🛰️', desc: 'Satellite Imagery' },
    { id: MapLayerType.STREET, label: 'Vector Alpha', icon: '🏙️', desc: 'Urban Roadmap' },
    { id: MapLayerType.RETRO, label: 'OSM Retro', icon: '🗺️', desc: 'Open Community' },
  ];

  const overlays = [
    { id: MapLayerType.TRAFFIC, label: 'Neural Flow', icon: '🚥', desc: 'Live Traffic' },
    { id: MapLayerType.WEATHER, label: 'Atmos Feed', icon: '🌍', desc: 'Weather Patterns' },
    { id: MapLayerType.INDUSTRIAL, label: 'Planetary Grid', icon: '🌃', desc: 'Night Radiance' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }}
          className={`fixed top-0 right-0 bottom-0 w-full lg:w-[450px] p-6 lg:p-14 shadow-3xl z-[3000] border-l transition-all duration-500 overflow-y-auto no-scrollbar ${theme === MapTheme.DARK ? 'glass border-white/5' : 'glass-light border-black/5'}`}
        >
          <div className="flex justify-between items-start mb-8 lg:mb-14">
            <div>
              <h3 className={`font-black text-2xl lg:text-4xl tracking-tighter ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>Map Deck</h3>
              <p className="text-blue-500 font-black uppercase text-[8px] lg:text-[10px] tracking-[0.4em] mono mt-1">Satellite Intelligence</p>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">✕</button>
          </div>

          <div className="space-y-8 lg:space-y-12">
            <section className={`p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border shadow-2xl ${theme === MapTheme.DARK ? 'bg-blue-600/5 border-blue-600/20' : 'bg-blue-50 border-blue-100'}`}>
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                 <div>
                   <h4 className="font-black text-sm lg:text-lg uppercase tracking-widest text-blue-500">Offline Intelligence</h4>
                   <p className="text-[8px] lg:text-[10px] opacity-40 uppercase font-black">Encrypted Region Cache</p>
                 </div>
                 <span className="text-[8px] lg:text-[10px] font-black mono text-blue-500">{cacheSize}</span>
              </div>
              <button onClick={handleOfflineSync} disabled={isSyncing} className="w-full py-4 lg:py-5 bg-blue-600 text-white rounded-[16px] lg:rounded-[24px] font-black uppercase text-[8px] lg:text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 transition-transform active:scale-95">
                {isSyncing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Sync Region Tiles
                  </>
                )}
              </button>
            </section>

            <section>
              <h4 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4 lg:mb-8 mono">Basemaps</h4>
              <div className="grid grid-cols-1 gap-3 lg:gap-4">
                {baseLayers.map((l) => {
                  const active = activeLayers.includes(l.id);
                  return (
                    <div key={l.id} onClick={() => onToggleLayer(l.id)}
                      className={`p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] cursor-pointer border-2 transition-all flex items-center gap-4 lg:gap-6 ${active ? 'border-blue-600 bg-blue-600/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="text-2xl lg:text-4xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl lg:rounded-2xl bg-slate-500/5">{l.icon}</div>
                      <div className="flex-1">
                        <div className={`font-black text-sm lg:text-xl tracking-tight ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>{l.label}</div>
                        <div className="text-[8px] lg:text-[10px] font-bold opacity-30 uppercase tracking-widest">{l.desc}</div>
                      </div>
                      {active && <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4 lg:mb-8 mono">Telemetry Layers</h4>
              <div className="space-y-3 lg:space-y-4">
                {overlays.map((l) => {
                  const active = activeLayers.includes(l.id);
                  return (
                    <div key={l.id} onClick={() => onToggleLayer(l.id)}
                      className={`p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] cursor-pointer border-2 transition-all flex items-center gap-4 lg:gap-6 ${active ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                    >
                      <div className="text-2xl lg:text-4xl w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-xl lg:rounded-2xl bg-slate-500/5">{l.icon}</div>
                      <div className="flex-1">
                        <div className={`font-black text-sm lg:text-xl tracking-tight ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>{l.label}</div>
                        <div className="text-[8px] lg:text-[9px] font-bold opacity-30 uppercase tracking-widest">{l.desc}</div>
                      </div>
                      <div className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-colors ${active ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          
          <div className="mt-12 lg:mt-20 pt-10 border-t border-white/5 text-center opacity-20">
             <div className="font-black uppercase tracking-[0.8em] text-[8px] lg:text-[10px]">Designed in India</div>
             <div className="font-black uppercase tracking-[0.2em] text-[6px] lg:text-[8px] mt-2">© 2024 Rudratech Inc.</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
