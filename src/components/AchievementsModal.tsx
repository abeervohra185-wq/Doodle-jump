import React from 'react';
import { X, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../game/types';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-doodle text-xl font-bold text-slate-900">Achievements</h3>
            <p className="text-xs text-slate-500">
              Unlocked: {unlockedCount} / {achievements.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                a.unlocked
                  ? 'bg-amber-50/60 border-amber-200/80 text-slate-800'
                  : 'bg-slate-50/70 border-slate-200/60 text-slate-400'
              }`}
            >
              <div className="text-2xl shrink-0 p-1 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                {a.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`font-bold text-xs ${
                      a.unlocked ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {a.title}
                  </h4>
                  {a.unlocked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
