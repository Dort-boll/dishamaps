
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Vayu System Failure:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 p-10 text-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="glass border-rose-500/30 p-16 rounded-[48px] max-w-2xl space-y-8"
          >
            <div className="text-8xl">⚠️</div>
            <h1 className="text-4xl font-black tracking-tighter text-white">SYSTEM DE-SYNC</h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              Vayu AGI encountered a critical spatial anomaly. The neural mesh has been disconnected to prevent telemetry corruption.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-12 py-5 bg-blue-600 rounded-full font-black uppercase tracking-[0.4em] text-sm hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/30"
            >
              Reboot System
            </button>
            <div className="pt-6 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mono">
                Error Log: {this.state.error?.message || "Unknown Sector Failure"}
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    // Fix: Using type assertion to access props.children as TypeScript is not identifying them on the class type on line 58
    return (this as any).props.children;
  }
}
