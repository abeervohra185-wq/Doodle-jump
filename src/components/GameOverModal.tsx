import React, { useState } from 'react';
import { RotateCcw, Trophy, Share2, Check, Sparkles, Flame, Crosshair } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  monstersDefeated: number;
  springsUsed: number;
  jetpacksUsed: number;
  onRestart: () => void;
  onOpenThemes: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  monstersDefeated,
  springsUsed,
  jetpacksUsed,
  onRestart,
  onOpenThemes,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `🦘 Doodle Leap: I jumped ${score.toLocaleString()} pts! Can you beat my high score? Play now!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-20 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200/80 text-center relative overflow-hidden">
        {/* Subtle decorative header accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-lime-500 via-amber-500 to-sky-500" />

        {isNewHigh ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW HIGH SCORE!</span>
          </div>
        ) : (
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Game Over
          </div>
        )}

        <h2 className="font-doodle text-4xl font-extrabold text-slate-900 mb-1">
          {score.toLocaleString()}
        </h2>
        <p className="text-xs text-slate-500 mb-5">Altitude Points Climbed</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-5">
          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
              High
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-xs tabular-nums">
              <Trophy className="w-3 h-3 text-amber-500" />
              <span>{highScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col items-center border-x border-slate-200">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
              Monsters
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-xs tabular-nums">
              <Crosshair className="w-3 h-3 text-red-500" />
              <span>{monstersDefeated}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
              Boosts
            </span>
            <div className="flex items-center gap-1 font-bold text-slate-800 text-xs tabular-nums">
              <Flame className="w-3 h-3 text-amber-500" />
              <span>{springsUsed + jetpacksUsed}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-doodle text-lg font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again (Space)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Score</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenThemes}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Change Theme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
