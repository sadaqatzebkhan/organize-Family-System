import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Download, 
  X, 
  ChevronRight,
  ExternalLink,
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
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate and download a standalone Mobile Web App Launcher file (.html)
  const triggerMobileFileDownload = (platform: 'android' | 'ios') => {
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-x2we7do72ndb63elibgcz7-117321917077.asia-east1.run.app';
      const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#1a1a1a">
  <title>The Khan Family Archive — Mazid Khail</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; text-align: center; }
    .card { background: #262626; border: 1px solid #404040; border-radius: 20px; padding: 32px 24px; max-width: 380px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; margin-bottom: 8px; font-weight: 700; }
    p { font-size: 13px; color: #a3a3a3; margin-bottom: 24px; line-height: 1.5; }
    .btn { display: block; width: 100%; background: #c2410c; color: #fff; padding: 14px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
    .btn-secondary { background: #333; color: #e5e5e5; }
  </style>
  <script>
    // Auto-redirect to live synced app
    window.location.href = "${currentUrl}";
  </script>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 12px;">🌳</div>
    <h1>Khan Family Archive</h1>
    <p>Mazid Khail Lineage & Interactive Family Tree Application</p>
    <a href="${currentUrl}" class="btn">Open App Now</a>
  </div>
</body>
</html>`;

      const blob = new Blob([launcherHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = platform === 'android' ? 'Khan_Family_Tree_Android.html' : 'Khan_Family_Tree_iOS.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(platform === 'android' ? 'Android App Downloaded!' : 'iOS App Downloaded!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const handleAndroidClick = () => {
    setSelectedDevice('android');

    // 1. If native PWA install prompt is ready, trigger it immediately
    if (deferredPrompt && onInstallApp) {
      onInstallApp();
      return;
    }

    // 2. If in iframe or preview, open in dedicated tab so browser enables install
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
    }

    // 3. Trigger immediate downloadable app file
    triggerMobileFileDownload('android');
  };

  const handleIosClick = () => {
    setSelectedDevice('ios');

    // If in iframe, open in dedicated tab for Safari
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
    }

    // Trigger immediate downloadable app file
    triggerMobileFileDownload('ios');
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
                  Select your device to download and install
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

          {/* Download feedback notification */}
          <AnimatePresence>
            {downloadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{downloadSuccess} Saved to your device!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Body: Two Direct Download Lines */}
          <div className="p-5 sm:p-6 space-y-4">
            
            {/* 1. Android Download Line */}
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
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <span>Download for Android</span>
                    </h3>
                    <p className="text-xs text-gray-600">
                      Samsung, Xiaomi, Pixel, Oppo, Vivo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                  <span>Download</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>

              {/* Android Instructions */}
              <AnimatePresence>
                {selectedDevice === 'android' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-300 text-xs text-gray-700 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>App File Ready & Downloaded</span>
                    </div>

                    <p className="text-xs text-gray-700">
                      To place the official app icon on your phone's main home screen:
                    </p>

                    <ol className="list-decimal pl-4 space-y-1 text-gray-800 font-medium">
                      <li>Open this page in <strong>Google Chrome</strong>.</li>
                      <li>Tap the <strong>three dots (⋮)</strong> at top right.</li>
                      <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    </ol>

                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => triggerMobileFileDownload('android')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Re-download File</span>
                      </button>
                      <button
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center justify-center gap-1 bg-white border border-emerald-300 text-emerald-900 px-3 py-2 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Chrome</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. iPhone / iOS Download Line */}
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
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                      <span>Download for iPhone / iOS</span>
                    </h3>
                    <p className="text-xs text-gray-600">
                      Apple iPhone & iPad (Safari)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-md">
                  <span>Download</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>

              {/* iPhone Instructions */}
              <AnimatePresence>
                {selectedDevice === 'ios' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-300 text-xs text-gray-700 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>App File Ready & Downloaded</span>
                    </div>

                    <p className="text-xs text-gray-700">
                      To install the app directly on your iPhone home screen:
                    </p>

                    <ol className="list-decimal pl-4 space-y-1 text-gray-800 font-medium">
                      <li>Open in <strong>Safari</strong> on your iPhone.</li>
                      <li>Tap the <strong>Share button (⎋ with arrow)</strong> at the bottom.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap <strong>Add</strong> in the top right corner!</li>
                    </ol>

                    <div className="pt-1 flex gap-2">
                      <button
                        onClick={() => triggerMobileFileDownload('ios')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-bold text-xs shadow-sm transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Re-download File</span>
                      </button>
                      <button
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center justify-center gap-1 bg-white border border-blue-300 text-blue-900 px-3 py-2 rounded-lg font-bold text-xs hover:bg-blue-100 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Safari</span>
                      </button>
                    </div>
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
