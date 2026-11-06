import React from 'react';
import { Play, Trophy, HelpCircle, Palette, Sparkles, Keyboard, MousePointer } from 'lucide-react';
import { THEMES } from '../game/constants';
import { ThemeId } from '../game/types';

interface StartScreenProps {
  highScore: number;
  themeId: ThemeId;
  mouseControl: boolean;
  onStart: () => void;
  onOpenHowToPlay: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
  onToggleMouseControl: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  highScore,
  themeId,
  mouseControl,
  onStart,
  onOpenHowToPlay,
  onOpenThemes,
  onOpenAchievements,
  onToggleMouseControl,
}) => {
  const currentTheme = THEMES[themeId];

  return (
    <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 z-20 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200/90 text-center relative overflow-hidden">
        {/* Playful Doodler Logo & Mascot header */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-lime-100 border-2 border-lime-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner rotate-3 hover:rotate-0 transition-transform">
            🦘
          </div>
          <h1 className="font-doodle text-4xl font-extrabold text-slate-900 tracking-tight">
            Doodle Leap
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Infinite High-Flying Arcade Jumper
          </p>
        </div>

        {/* High Score Banner */}
        {highScore > 0 && (
          <div className="mb-5 py-2 px-3 bg-amber-50 border border-amber-200/80 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-amber-900 tabular-nums">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Personal Best: {highScore.toLocaleString()} pts</span>
          </div>
        )}

        {/* Big Start Button */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-doodle text-xl font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer mb-4"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>Tap / Space to Jump</span>
        </button>

        {/* Quick Mode & Options */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={onToggleMouseControl}
            className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              mouseControl
                ? 'bg-sky-50 text-sky-700 border-sky-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {mouseControl ? (
              <>
                <MousePointer className="w-3.5 h-3.5" />
                <span>Mouse Steer</span>
              </>
            ) : (
              <>
                <Keyboard className="w-3.5 h-3.5" />
                <span>Keys: ← → / A D</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenThemes}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{currentTheme.name.split(' ')[0]} Theme</span>
          </button>
        </div>

        {/* Secondary Navigation */}
        <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
          <button
            onClick={onOpenHowToPlay}
            className="hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
          <span>·</span>
          <button
            onClick={onOpenAchievements}
            className="hover:text-slate-900 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Achievements</span>
          </button>
        </div>
      </div>
    </div>
  );
};
