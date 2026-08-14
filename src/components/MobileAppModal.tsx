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
  const [selectedDevice, setSelectedDevice] = useState<'android' | 'ios' | null>(null);

  if (!isOpen) return null;

  const handleAndroidClick = () => {
    if (deferredPrompt && onInstallApp) {
      onInstallApp();
    }
    setSelectedDevice('android');
  };

  const handleIosClick = () => {
    setSelectedDevice('ios');
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
              <motion.div
                initial={{ rotate: -15, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="p-2 bg-[#c2410c] text-white rounded-lg"
              >
                <Smartphone className="w-5 h-5" />
              </motion.div>
              <div>
                <h2 className="serif text-lg font-bold">
                  Download Mobile App
                </h2>
                <p className="text-xs text-gray-300">
                  Select your device to install
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

          {/* Modal Body: Only Two Options */}
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* 1. Android Option Line */}
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleAndroidClick}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left shadow-2xs ${
                  selectedDevice === 'android'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/20'
                    : 'border-gray-200 bg-[#fcfaf7] hover:border-emerald-500 hover:bg-emerald-50/40 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
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
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedDevice === 'android' ? 'rotate-90 text-emerald-600' : 'text-gray-400'}`} />
              </motion.button>

              {/* Android Instructions when clicked */}
              <AnimatePresence>
                {selectedDevice === 'android' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-300 text-xs text-gray-700 space-y-2"
                  >
                    {deferredPrompt && onInstallApp && (
                      <button
                        onClick={onInstallApp}
                        className="w-full flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded font-bold uppercase tracking-wider text-[11px] shadow-sm mb-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tap to Complete 1-Click Install</span>
                      </button>
                    )}
                    <ol className="list-decimal pl-4 space-y-1 text-gray-800 font-medium">
                      <li>Open in <strong>Chrome</strong> on your Android phone.</li>
                      <li>Tap the <strong>three dots (⋮)</strong> menu at the top right.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. iPhone / iOS Option Line */}
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                onClick={handleIosClick}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left shadow-2xs ${
                  selectedDevice === 'ios'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-600/20'
                    : 'border-gray-200 bg-[#fcfaf7] hover:border-blue-500 hover:bg-blue-50/40 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
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
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedDevice === 'ios' ? 'rotate-90 text-blue-600' : 'text-gray-400'}`} />
              </motion.button>

              {/* iPhone Instructions when clicked */}
              <AnimatePresence>
                {selectedDevice === 'ios' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-300 text-xs text-gray-700 space-y-1.5"
                  >
                    <ol className="list-decimal pl-4 space-y-1 text-gray-800 font-medium">
                      <li>Open in <strong>Safari</strong> on your iPhone.</li>
                      <li>Tap the <strong>Share button (⎋ with arrow)</strong> at the bottom.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap <strong>Add</strong> at top right to install!</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
