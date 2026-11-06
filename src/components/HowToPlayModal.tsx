import React from 'react';
import { X, Keyboard, Shield, Rocket, Target, Zap, AlertTriangle } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-30 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-doodle text-xl font-bold text-slate-900">How to Play</h3>
            <p className="text-xs text-slate-500">Jump, shoot, and climb to the stars</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          {/* Controls */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-700" />
              <span>Controls</span>
            </h4>
            <ul className="space-y-1.5">
              <li>
                <strong className="text-slate-800">Move Left / Right:</strong> Use{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">→</kbd> or{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">A</kbd>{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">D</kbd>{' '}
                (or toggle Mouse Mode).
              </li>
              <li>
                <strong className="text-slate-800">Screen Wrap:</strong> Going past the left or right screen edge wraps you around to the other side!
              </li>
              <li>
                <strong className="text-slate-800">Shoot Snout Pellets:</strong> Press{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">Space</kbd>,{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded shadow-2xs font-mono">↑</kbd>, or tap the screen.
              </li>
            </ul>
          </div>

          {/* Platforms */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Platforms</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-emerald-700 block mb-0.5">🟢 Green (Standard)</span>
                <span>Dependable, solid platform for regular bounces.</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-sky-700 block mb-0.5">🔵 Blue (Moving)</span>
                <span>Slides horizontally left and right. Time your jump!</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-amber-800 block mb-0.5">🟤 Brown (Cracked)</span>
                <span>Crumbles immediately upon landing—never jump here!</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">⚪ White (Cloud)</span>
                <span>Vanishes after a single bounce. Don't look back!</span>
              </div>
            </div>
          </div>

          {/* Items & Power-ups */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-amber-500" />
              <span>Power-ups & Boosters</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">🌀 Spring Coil</span>
                <span>Launches you twice as high into the sky.</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">🚀 Jetpack</span>
                <span>Supercharged 5-second rocket blast with monster immunity!</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">🚁 Propeller Hat</span>
                <span>Smooth helicopter ascent through clouds.</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block mb-0.5">🛡️ Energy Shield</span>
                <span>Absorbs 1 monster collision safely.</span>
              </div>
            </div>
          </div>

          {/* Monsters */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-500" />
              <span>Monsters & Black Holes</span>
            </h4>
            <p className="text-[11px] mb-2">
              Avoid colliding with monsters from the side or bottom! You can eliminate them by shooting nose pellets or stomping directly on top of their heads.
            </p>
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-[11px]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Black Holes exert a gravitational pull—steer clear or fire pellets to neutralize them!</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Got it, Let's Jump!
        </button>
      </div>
    </div>
  );
};
