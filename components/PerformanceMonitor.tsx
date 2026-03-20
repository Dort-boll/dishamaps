import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const PerformanceMonitor: React.FC = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const tick = (currentTime: number) => {
      frameCount++;
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed top-20 left-4 z-[3000] px-3 py-1 bg-black/50 text-white text-[10px] font-mono rounded-full backdrop-blur-sm border border-white/10"
    >
      FPS: {fps}
    </motion.div>
  );
};
