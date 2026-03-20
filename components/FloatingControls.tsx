
import React from 'react';
import { motion } from 'framer-motion';

interface FloatingControlsProps {
  onRecenter: () => void;
  onGPS: () => void;
  on3D: () => void;
  onMeasureToggle: () => void;
  is3D: boolean;
  isMeasuring: boolean;
  rotation: number;
  isBottomPanelExpanded: boolean;
  isMobile: boolean;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({ 
  onRecenter, onGPS, on3D, onMeasureToggle, is3D, isMeasuring, rotation,
  isBottomPanelExpanded, isMobile
}) => {
  return (
    <motion.div 
      animate={{ 
        bottom: isBottomPanelExpanded ? (isMobile ? '86vh' : '62vh') : (isMobile ? '84px' : '100px'),
        right: isMobile ? '10px' : '32px'
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed flex flex-col gap-2.5 lg:gap-5 z-[1001]"
    >
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onMeasureToggle}
        className={`w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl transition-all border ${isMeasuring ? 'bg-emerald-600 text-white border-transparent shadow-emerald-500/20' : 'glass border-white/5 text-emerald-500'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="lg:w-7 lg:h-7"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </motion.button>
      
      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={on3D}
        className={`w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-xl transition-all border ${is3D ? 'bg-blue-600 text-white border-transparent shadow-blue-500/20' : 'glass border-white/5 text-slate-400'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="lg:w-7 lg:h-7"><path d="M4 14l1-1 4 4 11-11"></path><path d="M20 20l-16-16"></path></svg>
      </motion.button>

      <motion.div 
        animate={{ rotate: -rotation * (180 / Math.PI) }} 
        whileHover={{ scale: 1.05 }}
        onClick={onRecenter}
        className="w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl glass flex items-center justify-center shadow-xl cursor-pointer border border-white/5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="4" className="lg:w-8 lg:h-8"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>
      </motion.div>

      <motion.button 
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onGPS}
        className="w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl text-white shadow-blue-600/30"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="lg:w-7 lg:h-7"><circle cx="12" cy="12" r="3"></circle><path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path><line x1="12" y1="2" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22"></line><line x1="2" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22" y2="12"></line></svg>
      </motion.button>
    </motion.div>
  );
};
