import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, Share, PlusSquare, ArrowDown, Sparkles } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallSuccess?: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallSuccess,
}) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          if (onInstallSuccess) onInstallSuccess();
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (err) {
        console.error('Install prompt trigger failed:', err);
      } finally {
        setInstalling(false);
      }
    } else {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-[#fcfaf7] border border-black/15 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-[#1a1a1a]"
        role="dialog"
        aria-modal="true"
        id="app-install-modal"
      >
        {/* Header */}
        <div className="bg-[#1a1a1a] text-[#fcfaf7] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10 p-0.5 border border-white/20 shrink-0">
              <img 
                src="/developer_sadaqat.jpg" 
                alt="App Icon" 
                className="w-full h-full object-cover rounded-md" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Mazid Khail Family Archive</h3>
              <p className="text-[11px] text-gray-300">موبائل ایپ انسٹال کریں</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isInstalled ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg text-emerald-950">ایپ کامیابی سے انسٹال ہو گئی ہے!</h4>
              <p className="text-xs text-gray-600">
                اب یہ ایپ آپ کے موبائل کی ہوم اسکرین پر موجود ہے۔ آپ بغیر انٹرنیٹ بھی فیملی ٹری دیکھ سکتے ہیں۔
              </p>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  iPhone / iPad پر انسٹال کرنے کا آسان طریقہ
                </span>
                <p className="text-xs text-gray-600 pt-1">
                  ایپل ڈیوائس پر ایپ ہوم اسکرین پر لانے کے لیے نیچے دیے گئے 2 آسان کام کریں:
                </p>
              </div>

              <div className="space-y-2.5 bg-white p-4 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">شیئر کا بٹن دبائیں:</p>
                    <p className="text-gray-600">نیچے سفاری براؤزر میں شیئر <strong>Share (<Share className="w-3.5 h-3.5 inline text-blue-600" />)</strong> آئیکن پر کلک کریں۔</p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-2.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Add to Home Screen منتخب کریں:</p>
                    <p className="text-gray-600">تھوڑا نیچے سکرول کر کے <strong>"Add to Home Screen" (<PlusSquare className="w-3.5 h-3.5 inline text-gray-700" />)</strong> دبائیں۔</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
              >
                سمجھ گیا (Done)
              </button>
            </div>
          ) : (
            /* Android / Chrome One-Tap Install */
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 flex items-center gap-3.5 shadow-xs">
                <img 
                  src="/logo.svg" 
                  alt="Mazid Khail Logo" 
                  className="w-14 h-14 rounded-xl object-cover border border-amber-900/10 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#c2410c] block">
                    Official Mobile Application
                  </span>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-snug">
                    The M_Z_K Family
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    85 افراد پر مشتمل مکمل شجرہ نسب اور تاریخ
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs text-amber-950 space-y-1">
                <p className="font-semibold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#c2410c]" />
                  <span>1-Click Direct Home Screen Install:</span>
                </p>
                <p className="text-[11px] text-gray-700">
                  بٹن دبانے پر پلے اسٹور کی طرح ایپ کا آئیکن آپ کے فون کی ہوم اسکرین پر شامل ہو جائے گا۔
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {/* 1. Real APK Download Button */}
                <a
                  href="/Mazid_Khail_Family_Archive.apk"
                  download="Mazid_Khail_Family_Archive.apk"
                  id="modal-download-apk-btn"
                  className="w-full py-3 bg-[#1a1a1a] hover:bg-black text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.98] text-center"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download APK File (اصلی اینڈرائیڈ اے پی کے ڈاؤنلوڈ)</span>
                </a>

                {/* 2. Direct Browser Install / Home screen */}
                {deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    id="modal-direct-install-btn"
                    className="w-full py-3 bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{installing ? 'انسٹال ہو رہا ہے...' : 'ہوم اسکرین پر شامل کریں (Add to Home Screen)'}</span>
                  </button>
                )}
              </div>

              {!deferredPrompt && (
                <div className="space-y-2 pt-1">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950">
                    <p className="font-bold text-[11px] mb-0.5">کروم براؤزر مینو سے بھی انسٹال کر سکتے ہیں:</p>
                    <p className="text-[10px] text-gray-700">
                      اوپر دائیں کونے میں تین نقطوں <strong>(⋮)</strong> پر ٹیپ کریں اور <strong>"Install app"</strong> منتخب کریں۔
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition-colors"
                  >
                    ٹھیک ہے (Close)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-[#f4efe6] px-5 py-2.5 border-t border-black/5 text-[11px] text-center text-gray-600">
          Mazid Khail Genealogical Record • Mazid Khail Family
        </div>
      </div>
    </div>
  );
};
