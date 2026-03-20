
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Destination, MapTheme, RouteInfo, Language } from '../types';

interface BottomPanelProps {
  theme: MapTheme;
  language: Language;
  onDestinationSelect: (d: Destination) => void;
  routeInfo: RouteInfo | null;
  userLocation: [number, number] | null;
  selectedPlace: Destination | null;
  onClosePlace: () => void;
  nearbyDiscovery: Destination[];
  vayuIntel: string | null;
  groundingLinks: {title: string, uri: string}[];
  onClearRoute: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobile: boolean;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ 
  theme, language, onDestinationSelect, routeInfo, selectedPlace, onClosePlace, nearbyDiscovery, vayuIntel,
  isExpanded, setIsExpanded, isMobile
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (routeInfo || selectedPlace || vayuIntel) {
      setIsExpanded(true);
      setIsSyncing(true);
      const timer = setTimeout(() => setIsSyncing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [routeInfo, selectedPlace, vayuIntel, setIsExpanded]);

  const cleanIntel = (text: string | null) => text ? text.replace(/[#*_\\]/g, '').replace(/\s+/g, ' ').trim() : '';

  return (
    <motion.div 
      drag={isMobile ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={(_, info) => {
        if (info.offset.y < -50) setIsExpanded(true);
        if (info.offset.y > 50) setIsExpanded(false);
      }}
      animate={{ 
        height: isExpanded ? (isMobile ? '85vh' : '60vh') : (isMobile ? '72px' : '84px'),
        y: 0
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed bottom-0 left-0 right-0 z-[1400] rounded-t-[24px] lg:rounded-t-[60px] shadow-3xl flex flex-col transition-all duration-500 overflow-hidden ${theme === MapTheme.DARK ? 'glass bg-slate-950/95' : 'glass-light bg-white/95 border-white/90'}`}
    >
      <div className="h-8 lg:h-12 flex items-center justify-center cursor-pointer group shrink-0" onClick={() => setIsExpanded(!isExpanded)}>
        <motion.div 
          animate={{ width: isExpanded ? 32 : 64, height: 4 }} 
          className={`rounded-full ${theme === MapTheme.DARK ? 'bg-white/10 group-hover:bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-600'} transition-all`} 
        />
      </div>

      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div key={selectedPlace ? selectedPlace.id : (routeInfo ? 'rt' : 'ds')} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="flex-1 overflow-hidden flex flex-col px-4 lg:px-16 pb-6"
          >
            {isSyncing ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mono">Syncing Telemetry...</p>
              </div>
            ) : selectedPlace ? (
              <div className="overflow-y-auto no-scrollbar space-y-4 lg:space-y-6 h-full py-2">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 lg:space-y-3 max-w-4xl">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${theme === MapTheme.DARK ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                        {selectedPlace.category?.[language] || 'LOCATION'}
                      </div>
                    </div>
                    <h2 className={`text-xl lg:text-5xl font-black tracking-tighter leading-tight ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>{selectedPlace.name?.[language]}</h2>
                    <div className="flex items-center gap-3 lg:gap-5">
                       <span className="text-amber-500 font-black text-base lg:text-3xl">★ {selectedPlace.rating?.toFixed(1) || '4.5'}</span>
                       {selectedPlace.weather && (
                         <div className="flex items-center gap-1.5 font-black text-emerald-500 text-xs lg:text-xl">
                           <span>{selectedPlace.weather.icon}</span>
                           <span>{selectedPlace.weather.temp}°C</span>
                         </div>
                       )}
                    </div>
                  </div>
                  <button onClick={onClosePlace} className={`shrink-0 w-8 h-8 lg:w-14 lg:h-14 rounded-lg lg:rounded-2xl flex items-center justify-center transition-all ${theme === MapTheme.DARK ? 'glass hover:bg-rose-500/20' : 'glass-light hover:bg-rose-50'}`}>✕</button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
                  <button onClick={() => onDestinationSelect(selectedPlace)} className="flex-1 py-3 lg:py-5 bg-blue-600 text-white font-black text-[10px] lg:text-lg uppercase tracking-[0.3em] rounded-xl lg:rounded-3xl shadow-xl active:scale-95 transition-all">Engage Path</button>
                  <button className={`flex-1 py-3 lg:py-5 border font-black text-[10px] lg:text-lg uppercase tracking-[0.3em] rounded-xl lg:rounded-3xl ${theme === MapTheme.DARK ? 'border-white/10 glass' : 'border-slate-200 glass-light'}`}>Archive</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 py-4 border-t border-white/5">
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 mono">Disha Spatial Summary</h4>
                      <p className={`text-xs lg:text-xl font-medium leading-relaxed ${theme === MapTheme.DARK ? 'text-slate-300' : 'text-slate-700'}`}>
                        {cleanIntel(vayuIntel || selectedPlace.description?.[language] || 'Analyzing spatial density... Syncing telemetry.')}
                      </p>
                   </div>
                   <div className="grid grid-cols-2 gap-2 lg:gap-4">
                      <div className={`p-3 lg:p-5 rounded-xl lg:rounded-2xl border ${theme === MapTheme.DARK ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                         <h5 className="text-[8px] font-black opacity-30 uppercase mb-0.5">Hours</h5>
                         <p className="font-black text-[9px] lg:text-sm truncate">{selectedPlace.hours || '09:00 - 22:00'}</p>
                      </div>
                      <div className={`p-3 lg:p-5 rounded-xl lg:rounded-2xl border ${theme === MapTheme.DARK ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                         <h5 className="text-[8px] font-black opacity-30 uppercase mb-0.5">Status</h5>
                         <p className="font-black text-[9px] lg:text-sm text-emerald-500">Operational</p>
                      </div>
                   </div>
                </div>
                <FooterBranding theme={theme} />
              </div>
            ) : routeInfo ? (
              <div className="flex flex-col h-full justify-between pb-2 pt-2">
                 <div className={`flex flex-col lg:flex-row items-center justify-between p-4 lg:p-12 rounded-2xl lg:rounded-[48px] border ${theme === MapTheme.DARK ? 'bg-blue-600/5 border-blue-600/20' : 'bg-blue-50 border-blue-100 shadow-xl'}`}>
                    <div className="text-center lg:text-left space-y-1 mb-4 lg:mb-0">
                       <p className="text-[32px] lg:text-[100px] font-black text-blue-600 tracking-tighter leading-none">{routeInfo.duration}</p>
                       <p className="font-black text-sm lg:text-3xl uppercase tracking-[0.2em] mono opacity-40">{routeInfo.distance}</p>
                    </div>
                    <button className="w-full lg:w-auto px-8 py-3 lg:px-16 lg:py-6 bg-blue-600 rounded-xl lg:rounded-3xl font-black text-[10px] lg:text-2xl uppercase tracking-[0.3em] shadow-2xl text-white active:scale-95 transition-transform">Engage</button>
                 </div>
                 <FooterBranding theme={theme} />
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6 h-full flex flex-col pt-2">
                 <div>
                    <h3 className={`text-xl lg:text-5xl font-black tracking-tighter uppercase ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>Discovery</h3>
                    <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] mono mt-0.5">Neural Mesh Active</p>
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 overflow-y-auto no-scrollbar pb-6">
                    {nearbyDiscovery.map((poi) => (
                      <div key={poi.id} onClick={() => onDestinationSelect(poi)}
                        className={`p-3 lg:p-6 glass rounded-xl lg:rounded-3xl border-white/5 hover:border-blue-600/60 transition-all group active:scale-95`}
                      >
                         <div className="text-2xl lg:text-6xl mb-2 lg:mb-4">{poi.image}</div>
                         <h4 className={`font-black text-[10px] lg:text-xl tracking-tight truncate ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-900'}`}>{poi.name?.en}</h4>
                         <div className="flex justify-between items-center text-[7px] lg:text-[9px] font-black uppercase opacity-40 mono mt-0.5">
                            <span>{poi.category?.en}</span>
                            <span className="text-amber-500">★ {poi.rating?.toFixed(1)}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 <FooterBranding theme={theme} />
              </div>
            )}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-1.5">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-500 animate-ping rounded-full" />
               <p className="text-[9px] font-black uppercase tracking-[0.6em] opacity-40 text-blue-500 mono">Disha Operational</p>
             </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FooterBranding: React.FC<{ theme: MapTheme, isSmall?: boolean }> = ({ theme }) => (
  <div className="w-full flex flex-col items-center justify-center gap-1 opacity-20 mt-4 pb-4">
    <div className={`font-black uppercase tracking-[0.6em] text-[8px] ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-950'}`}>Designed in India</div>
    <div className={`font-black uppercase tracking-[0.2em] text-[6px] ${theme === MapTheme.DARK ? 'text-white' : 'text-slate-950'}`}>© 2024 Rudratech Inc.</div>
  </div>
);
