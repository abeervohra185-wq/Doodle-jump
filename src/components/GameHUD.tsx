import React from 'react';
import { Volume2, VolumeX, Pause, Play, Sparkles, Shield, Rocket, HelpCircle, Trophy, Palette } from 'lucide-react';
import { GameState } from '../game/types';

interface GameHUDProps {
  score: number;
  highScore: number;
  gameState: GameState;
  isMuted: boolean;
  activePowerup: 'propeller' | 'jetpack' | null;
  powerupPercent: number;
  hasShield: boolean;
  mouseControl: boolean;
  onToggleSound: () => void;
  onTogglePause: () => void;
  onToggleMouseControl: () => void;
  onOpenHowToPlay: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  gameState,
  isMuted,
  activePowerup,
  powerupPercent,
  hasShield,
  mouseControl,
  onToggleSound,
  onTogglePause,
  onToggleMouseControl,
  onOpenHowToPlay,
  onOpenThemes,
  onOpenAchievements,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-2 z-10">
      {/* Top Bar Stats */}
      <div className="flex items-center justify-between">
        {/* Score & High Score */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-doodle text-3xl font-bold tracking-tight text-slate-900 drop-shadow-xs tabular-nums">
              {score.toLocaleString()}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
              pts
            </span>
          </div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1.5 tabular-nums">
            <Trophy className="w-3.5 h-3.5 text-amber-500 inline" />
            <span>Best: {highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls (Pointer events enabled) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/80 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-slate-200/80">
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={onTogglePause}
              aria-label="Pause Game"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Pause (Esc)"
            >
              <Pause className="w-4 h-4 text-slate-700" />
            </button>
          )}

          {gameState === 'PAUSED' && (
            <button
              onClick={onTogglePause}
              aria-label="Resume Game"
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Resume (Esc)"
            >
              <Play className="w-4 h-4 fill-emerald-600" />
            </button>
          )}

          <button
            onClick={onOpenThemes}
            aria-label="Theme Selector"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Themes"
          >
            <Palette className="w-4 h-4 text-slate-700" />
          </button>

          <button
            onClick={onOpenAchievements}
            aria-label="Achievements"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Achievements"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={onOpenHowToPlay}
            aria-label="How To Play"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Active Power-up or Shield Indicators */}
      {(activePowerup || hasShield) && (
        <div className="flex items-center gap-2 self-start animate-fade-in pointer-events-auto">
          {activePowerup && (
            <div className="flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md backdrop-blur-xs">
              <Rocket className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="capitalize">{activePowerup}</span>
              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${powerupPercent}%` }}
                />
              </div>
            </div>
          )}

          {hasShield && (
            <div className="flex items-center gap-1.5 bg-sky-500/90 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-md backdrop-blur-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Shield Active</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
