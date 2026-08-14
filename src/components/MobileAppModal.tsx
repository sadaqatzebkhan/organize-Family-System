import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  X, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallApp,
}) => {
  const [installStatus, setInstallStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAndroidDownload = async () => {
    // 1. If native browser PWA install prompt is ready, trigger it directly
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallStatus('Application installed successfully!');
          setTimeout(() => {
            setInstallStatus(null);
            onClose();
          }, 2000);
          return;
        }
      } catch (err) {
        console.log('Install prompt error:', err);
      }
    }

    if (onInstallApp) {
      onInstallApp();
      return;
    }

    // 2. If opened inside an iframe or preview, open directly in the browser so Chrome shows the native Install prompt
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
      onClose();
    }
  };

  const handleIosDownload = () => {
    // If inside iframe/preview, open in standalone Safari window
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="mobile-app-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      >
        <motion.div
          key="mobile-app-modal-panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{
            type: 'spring',
            damping: 25,
            stiffness: 350,
          }}
          className="relative w-full max-w-md bg-white text-[#1a1a1a] rounded-2xl border border-gray-200 shadow-2xl overflow-hidden my-4"
        >
          {/* Modal Header */}
          <div className="bg-[#1a1a1a] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#c2410c] text-white rounded-lg">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="serif text-lg font-bold">
                  Download Mobile App
                </h2>
                <p className="text-xs text-gray-300">
                  Choose your device to install
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner if installed */}
          {installStatus && (
            <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{installStatus}</span>
            </div>
          )}

          {/* Modal Body: Only Two Simple Lines */}
          <div className="p-5 sm:p-6 space-y-3.5">
            
            {/* 1. Android Option Line */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleAndroidDownload}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-500/60 bg-emerald-50/40 hover:bg-emerald-50 transition-all text-left shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Download for Android
                  </h3>
                  <p className="text-xs text-gray-600">
                    Samsung, Xiaomi, Pixel, Oppo, Vivo
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg shrink-0">
                <span>Download</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.button>

            {/* 2. iPhone / iOS Option Line */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={handleIosDownload}
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-blue-500/60 bg-blue-50/40 hover:bg-blue-50 transition-all text-left shadow-2xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    Download for iPhone / iOS
                  </h3>
                  <p className="text-xs text-gray-600">
                    Apple iPhone & iPad (Safari)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg shrink-0">
                <span>Download</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.button>

          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-5 py-1.5 bg-[#1a1a1a] hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs"
            >
              Close
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
