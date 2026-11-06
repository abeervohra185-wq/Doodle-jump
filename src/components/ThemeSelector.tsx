import React from 'react';
import { X, Check } from 'lucide-react';
import { THEMES } from '../game/constants';
import { ThemeId } from '../game/types';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme,
  onClose,
}) => {
  const themeList = Object.values(THEMES);

  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-doodle text-xl font-bold text-slate-900">Choose Theme</h3>
            <p className="text-xs text-slate-500">Pick your visual playground</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Themes Grid */}
        <div className="space-y-3">
          {themeList.map((t) => {
            const isSelected = t.id === currentTheme;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Theme swatch preview */}
                  <div
                    className="w-10 h-10 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center text-lg shrink-0 overflow-hidden"
                    style={{ backgroundColor: t.canvasBg }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{
                        backgroundColor: t.playerColor,
                        borderColor: t.playerBorder,
                      }}
                    />
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{t.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
