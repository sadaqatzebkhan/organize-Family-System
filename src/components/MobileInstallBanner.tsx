import React, { useState, useEffect } from 'react';
import { Smartphone, Download, QrCode, X, Share2, Sparkles, Check, ArrowDownToLine, Link2 } from 'lucide-react';

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
    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('mazid_khail_mobile_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Detect mobile or small screen
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth <= 768;
      if (isMobileDevice || isSmallScreen) {
        setIsVisible(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isVisible || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('mazid_khail_mobile_banner_dismissed', 'true');
  };

  const handleDownloadAppLauncher = () => {
    const targetUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-x2we7do72ndb63elibgcz7-117321917077.asia-east1.run.app';
    const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1a1a1a">
  <title>The Khan Family Archive — Mazid Khail</title>
  <script>window.location.href = "${targetUrl}";</script>
</head>
<body style="font-family:sans-serif; text-align:center; padding:40px; background:#fcfaf7;">
  <h2>Khan Family Tree Mobile App</h2>
  <p>Launching application...</p>
  <a href="${targetUrl}" style="background:#c2410c; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">Open Family Tree</a>
</body>
</html>`;

    const blob = new Blob([launcherHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Mazid_Khail_Family_App.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleInstallClick = () => {
    if (deferredPrompt && onInstallApp) {
      onInstallApp();
    } else {
      onOpenMobileModal();
    }
  };

  return (
    <aside
      aria-label="Mobile app download suggestion"
      className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-40 bg-[#1a1a1a] text-white p-3.5 sm:p-4 rounded-xl shadow-2xl border border-white/10 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        
        {/* App Icon + Text */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#c2410c] text-white rounded-lg shadow-md shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="serif font-bold text-sm text-white">
                Khan Family Mobile App
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase rounded border border-emerald-500/30">
                1-Click Direct Download
              </span>
            </div>
            <p className="text-[11px] text-gray-300 line-clamp-1">
              Click link to download app or install to your phone
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors -mr-1 -mt-1"
          aria-label="Close suggestion banner"
        >
          <X className="w-4 h-4" />
        </button>

      </div>

      {/* Buttons */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={onOpenMobileModal}
          className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all border border-white/15"
        >
          <Link2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Click Link & Options</span>
        </button>

        <button
          onClick={handleInstallClick}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#c2410c] hover:bg-[#9a3412] text-white px-3 py-1.5 rounded text-xs font-bold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download on Phone</span>
        </button>
      </div>
    </aside>
  );
};
