import React from 'react';
import { Network, Users, GitFork, Heart, ArrowRight, BookOpen, FileText, Phone, Mail, Code, Award, QrCode, Smartphone, Download, Share2, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Person, FamilyBranch } from '../types';
import { DEVELOPER_PHOTO } from '../assets/developerPhoto';

interface HomePageProps {
  stats: {
    totalPeople: number;
    totalRelationships: number;
    totalBranches: number;
    knownLiving: number;
    knownDeceased: number;
    maxGeneration: number;
  };
  branches: FamilyBranch[];
  people: Person[];
  onNavigate: (page: 'home' | 'tree' | 'people' | 'branches' | 'admin') => void;
  onSelectPerson: (person: Person) => void;
  onSearchClick: () => void;
  onOpenPdfModal?: () => void;
  onOpenInstallModal?: () => void;
  deferredPrompt?: any;
  onInstallApp?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  people,
  onNavigate,
  onSelectPerson,
  onOpenPdfModal,
  onOpenInstallModal,
  deferredPrompt,
  onInstallApp,
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-x2we7do72ndb63elibgcz7-117321917077.asia-east1.run.app';
  const [installSuccess, setInstallSuccess] = React.useState(false);

  const handleDeviceDownload = async () => {
    // 1. Direct download real Android APK file into device storage
    const link = document.createElement('a');
    link.href = '/Mazid_Khail_Family_Archive.apk';
    link.download = 'Mazid_Khail_Family_Archive.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Also trigger native browser install prompt if available
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setInstallSuccess(true);
          return;
        }
      } catch (e) {
        console.error('Install prompt error:', e);
      }
    }

    if (onInstallApp) {
      onInstallApp();
    }

    setInstallSuccess(true);

    if (onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  return (
    <div className="space-y-16 py-8 animate-fade-in text-[#1a1a1a]">
      
      {/* Hero Section - Editorial Aesthetic */}
      <section className="bg-white border border-black/10 rounded-xl p-6 sm:p-10 lg:p-14 shadow-2xs space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c2410c]"></span>
            <span className="label-caps text-[#c2410c] text-xs font-semibold">
              The M_Z_K Family Archive • خاندانی تاریخ اور شجرہ نسب
            </span>
          </div>

          <h1 className="serif text-3xl sm:text-5xl lg:text-6xl font-medium text-[#1a1a1a] leading-tight tracking-tight">
            مزید خیل خاندان کا شجرہ نسب اور تاریخ
          </h1>

          <p className="text-gray-700 text-base sm:text-lg leading-relaxed pt-1">
            یہ ویب سائٹ مزید خیل خاندان کے خاندانی ریکارڈ اور شجرہ نسب کو محفوظ رکھنے کے لیے بنائی گئی ہے۔ یہاں ہمارے تینوں بزرگ بھائیوں — <strong className="text-gray-900 font-semibold">دور محمد خان</strong>، <strong className="text-gray-900 font-semibold">نور محمد شاہ</strong> اور <strong className="text-gray-900 font-semibold">یار محمد شاہ</strong> — کی تمام نسلوں اور افراد کی معلومات آسان اور واضح انداز میں دیکھی جا سکتی ہیں۔
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('tree')}
              id="hero-explore-tree-button"
              className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors shadow-2xs group"
            >
              <Network className="w-4 h-4 text-orange-400" />
              <span>شجرہ نسب دیکھیں (Family Tree)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('people')}
              id="hero-search-members-button"
              className="flex items-center gap-2 bg-white text-[#1a1a1a] border border-gray-300 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:border-[#1a1a1a] transition-colors shadow-2xs"
            >
              <Users className="w-4 h-4 text-[#c2410c]" />
              <span>تمام افراد کی فہرست (Directory)</span>
            </button>

            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                id="hero-open-pdf-button"
                className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-300 px-5 sm:px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-[#c2410c]" />
                <span>شجرہ نسب کی کتاب (PDF)</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* QR CODE SCANNER & APP DOWNLOAD (Clean, Minimalist Layout) */}
      <section className="bg-white border border-black/10 rounded-xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* QR Code Container */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="bg-white p-3 rounded-xl border-2 border-gray-200 shadow-sm shrink-0">
              <QRCodeSVG
                value={currentUrl}
                size={130}
                level="M"
                includeMargin={true}
                fgColor="#1a1a1a"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Smartphone className="w-4 h-4 text-[#c2410c]" />
                <span className="label-caps text-[#c2410c] text-xs font-bold">
                  Mobile Application Scanner
                </span>
              </div>
              <h3 className="serif text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                موبائل ایپ ڈاؤن لوڈ و انسٹال کریں
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                موبائل کیمرہ سے کیو آر کوڈ اسکین کریں یا براہ راست ڈاؤن لوڈ کا بٹن دبائیں۔
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full sm:w-auto shrink-0 flex flex-col items-center sm:items-end gap-2">
            <button
              onClick={handleDeviceDownload}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-[#c2410c] hover:bg-[#9a3412] text-white px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download & Install App</span>
            </button>
            {installSuccess && (
              <span className="text-xs text-emerald-600 font-medium">
                ✓ App Added to Home Screen!
              </span>
            )}
          </div>
        </div>
      </section>

      {/* URDU FRONT PAGE PREFACE SECTION (اردو تحریر) */}
      <section className="bg-[#fcfaf7] border-2 border-amber-900/20 rounded-xl p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-amber-900/20 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="label-caps text-[#c2410c]">Official Document Prologue</span>
              <h2 className="serif text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                خاندانی شجرہ نسب کا تحریری تعارف
              </h2>
            </div>
          </div>
          {onOpenPdfModal && (
            <button
              onClick={onOpenPdfModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#c2410c]" />
              <span>View Full PDF Document</span>
            </button>
          )}
        </div>

        <div className="p-6 sm:p-8 bg-white border border-amber-900/15 rounded-lg text-right space-y-4 shadow-2xs">
          <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: 'serif' }}>
            شجرہ نسب و تاریخِ خاندانِ مزید خیل (خان برادران)
          </h3>

          <blockquote className="text-sm sm:text-base italic text-amber-950 font-medium leading-relaxed bg-amber-50/60 p-4 rounded border-r-4 border-[#c2410c] my-3">
            ”جس نے اپنا نسب اور اسلاف کی تاریخ کو محفوظ رکھا، اس نے آنے والی نسلوں کو اپنی شناخت اور وقار عطا کیا۔“
          </blockquote>

          <div className="text-sm text-gray-800 leading-relaxed space-y-3">
            <p>
              <strong>پیشِ لفظ و تعارف:</strong> یہ شجرہ نسب اور خاندانی آرکائیو، خاندانِ مزید خیل کے عظیم اجداد دور محمد خان، نور محمد شاہ، اور یار محمد شاہ سے شروع ہونے والی نسلوں کے شاندار تاریخ اور نسلی روابط کا ایک جامع اور مستند ریکارڈ ہے۔ اس کا بنیادی مقصد اپنے اسلاف کی یادگار کو زندہ رکھنا، خاندانی بکھراؤ کو اتحاد میں بدلنا، اور جدید دور کی روشن نسل کو اپنے آباؤ اجداد کی قربانیوں، عظمت اور اصل جڑوں سے آراستہ و پیراستہ کرنا ہے۔
            </p>
            <p>
              اس شجرہ میں دورِ قدیم سے لے کر موجودہ دور تک تمام شاخوں (بشمول گجر خان، زرفراز خان، لال سرفراز خان، انور سرفراز خان، محمد نواز خان، گل محمد جان، خان فقیر وغیرہ) کا مکمل اور مرتب ریکارڈ پیش کیا گیا ہے۔
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT DEVELOPER & COMPILER SECTION (ڈویلپر کا تعارف) */}
      <section className="bg-white border border-gray-300 rounded-xl p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-gray-100 text-[#1a1a1a] border border-gray-300">
              <Code className="w-6 h-6 text-[#c2410c]" />
            </div>
            <div>
              <span className="label-caps text-[#c2410c]">Archive Compiler & Developer</span>
              <h2 className="serif text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                About Developer — Sadaqat Zeb Khan
              </h2>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase rounded border border-amber-300">
            System Architect
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-[#fcfaf7] p-6 sm:p-8 rounded-lg border border-gray-200">
          {/* Developer Photo */}
          <div className="shrink-0 text-center space-y-3">
            <div className="relative w-40 h-52 rounded-xl overflow-hidden border-2 border-[#1a1a1a] shadow-lg bg-gray-200 mx-auto">
              <img
                src={DEVELOPER_PHOTO}
                alt="Sadaqat Zeb Khan"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-xs font-bold text-[#1a1a1a] rounded border border-gray-300 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>Sadaqat Zeb Khan</span>
            </div>
          </div>

          {/* Details & Biography */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h3 className="serif text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
                Sadaqat Zeb Khan
              </h3>
              <p className="text-sm font-semibold text-[#c2410c] mt-0.5">
                Lead Software Engineer, Tree Algorithm Specialist & Genealogical System Compiler
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              Sadaqat Zeb Khan is a dedicated Software Engineer specializing in Data Structures, Tree Recursion, and Full-Stack System Architecture. He researched, digitised, and architected this entire genealogical platform for the Mazid Khail family tree, transforming historical manuscript records into a high-performance interactive archive for future generations.
            </p>

            {/* Contact Details Card */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded border border-gray-200 flex items-center gap-3">
                <div className="p-2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Contact Number</span>
                  <a href="tel:03426168609" className="text-xs sm:text-sm font-bold text-[#1a1a1a] hover:text-[#c2410c] block">
                    0342-6168609
                  </a>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-gray-200 flex items-center gap-3">
                <div className="p-2 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Official Email</span>
                  <a
                    href="mailto:szkyousafzai@gmail.com"
                    className="text-xs sm:text-sm font-bold text-[#1a1a1a] hover:text-[#c2410c] block break-all"
                  >
                    szkyousafzai@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="label-caps">Total Members</span>
            <Users className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
            {stats.totalPeople}
          </div>
          <div className="text-xs text-gray-500 mt-1">Archived family members</div>
        </div>

        <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="label-caps">Generations</span>
            <Network className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
            {stats.maxGeneration}
          </div>
          <div className="text-xs text-gray-500 mt-1">Ancestral generations</div>
        </div>

        <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="label-caps">Family Branches</span>
            <GitFork className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
            {stats.totalBranches}
          </div>
          <div className="text-xs text-gray-500 mt-1">Distinct sub-branches</div>
        </div>

        <div className="p-6 rounded bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="label-caps">Relationships</span>
            <Heart className="w-4 h-4 text-[#c2410c]" />
          </div>
          <div className="serif text-3xl sm:text-4xl font-light text-[#1a1a1a]">
            {stats.totalRelationships}
          </div>
          <div className="text-xs text-gray-500 mt-1">Verified parent-child links</div>
        </div>
      </section>

    </div>
  );
};


