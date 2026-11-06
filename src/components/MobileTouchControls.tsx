import React from 'react';
import { ChevronLeft, ChevronRight, Crosshair } from 'lucide-react';

interface MobileTouchControlsProps {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onShoot: () => void;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onShoot,
}) => {
  return (
    <div className="md:hidden flex items-center justify-between w-full px-4 py-2 pointer-events-auto">
      {/* Directional Pad */}
      <div className="flex items-center gap-3">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftUp();
          }}
          onMouseDown={onLeftDown}
          onMouseUp={onLeftUp}
          className="w-14 h-14 bg-white/90 active:bg-slate-200 text-slate-800 rounded-2xl shadow-md border border-slate-300/80 flex items-center justify-center transition-transform active:scale-90 select-none touch-none"
          aria-label="Steer Left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onRightDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightUp();
          }}
          onMouseDown={onRightDown}
          onMouseUp={onRightUp}
          className="w-14 h-14 bg-white/90 active:bg-slate-200 text-slate-800 rounded-2xl shadow-md border border-slate-300/80 flex items-center justify-center transition-transform active:scale-90 select-none touch-none"
          aria-label="Steer Right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Shoot Pellet Button */}
      <button
        onTouchStart={(e) => {
          e.preventDefault();
          onShoot();
        }}
        onClick={onShoot}
        className="w-16 h-16 bg-amber-500 active:bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/30 flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-90 select-none touch-none cursor-pointer"
        aria-label="Fire Nose Pellet"
      >
        <Crosshair className="w-6 h-6" />
        <span className="text-[10px] font-bold tracking-wider uppercase">Shoot</span>
      </button>
    </div>
  );
};
