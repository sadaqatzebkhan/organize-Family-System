import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface MobileInstallBannerProps {
  onOpenModal: () => void;
  deferredPrompt: any;
}

export const MobileInstallBanner: React.FC<MobileInstallBannerProps> = ({
  onOpenModal,
  deferredPrompt,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already opened in standalone installed app mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  if (dismissed || isStandalone) {
    return null;
  }

  const handleQuickInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDismissed(true);
          return;
        }
      } catch (err) {
        console.error('Fast install prompt error:', err);
      }
    }
    // If prompt wasn't immediately available or iOS, open the detailed modal
    onOpenModal();
  };

  return (
    <div 
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-[#1a1a1a]/95 backdrop-blur-md text-[#fcfaf7] border-t border-white/10 shadow-2xl animate-fade-in"
      id="mobile-auto-install-banner"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* App details */}
        <div className="flex items-center gap-3 min-w-0" onClick={onOpenModal}>
          <img
            src="/developer_sadaqat.jpg"
            alt="Mazid Khail Icon"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/20 shrink-0 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded">
                Official App
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white truncate">
              Mazid Khail Family Archive
            </h4>
            <p className="text-[11px] text-gray-300 truncate">
              موبائل ہوم اسکرین پر انسٹال کریں (1-Tap)
            </p>
          </div>
        </div>

        {/* Action Button & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleQuickInstall}
            id="banner-install-button"
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>انسٹال کریں</span>
          </button>
          
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss banner"
            title="بند کریں"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
