'use client';

import { motion } from 'framer-motion';

export function BlurOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Purple orb */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/30 blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          top: '10%',
          left: '10%',
        }}
      />

      {/* Blue orb */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-blue-500/30 blur-[100px]"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          top: '50%',
          right: '10%',
        }}
      />

      {/* Pink orb */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-pink-500/20 blur-[90px]"
        animate={{
          x: [0, 60, 0],
          y: [0, -60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          bottom: '10%',
          left: '50%',
        }}
      />
    </div>
  );
}
