import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  X, 
  QrCode, 
  ExternalLink, 
  Sparkles,
  Layers,
  Network,
  Users,
  ShieldCheck,
  ArrowRight,
  Info,
  Globe,
  FileCode,
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
  const [copied, setCopied] = useState(false);
  const [downloadedPackage, setDownloadedPackage] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'download' | 'qr' | 'features'>('download');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && currentUrl) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'The Khan Family Archive — Mazid Khail Family Tree',
          text: 'Explore our complete interactive Mazid Khail family tree and genealogical lineage on mobile or web!',
          url: currentUrl || window.location.href,
        });
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Khan Family Archive — Mazid Khail Family Tree & Lineage App:\n${currentUrl || window.location.href}`
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleDownloadAppLauncher = () => {
    const targetUrl = currentUrl || window.location.href;
    const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#1a1a1a">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>The Khan Family Archive — Mazid Khail</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fcfaf7;
      color: #1a1a1a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .card {
      background: #ffffff;
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      max-width: 380px;
      width: 90%;
      border: 1px solid #e5e7eb;
    }
    h1 { font-family: serif; font-size: 22px; margin: 12px 0 6px; color: #1a1a1a; }
    p { font-size: 13px; color: #4b5563; line-height: 1.5; margin-bottom: 20px; }
    .btn {
      display: block;
      width: 100%;
      background: #c2410c;
      color: #ffffff;
      text-decoration: none;
      padding: 14px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      box-sizing: border-box;
      transition: background 0.2s;
    }
    .btn:hover { background: #9a3412; }
    .badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 12px;
      margin-bottom: 8px;
    }
  </style>
  <script>
    // Automatic immediate launch
    window.location.href = "${targetUrl}";
  </script>
</head>
<body>
  <div class="card">
    <div class="badge">Mazid Khail Family Archive</div>
    <h1>Khan Family Tree App</h1>
    <p>Opening the interactive genealogical archive and family tree on your phone...</p>
    <a href="${targetUrl}" class="btn">Click to Open Family Tree</a>
  </div>
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

    setDownloadedPackage(true);
    setTimeout(() => setDownloadedPackage(false), 4000);
  };

  const handleDownloadQr = () => {
    const svg = document.getElementById('mazid-khail-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const size = 600;
    canvas.width = size;
    canvas.height = size + 140;

    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, 70);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('The Khan Family Archive', size / 2, 38);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#d1d5db';
      ctx.fillText('Mazid Khail Genealogical Database & Interactive Tree', size / 2, 58);

      ctx.drawImage(img, 50, 90, 500, 500);

      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, size + 80, canvas.width, 60);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Scan with Camera to Open on Any Phone', size / 2, size + 115);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'Mazid_Khail_Family_Tree_QR.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white text-[#1a1a1a] rounded-xl border border-gray-200 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#1a1a1a] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#c2410c] text-white rounded-lg shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="serif text-lg sm:text-xl font-bold">
                Download & Open on Mobile Phone
              </h2>
              <p className="text-[11px] text-gray-300">
                Click link to download directly on this phone or scan with QR code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-300 hover:text-white rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-[#fcfaf7] px-4 pt-2 gap-2 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'download'
                ? 'border-[#c2410c] text-[#c2410c] bg-white rounded-t'
                : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download on this Phone</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-[#c2410c] text-[#c2410c] bg-white rounded-t'
                : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'features'
                ? 'border-[#c2410c] text-[#c2410c] bg-white rounded-t'
                : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Same Full Interface</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* TAB 1: DOWNLOAD ON THIS PHONE */}
          {activeTab === 'download' && (
            <div className="space-y-6">

              {/* Direct Click Link & Open Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#c2410c]" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#9a3412]">
                      Direct Mobile App Link
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Instant 1-Click
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">
                  Tap below to open or copy the direct mobile web app link on this phone:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1a1a1a] hover:bg-gray-800 text-white'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>

                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* TWO DIRECT DOWNLOAD ACTIONS */}
              <div className="space-y-3">
                <h3 className="serif text-base font-bold text-[#1a1a1a]">
                  Download & Save App to Phone
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Action 1: Download Offline Web App File */}
                  <div className="p-4 rounded-xl border-2 border-gray-200 bg-[#fcfaf7] hover:border-[#c2410c] transition-all space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#c2410c]">
                        <FileCode className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Option A: App File</h4>
                      </div>
                      <p className="text-xs text-gray-600">
                        Download <code className="text-[11px] font-bold bg-white px-1 py-0.5 rounded border border-gray-200">Mazid_Khail_Family_App.html</code> straight to your phone's downloads.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadAppLauncher}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all shadow-2xs ${
                        downloadedPackage
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#1a1a1a] hover:bg-gray-800 text-white'
                      }`}
                    >
                      {downloadedPackage ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Downloaded to Phone!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-amber-400" />
                          <span>Download App File</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action 2: Add / Install to Phone Home Screen */}
                  <div className="p-4 rounded-xl border-2 border-gray-200 bg-[#fcfaf7] hover:border-[#c2410c] transition-all space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <Smartphone className="w-4 h-4" />
                        <h4 className="font-bold text-xs uppercase tracking-wider">Option B: Home Screen</h4>
                      </div>
                      <p className="text-xs text-gray-600">
                        Add full icon directly on your phone’s home screen like an official app store app.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (deferredPrompt && onInstallApp) {
                          onInstallApp();
                        } else {
                          // Scroll to instructions below
                          const el = document.getElementById('phone-instructions');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{deferredPrompt ? '1-Tap Install Now' : 'Add to Home Screen'}</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Instructions for Android & iOS */}
              <div id="phone-instructions" className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Quick Phone Installation Steps
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Android Chrome */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-[#fcfaf7] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#1a1a1a]">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>Android (Chrome / Samsung)</span>
                    </div>
                    <ol className="text-xs text-gray-600 space-y-1 pl-4 list-decimal">
                      <li>Tap browser menu <strong>three dots (⋮)</strong> at top right.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Launch anytime from your phone's apps!</li>
                    </ol>
                  </div>

                  {/* iPhone iOS */}
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-[#fcfaf7] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#1a1a1a]">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>Apple iPhone (Safari)</span>
                    </div>
                    <ol className="text-xs text-gray-600 space-y-1 pl-4 list-decimal">
                      <li>Tap the <strong>Share button (⎋ with arrow)</strong> at bottom.</li>
                      <li>Select <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap <strong>Add</strong> in top right.</li>
                    </ol>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: QR CODE */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              
              {/* QR Container */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#fcfaf7] p-5 rounded-xl border border-gray-200">
                <div className="bg-white p-3.5 rounded-xl border border-gray-300 shadow-md shrink-0 flex flex-col items-center">
                  <QRCodeSVG
                    id="mazid-khail-qr-code"
                    value={currentUrl || 'https://ais-dev-x2we7do72ndb63elibgcz7-117321917077.asia-east1.run.app'}
                    size={170}
                    level="H"
                    includeMargin={true}
                    fgColor="#1a1a1a"
                  />
                  <span className="text-[10px] font-mono text-gray-500 mt-1 font-semibold uppercase tracking-wider">
                    Scan via Phone Camera
                  </span>
                </div>

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Instant Mobile Loading
                    </span>
                    <h3 className="serif text-lg font-bold text-[#1a1a1a]">
                      Scan QR to Open on Phone
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                      Point your phone’s camera or QR scanner at the code to open the entire Mazid Khail archive on your mobile browser instantly.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      onClick={handleDownloadQr}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] hover:bg-gray-800 text-white rounded text-xs font-bold transition-all shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save QR Image</span>
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-all shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Web URL Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Direct Mobile Web Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-[#fcfaf7] border border-gray-300 rounded px-3 py-2 text-xs font-mono text-gray-800 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-[#1a1a1a]'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EXACT SAME INTERFACE ON MOBILE */}
          {activeTab === 'features' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>100% Identical Features & Complete Interface</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  The mobile app provides the exact same rich, interactive experience as the desktop website. All records, charts, and trees are fully responsive with smooth touch-based gestures:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#fcfaf7] border border-gray-200 rounded-lg flex items-start gap-2.5">
                  <Network className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1a1a1a]">Interactive Family Trees</strong>
                    <span className="text-gray-600">Both Traditional generational chart and Interactive pan/zoom tree with touch controls.</span>
                  </div>
                </div>

                <div className="p-3 bg-[#fcfaf7] border border-gray-200 rounded-lg flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1a1a1a]">Single-Page 85-Member Chart</strong>
                    <span className="text-gray-600">Unified 1-page tree showing all 5 generations and living/deceased indicators.</span>
                  </div>
                </div>

                <div className="p-3 bg-[#fcfaf7] border border-gray-200 rounded-lg flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1a1a1a]">Searchable Directory & Profiles</strong>
                    <span className="text-gray-600">Instant query, father-son linkages, branches, and detailed member biography modal.</span>
                  </div>
                </div>

                <div className="p-3 bg-[#fcfaf7] border border-gray-200 rounded-lg flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#c2410c] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-[#1a1a1a]">Admin & PDF Book Generator</strong>
                    <span className="text-gray-600">Full management capabilities, CSV/JSON backups, and printable PDF exports.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('download')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white rounded text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download App on This Phone</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-gray-400" />
            <span>Responsive for iOS, Android, Tablets, & Desktops</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-[#1a1a1a] rounded font-bold transition-all shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
