/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CanvasStudio } from './components/CanvasStudio';
import { BrushGallery } from './components/BrushGallery';
import { BrushInspector } from './components/BrushInspector';
import { DownloadModal } from './components/DownloadModal';
import { BRUSHES } from './data/brushes';
import { BrushItem, BrushCategory, BrushDynamics } from './types';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BrushCategory | 'all'>('all');
  const [selectedBrush, setSelectedBrush] = useState<BrushItem>(BRUSHES[0]);
  const [inspectingBrush, setInspectingBrush] = useState<BrushItem | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'canvas' | 'gallery'>('split');
  
  const [currentColor, setCurrentColor] = useState('#38bdf8');
  const [dynamics, setDynamics] = useState<BrushDynamics>(BRUSHES[0].defaultDynamics);

  // Download modal state
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Select brush and sync its default dynamics
  const handleSelectBrush = (brush: BrushItem) => {
    setSelectedBrush(brush);
    setDynamics({ ...brush.defaultDynamics });
  };

  const handleUpdateDynamics = (updated: Partial<BrushDynamics>) => {
    setDynamics((prev) => ({ ...prev, ...updated }));
  };

  const handleResetDynamics = () => {
    setDynamics({ ...selectedBrush.defaultDynamics });
  };

  // Filter brushes by category & search query
  const filteredBrushes = useMemo(() => {
    return BRUSHES.filter((b) => {
      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-neutral-950">
      {/* Top Navigation Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        totalBrushes={BRUSHES.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Split View Mode */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
            {/* Left: Interactive Live Drawing Studio (6 cols on lg) */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 h-[440px] sm:h-[540px] md:h-[600px] lg:h-[660px] flex flex-col">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Interactive Brush Studio
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Touch &amp; Stylus Ready
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <CanvasStudio
                  currentBrush={selectedBrush}
                  dynamics={dynamics}
                  onUpdateDynamics={handleUpdateDynamics}
                  onResetDynamics={handleResetDynamics}
                  currentColor={currentColor}
                  onChangeColor={setCurrentColor}
                  onSelectBrush={handleSelectBrush}
                  allBrushes={BRUSHES}
                />
              </div>
            </div>

            {/* Right: 30 Brush Gallery Cards (6 cols on lg) */}
            <div className="lg:col-span-6 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  30 Pro Graphic Brushes ({filteredBrushes.length})
                </span>
                <span className="text-xs text-neutral-500">
                  Select card to test or inspect specs
                </span>
              </div>
              <BrushGallery
                brushes={filteredBrushes}
                selectedBrush={selectedBrush}
                onSelectBrush={handleSelectBrush}
                onOpenInspector={(b) => setInspectingBrush(b)}
                currentColor={currentColor}
              />
            </div>
          </div>
        )}

        {/* Canvas Only View Mode */}
        {viewMode === 'canvas' && (
          <div className="h-[480px] sm:h-[600px] md:h-[680px] lg:h-[760px] flex flex-col">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2 px-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Full Canvas Drawing Studio
              </span>
              <span className="text-xs text-neutral-500">
                Switch brushes from bottom carousel or toolbar
              </span>
            </div>
            <div className="flex-1 min-h-0">
              <CanvasStudio
                currentBrush={selectedBrush}
                dynamics={dynamics}
                onUpdateDynamics={handleUpdateDynamics}
                onResetDynamics={handleResetDynamics}
                currentColor={currentColor}
                onChangeColor={setCurrentColor}
                onSelectBrush={handleSelectBrush}
                allBrushes={BRUSHES}
              />
            </div>
          </div>
        )}

        {/* Gallery Only View Mode */}
        {viewMode === 'gallery' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-3.5 sm:p-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  30 Pro Graphic Brushes Suite
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Formatted for seamless import into Adobe Photoshop (.ABR/2048px PNG Stamps) and Adobe Illustrator (Vector SVGs)
                </p>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-sky-400 text-neutral-950 font-bold text-xs hover:from-cyan-300 hover:to-sky-300 transition-all shadow-sm shadow-cyan-500/20 shrink-0 self-start sm:self-auto"
              >
                Download All 30 Brushes (ZIP)
              </button>
            </div>
            <BrushGallery
              brushes={filteredBrushes}
              selectedBrush={selectedBrush}
              onSelectBrush={handleSelectBrush}
              onOpenInspector={(b) => setInspectingBrush(b)}
              currentColor={currentColor}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-6 text-center text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 30 Pro Graphic Brushes Suite. Free for Commercial &amp; Personal Creative Projects.</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Download Full Suite (.ZIP)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {inspectingBrush && (
        <BrushInspector
          brush={inspectingBrush}
          onClose={() => setInspectingBrush(null)}
          onSelectForCanvas={(b) => {
            handleSelectBrush(b);
            if (viewMode === 'gallery') setViewMode('split');
          }}
        />
      )}

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        totalBrushes={BRUSHES.length}
      />
    </div>
  );
}
