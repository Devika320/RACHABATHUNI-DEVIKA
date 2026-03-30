/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Music, 
  Gamepad2, 
  Trophy, 
  Volume2, 
  VolumeX,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

// --- Types ---
type Point = { x: number; y: number };
type Track = {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
};

const TRACKS: Track[] = [
  {
    id: 1,
    title: "Neon Pulse",
    artist: "AI Synthwave",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://picsum.photos/seed/neon1/300/300"
  },
  {
    id: 2,
    title: "Cyber Drift",
    artist: "Digital Dreams",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://picsum.photos/seed/cyber2/300/300"
  },
  {
    id: 3,
    title: "Midnight Grid",
    artist: "Retro Future",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://picsum.photos/seed/grid3/300/300"
  }
];

export default function App() {
  // --- Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  // --- Music State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Check if food is on snake
      const onSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!onSnake) break;
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    generateFood(INITIAL_SNAKE);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        setIsPaused(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, score, highScore, generateFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // --- Music Logic ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = (dir: 'next' | 'prev') => {
    let nextIndex = currentTrackIndex + (dir === 'next' ? 1 : -1);
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    }
  }, [currentTrackIndex, currentTrack.url, isPlaying]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col">
      {/* Background Neon Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-magenta-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/20 z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_8px_rgba(34,211,238,0.4)] bg-cyan-400/5">
            <Zap className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-2">
            <span className="text-white">Neon</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Snake</span>
            <span className="text-white">&</span>
            <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">Beats</span>
          </h1>
        </div>
        
        <div className="flex gap-12 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">Score</span>
            <span 
              className="text-5xl font-digital text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] glitch-text"
              data-text={score.toString().padStart(4, '0')}
            >
              {score.toString().padStart(4, '0')}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">High Score</span>
            <span 
              className="text-5xl font-digital text-magenta-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.6)] glitch-text"
              data-text={highScore.toString().padStart(4, '0')}
            >
              {highScore.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 z-10">
        
        {/* Game Area */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-magenta-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl shadow-2xl">
            <div 
              className="grid gap-1 bg-black/50 p-1 rounded-lg border border-white/5"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: 'min(80vw, 500px)',
                aspectRatio: '1/1'
              }}
            >
              {[...Array(GRID_SIZE * GRID_SIZE)].map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div 
                    key={i}
                    className={`rounded-sm transition-all duration-200 ${
                      isHead 
                        ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] z-10 scale-110' 
                        : isSnake 
                        ? 'bg-cyan-600/60' 
                        : isFood 
                        ? 'bg-magenta-500 shadow-[0_0_15px_rgba(232,121,249,0.8)] animate-pulse' 
                        : 'bg-white/5'
                    }`}
                  />
                );
              })}
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
              {(gameOver || isPaused) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center"
                >
                  {gameOver ? (
                    <>
                      <Trophy className="text-magenta-400 mb-4" size={48} />
                      <h2 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Game Over</h2>
                      <p className="text-white/60 mb-8">Final Score: {score}</p>
                      <button 
                        onClick={resetGame}
                        className="px-10 py-4 bg-cyan-400 text-black font-black uppercase tracking-[0.2em] rounded-full hover:bg-cyan-300 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.8)] flex items-center gap-3 border-2 border-white/20"
                      >
                        <RefreshCw size={20} className="animate-spin-slow" /> Play Again
                      </button>
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="text-cyan-400 mb-4" size={48} />
                      <h2 className="text-4xl font-black uppercase italic mb-6 tracking-tighter">Paused</h2>
                      <button 
                        onClick={() => setIsPaused(false)}
                        className="px-8 py-3 bg-magenta-500 text-white font-bold uppercase tracking-widest rounded-full hover:bg-magenta-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center gap-2"
                      >
                        <Play size={18} /> Resume
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Controls Hint */}
          <div className="mt-4 flex justify-center gap-4 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
            <span>Arrows to Move</span>
            <span className="w-1 h-1 bg-white/20 rounded-full self-center"></span>
            <span>Space to Pause</span>
          </div>
        </div>

        {/* Music Player Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 p-4 border-2 border-dashed border-cyan-500/30 rounded-lg screen-tear">
          {/* Now Playing Card */}
          <div className="bg-[#0a0a0a] border-2 border-magenta-500/50 rounded-none p-6 shadow-[0_0_20px_rgba(217,70,239,0.2)] relative overflow-hidden group static-noise">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-60 transition-opacity">
              <Music size={40} className="text-magenta-500 animate-pulse" />
            </div>
            
            <div className="relative z-10">
              <span className="text-[8px] font-pixel uppercase tracking-widest text-magenta-500 mb-4 block glitch-text" data-text="NOW PLAYING">NOW PLAYING</span>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <motion.img 
                    key={currentTrack.cover}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={currentTrack.cover} 
                    alt="Cover" 
                    className="w-20 h-20 rounded-none object-cover shadow-lg border-2 border-cyan-500/50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-magenta-500/20 mix-blend-overlay pointer-events-none"></div>
                </div>
                <div>
                  <h3 className="font-pixel text-[10px] leading-tight truncate w-40 text-cyan-400 mb-2">{currentTrack.title}</h3>
                  <p className="text-magenta-400 font-pixel text-[8px] opacity-60">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-black rounded-none mb-6 overflow-hidden border border-white/10">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  animate={{ 
                    width: isPlaying ? '100%' : '30%',
                    filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)']
                  }}
                  transition={{ 
                    width: { duration: 30, ease: "linear", repeat: Infinity },
                    filter: { duration: 2, ease: "linear", repeat: Infinity }
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => skipTrack('prev')}
                  className="p-2 text-cyan-500 hover:text-magenta-500 transition-colors hover:scale-125"
                >
                  <SkipBack size={24} />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-14 h-14 bg-black border-2 border-magenta-500 text-magenta-500 rounded-none flex items-center justify-center hover:bg-magenta-500 hover:text-black transition-all shadow-[0_0_20px_rgba(217,70,239,0.8)] group"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
                </button>

                <button 
                  onClick={() => skipTrack('next')}
                  className="p-2 text-cyan-500 hover:text-magenta-500 transition-colors hover:scale-125"
                >
                  <SkipForward size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Playlist */}
          <div className="bg-[#0a0a0a] border-2 border-cyan-500/30 rounded-none p-4 shadow-xl static-noise">
            <h4 className="text-[8px] font-pixel uppercase tracking-widest text-cyan-500 mb-4 px-2">UP NEXT</h4>
            <div className="space-y-2">
              {TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-none transition-all border-2 ${
                    currentTrackIndex === idx 
                      ? 'bg-magenta-500/20 text-magenta-400 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'hover:bg-cyan-500/10 text-cyan-500/60 border-transparent'
                  }`}
                >
                  <span className="text-[8px] font-pixel opacity-40">{(idx + 1).toString().padStart(2, '0')}</span>
                  <div className="text-left">
                    <div className="text-[9px] font-pixel leading-none mb-1">{track.title}</div>
                    <div className="text-[7px] font-pixel opacity-60">{track.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 px-4 py-3 bg-black border-2 border-magenta-500/30 rounded-none shadow-inner">
            <button onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <VolumeX size={18} className="text-magenta-500" /> : <Volume2 size={18} className="text-cyan-500" />}
            </button>
            <div className="flex-1 h-1 bg-white/5 rounded-none relative overflow-hidden">
              <div className="absolute inset-0 bg-magenta-500 shadow-[0_0_5px_rgba(217,70,239,0.8)] w-3/4" />
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        muted={isMuted}
        onEnded={() => skipTrack('next')}
      />

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold border-t border-white/5">
        &copy; 2026 Neon Beats Engine // System Active
      </footer>

      <style>{`
        @keyframes pulse-neon {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        .animate-pulse-neon {
          animation: pulse-neon 2s infinite;
        }
      `}</style>
    </div>
  );
}
