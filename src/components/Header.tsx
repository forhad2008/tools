import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  Paintbrush, 
  X,
  SlidersHorizontal,
  LayoutGrid,
  Maximize2,
  Columns
} from 'lucide-react';
import { BrushCategory } from '../types';
import { BRUSH_CATEGORIES } from '../data/brushes';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: BrushCategory | 'all';
  onSelectCategory: (cat: BrushCategory | 'all') => void;
  onOpenDownloadModal: () => void;
  onOpenGitHubModal?: () => void;
  viewMode: 'split' | 'canvas' | 'gallery';
  onChangeViewMode: (mode: 'split' | 'canvas' | 'gallery') => void;
  totalBrushes: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenDownloadModal,
  viewMode,
  onChangeViewMode,
  totalBrushes,
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40 text-neutral-100 transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-500 p-0.5 shadow-md shadow-cyan-950/40 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[7px] sm:rounded-[10px] flex items-center justify-center">
                <Paintbrush className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-cyan-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-base font-bold tracking-tight text-white truncate">
                  30 Pro Brushes
                </span>
                <span className="px-1.5 sm:px-2 py-0.2 text-[9px] sm:text-xs font-semibold rounded-full bg-neutral-900 text-cyan-300 border border-neutral-800 shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden md:block truncate">
                Photoshop (.ABR / 2048px Stamps) &amp; Illustrator (Vector SVGs)
              </p>
            </div>
          </div>

          {/* Desktop & Tablet Search bar */}
          <div className="flex-1 max-w-sm lg:max-w-md relative hidden md:block">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="brush-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search 30 brushes (e.g. Inking, Halftone, Moon, Shading)..."
              className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-neutral-900/90 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Actions & Responsive Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-1.5 sm:p-2 rounded-lg md:hidden text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* View Mode Switcher (All Devices) */}
            <div className="flex items-center bg-neutral-900 p-0.5 sm:p-1 rounded-lg border border-neutral-800 text-[11px] sm:text-xs">
              <button
                onClick={() => onChangeViewMode('split')}
                className={`px-1.5 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === 'split'
                    ? 'bg-neutral-800 text-cyan-300 font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Split Studio & Gallery"
              >
                <Columns className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Split</span>
              </button>
              <button
                onClick={() => onChangeViewMode('canvas')}
                className={`px-1.5 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === 'canvas'
                    ? 'bg-neutral-800 text-cyan-300 font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Full Canvas Studio"
              >
                <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Canvas</span>
              </button>
              <button
                onClick={() => onChangeViewMode('gallery')}
                className={`px-1.5 sm:px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  viewMode === 'gallery'
                    ? 'bg-neutral-800 text-cyan-300 font-medium shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="30 Brushes Gallery"
              >
                <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Cards</span>
              </button>
            </div>

            {/* Download Full Suite CTA */}
            <button
              id="download-suite-btn"
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-neutral-950 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 hover:from-cyan-300 hover:to-indigo-300 rounded-lg shadow-sm shadow-cyan-500/20 active:scale-[0.98] transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-950 shrink-0" />
              <span className="hidden sm:inline">Download</span> Suite
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer (Visible when toggled on small screens) */}
        {isMobileSearchOpen && (
          <div className="pb-3 pt-1 md:hidden">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search brushes by name or style..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/80 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Responsive Category Pills Navigation Bar */}
        <div className="py-2.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none border-t border-neutral-900/80 -mx-3 sm:mx-0 px-3 sm:px-0">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all font-medium shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800'
            }`}
          >
            All Brushes ({totalBrushes})
          </button>
          {BRUSH_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-500/40 font-medium shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
