import React, { useEffect, useRef, useState } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Sparkles, 
  Palette, 
  Keyboard, 
  MousePointer,
  ChevronRight,
  Flame,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { GameEngine } from './game/engine';
import { GameState, ThemeId, Achievement } from './game/types';
import { THEMES } from './game/constants';
import { sound } from './game/audio';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { StartScreen } from './components/StartScreen';
import { ThemeSelector } from './components/ThemeSelector';
import { HowToPlayModal } from './components/HowToPlayModal';
import { AchievementsModal } from './components/AchievementsModal';
import { MobileTouchControls } from './components/MobileTouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('doodle_high_score') || '0', 10);
  });
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const t = localStorage.getItem('doodle_theme') as ThemeId;
    return ['classic', 'galaxy', 'jungle', 'retro'].includes(t) ? t : 'classic';
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());
  const [activePowerup, setActivePowerup] = useState<'propeller' | 'jetpack' | null>(null);
  const [powerupPercent, setPowerupPercent] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [mouseControl, setMouseControl] = useState<boolean>(false);

  // Modals
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showThemes, setShowThemes] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);

  // Initialize Game Engine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onScoreUpdate: (newScore) => {
        setScore(newScore);
      },
      onGameOver: (finalScore, isNew) => {
        setScore(finalScore);
        setIsNewHigh(isNew);
        if (isNew) {
          setHighScore(finalScore);
        }
        setGameState('GAME_OVER');
      },
      onPowerupUpdate: (type, remainingPercent) => {
        setActivePowerup(type);
        setPowerupPercent(remainingPercent);
      },
      onShieldUpdate: (shieldState) => {
        setHasShield(shieldState);
      },
      onAchievementUnlocked: (ach) => {
        setRecentAchievement(ach);
        setTimeout(() => setRecentAchievement(null), 3500);
        if (engineRef.current) {
          setAchievements([...engineRef.current.getAchievements()]);
        }
      },
    });

    engine.mouseControlEnabled = mouseControl;
    engineRef.current = engine;
    setAchievements([...engine.getAchievements()]);

    return () => {
      engine.cleanup();
    };
  }, []);

  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.startGame();
    setGameState('PLAYING');
    setIsNewHigh(false);
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (gameState === 'PLAYING') {
      engineRef.current.pauseGame();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      engineRef.current.resumeGame();
      setGameState('PLAYING');
    }
  };

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setIsMuted(!isNowMuted);
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    if (engineRef.current) {
      engineRef.current.setTheme(themeId);
    }
  };

  const handleToggleMouseControl = () => {
    const nextVal = !mouseControl;
    setMouseControl(nextVal);
    if (engineRef.current) {
      engineRef.current.mouseControlEnabled = nextVal;
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    engineRef.current.setMousePosition(canvasX);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    if (gameState !== 'PLAYING') return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    // Fire snout pellet towards click position
    engineRef.current.shoot(canvasX, canvasY);
  };

  // Mobile virtual controls handlers
  const handleLeftDown = () => {
    if (engineRef.current) engineRef.current.handleKeyDown('ArrowLeft');
  };
  const handleLeftUp = () => {
    if (engineRef.current) engineRef.current.handleKeyUp('ArrowLeft');
  };
  const handleRightDown = () => {
    if (engineRef.current) engineRef.current.handleKeyDown('ArrowRight');
  };
  const handleRightUp = () => {
    if (engineRef.current) engineRef.current.handleKeyUp('ArrowRight');
  };
  const handleMobileShoot = () => {
    if (engineRef.current) engineRef.current.shoot();
  };

  const themeConfig = THEMES[currentTheme];

  return (
    <div className={`min-h-screen flex flex-col ${themeConfig.bgClass} text-slate-800 transition-colors duration-300`}>
      {/* 
        Top Bar Contract (§2 of Universal Frontend Design Constitution):
        [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-black/8 bg-white/75 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🦘</span>
          <a
            href="/"
            className="text-lg font-doodle font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-emerald-700 transition-colors"
          >
            Doodle Leap
          </a>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How to Play
          </button>
          <button
            onClick={() => setShowThemes(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Themes
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Achievements
          </button>
          <button
            onClick={handleToggleMouseControl}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {mouseControl ? 'Mouse Controls: On' : 'Keyboard Controls'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {gameState === 'PLAYING' ? (
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pause
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Play Game
            </button>
          )}
        </div>
      </header>

      {/* Main Game Stage Layout */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full gap-8">
        {/* Left Desktop Panel: Game Info & Quick Stats */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          <div className="p-5 bg-white/85 backdrop-blur-md rounded-2xl border border-black/8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Player Record
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center text-xl shrink-0">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Personal Best</span>
                <span className="font-doodle text-2xl font-bold text-slate-900 tabular-nums">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2 pt-3 border-t border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {achievements.filter((a) => a.unlocked).length} of {achievements.length} Badges Unlocked
              </span>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="p-5 bg-white/85 backdrop-blur-md rounded-2xl border border-black/8 shadow-sm text-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-700" />
              <span>Controls</span>
            </h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Steer left / right</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  ← → or A / D
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fire nose pellet</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Space / Click
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pause game</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Esc
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleMouseControl}
              className={`w-full mt-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                mouseControl
                  ? 'bg-sky-50 text-sky-700 border-sky-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {mouseControl ? (
                <>
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Mouse Follow: Active</span>
                </>
              ) : (
                <>
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Enable Mouse Follow</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Center Game Screen (Canvas Container with arcade / notebook framing) */}
        <div className="flex flex-col items-center">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900/10 bg-white"
            style={{
              width: 'min(92vw, 440px)',
              aspectRatio: '480 / 720',
            }}
          >
            {/* The 2D Canvas */}
            <canvas
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onClick={handleCanvasClick}
              className="w-full h-full block cursor-crosshair touch-none"
            />

            {/* In-Game HUD overlay */}
            <GameHUD
              score={score}
              highScore={highScore}
              gameState={gameState}
              isMuted={isMuted}
              activePowerup={activePowerup}
              powerupPercent={powerupPercent}
              hasShield={hasShield}
              mouseControl={mouseControl}
              onToggleSound={handleToggleSound}
              onTogglePause={handleTogglePause}
              onToggleMouseControl={handleToggleMouseControl}
              onOpenHowToPlay={() => setShowHowToPlay(true)}
              onOpenThemes={() => setShowThemes(true)}
              onOpenAchievements={() => setShowAchievements(true)}
            />

            {/* Start Screen State */}
            {gameState === 'START' && (
              <StartScreen
                highScore={highScore}
                themeId={currentTheme}
                mouseControl={mouseControl}
                onStart={handleStartGame}
                onOpenHowToPlay={() => setShowHowToPlay(true)}
                onOpenThemes={() => setShowThemes(true)}
                onOpenAchievements={() => setShowAchievements(true)}
                onToggleMouseControl={handleToggleMouseControl}
              />
            )}

            {/* Paused Screen Overlay */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-20 animate-fade-in text-center">
                <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl border border-slate-200">
                  <h3 className="font-doodle text-2xl font-bold text-slate-900 mb-1">Paused</h3>
                  <p className="text-xs text-slate-500 mb-5">Take a breather</p>

                  <div className="space-y-2">
                    <button
                      onClick={handleTogglePause}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Resume (Esc)
                    </button>
                    <button
                      onClick={handleStartGame}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Restart Game
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Screen Overlay */}
            {gameState === 'GAME_OVER' && (
              <GameOverModal
                score={score}
                highScore={highScore}
                isNewHigh={isNewHigh}
                monstersDefeated={engineRef.current?.monstersDefeated || 0}
                springsUsed={engineRef.current?.springsUsed || 0}
                jetpacksUsed={engineRef.current?.jetpacksUsed || 0}
                onRestart={handleStartGame}
                onOpenThemes={() => setShowThemes(true)}
              />
            )}

            {/* In-Game Floating Achievement Notification Toast */}
            {recentAchievement && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 z-30 animate-bounce border border-amber-400/30">
                <span className="text-xl">{recentAchievement.icon}</span>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    Achievement Unlocked!
                  </div>
                  <div className="text-xs font-bold">{recentAchievement.title}</div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Touch Controls for small screens */}
          {gameState === 'PLAYING' && (
            <div className="w-full max-w-[440px] mt-3">
              <MobileTouchControls
                onLeftDown={handleLeftDown}
                onLeftUp={handleLeftUp}
                onRightDown={handleRightDown}
                onRightUp={handleRightUp}
                onShoot={handleMobileShoot}
              />
            </div>
          )}
        </div>

        {/* Right Desktop Panel: Theme Selector & Powerups showcase */}
        <aside className="hidden lg:flex flex-col gap-4 w-72 shrink-0">
          <div className="p-5 bg-white/85 backdrop-blur-md rounded-2xl border border-black/8 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Theme
              </h3>
              <button
                onClick={() => setShowThemes(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Change
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center shrink-0"
                style={{ backgroundColor: themeConfig.canvasBg }}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{
                    backgroundColor: themeConfig.playerColor,
                    borderColor: themeConfig.playerBorder,
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {themeConfig.name}
                </span>
                <span className="text-xs text-slate-500 line-clamp-1">
                  {themeConfig.description}
                </span>
              </div>
            </div>
          </div>

          {/* Powerups & Obstacles Card */}
          <div className="p-5 bg-white/85 backdrop-blur-md rounded-2xl border border-black/8 shadow-sm text-xs space-y-2.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Special Items</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">🚀 Jetpack</span>
                <span className="text-slate-500">Super speed blast</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">🚁 Propeller</span>
                <span className="text-slate-500">Smooth high flight</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">🌀 Spring</span>
                <span className="text-slate-500">Double jump boost</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">🛡️ Shield</span>
                <span className="text-slate-500">Absorbs 1 hit</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer conforming to anti-slop rules (quiet copyright & status) */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-black/6 bg-white/40">
        <p>Doodle Leap · Inspired by classic vertical jumping games · Endless arcade fun</p>
      </footer>

      {/* Modals */}
      {showThemes && (
        <ThemeSelector
          currentTheme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onClose={() => setShowThemes(false)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {showAchievements && (
        <AchievementsModal
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
    </div>
  );
}
