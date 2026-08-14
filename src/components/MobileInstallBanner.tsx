import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Download, Clock, X, Sparkles } from 'lucide-react';

interface MobileInstallBannerProps {
  onOpenMobileModal: () => void;
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

export const MobileInstallBanner: React.FC<MobileInstallBannerProps> = ({
  onOpenMobileModal,
  deferredPrompt,
  onInstallApp,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('mazid_khail_mobile_prompt_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;

    if (isMobileDevice || isSmallScreen) {
      // Auto prompt appears smoothly after 800ms
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDownloadLater = () => {
    setIsDismissed(true);
    sessionStorage.setItem('mazid_khail_mobile_prompt_dismissed', 'true');
  };

  const handleDownloadNow = () => {
    if (deferredPrompt && onInstallApp) {
      onInstallApp();
    } else {
      onOpenMobileModal();
    }
    setIsDismissed(true);
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          key="mobile-install-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.aside
            key="mobile-install-card"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{
              type: 'spring',
              damping: 24,
              stiffness: 300,
            }}
            aria-label="Mobile app download suggestion"
            className="w-full max-w-sm bg-[#1a1a1a] text-white p-5 rounded-2xl shadow-2xl border border-white/15 space-y-4"
          >
            {/* Top bar with icon & close */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
                  className="p-3 bg-[#c2410c] text-white rounded-xl shadow-md shrink-0"
                >
                  <Smartphone className="w-6 h-6" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="serif font-bold text-base text-white">
                      Khan Family App
                    </h3>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
                      Mobile
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Mazid Khail Genealogical Archive
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadLater}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors -mr-1 -mt-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 leading-relaxed">
              Would you like to install or download this app onto your mobile phone for faster 1-tap access anytime?
            </p>

            {/* 2 Clear Options: Download Later vs Download Now */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Option 1: Download Later */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadLater}
                className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-gray-200 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border border-white/15"
              >
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Download Later</span>
              </motion.button>

              {/* Option 2: Download Now */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleDownloadNow}
                className="w-full flex items-center justify-center gap-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white px-3 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Download Now</span>
              </motion.button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
