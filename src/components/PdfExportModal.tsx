import React, { useRef, useState } from 'react';
import { X, Printer, Download, Mail, Phone, User, BookOpen, Shield, Code, Sparkles, Award, GitBranch, ChevronDown, ChevronRight, Layers, FileText } from 'lucide-react';
import { Person, FamilyBranch } from '../types';
import { DEVELOPER_PHOTO } from '../assets/developerPhoto';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  branches: FamilyBranch[];
  stats: {
    totalPeople: number;
    totalRelationships: number;
    totalBranches: number;
    maxGeneration: number;
  };
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  people,
  branches,
  stats,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'tree' | 'cover' | 'directory' | 'all'>('tree');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Gen 1 Founders
  const founders = people.filter((p) => p.generation === 1 || !p.fatherId);

  // Helper to render tree nodes recursively from top to bottom
  const renderTreeNode = (person: Person, depth = 0) => {
    const children = people.filter((p) => p.fatherId === person.id || p.motherId === person.id);
    const father = people.find((p) => p.id === person.fatherId);

    // Generation style helpers
    const getGenBadgeColor = (gen?: number) => {
      switch (gen) {
        case 1:
          return 'bg-[#1a1a1a] text-white border-[#1a1a1a]';
        case 2:
          return 'bg-[#c2410c] text-white border-[#c2410c]';
        case 3:
          return 'bg-amber-600 text-white border-amber-600';
        case 4:
          return 'bg-amber-100 text-amber-900 border-amber-300';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    return (
      <div key={person.id} className="relative w-full print:break-inside-avoid">
        {/* Person Node Card - Super compact and fits full text */}
        <div
          className={`relative z-10 w-full p-1.5 sm:p-2 rounded-lg border transition-all my-1 shadow-2xs ${
            depth === 0
              ? 'bg-[#1a1a1a] text-white border-black'
              : depth === 1
              ? 'bg-orange-50/90 text-gray-900 border-orange-200'
              : depth === 2
              ? 'bg-amber-50/70 text-gray-900 border-amber-200'
              : depth === 3
              ? 'bg-orange-50/40 text-gray-900 border-orange-200/80'
              : 'bg-white text-gray-900 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            {/* Left: Avatar + Full Name & Father Name */}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full serif font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0 border ${
                  depth === 0
                    ? 'bg-white text-[#1a1a1a] border-white'
                    : depth === 1
                    ? 'bg-[#c2410c] text-white border-[#c2410c]'
                    : 'bg-amber-100 text-[#c2410c] border-amber-300'
                }`}
              >
                {person.fullName.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`serif font-bold text-[11px] sm:text-xs leading-tight break-words ${depth === 0 ? 'text-white' : 'text-gray-900'}`}>
                    {person.fullName}
                  </span>
                  {depth === 0 && (
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-orange-500/30 text-orange-200 px-1 py-0.2 rounded">
                      بانی
                    </span>
                  )}
                </div>
                {father && depth > 0 && (
                  <p className={`text-[9px] sm:text-[10px] leading-tight break-words mt-0.5 ${depth === 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                    ولدیت: {father.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Badges */}
            <div className="flex items-center gap-1 shrink-0">
              <span className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded border ${getGenBadgeColor(person.generation)}`}>
                G{person.generation}
              </span>
              {children.length > 0 && (
                <span className={`text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap ${
                  depth === 0
                    ? 'bg-gray-800 text-amber-300'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {children.length} اولاد
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tight Vertical Lines - Line is brought close to edge to save maximum horizontal space */}
        {children.length > 0 && (
          <div className="relative pl-1.5 sm:pl-2.5 ml-1 sm:ml-1.5 border-l-[1.5px] border-orange-300 my-0.5 space-y-0.5">
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl h-[96vh] sm:max-h-[92vh] bg-white text-[#1a1a1a] rounded-xl border border-gray-300 shadow-2xl flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Minimal Sleek Header Bar - Kept clean with maximum screen space */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1a1a1a] text-white print:hidden shrink-0 border-b border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <GitBranch className="w-4 h-4 text-[#c2410c] shrink-0" />
            <span className="font-bold text-xs sm:text-sm truncate">
              خاندانِ مزید خیل — شجرہ نسب و آرکائیو
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick clean tabs */}
            <div className="flex items-center bg-gray-800/90 p-0.5 rounded-md text-[11px]">
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-2 py-0.5 rounded transition-colors font-medium ${
                  activeTab === 'tree' ? 'bg-[#c2410c] text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                شجرہ (Tree)
              </button>
              <button
                onClick={() => setActiveTab('cover')}
                className={`px-2 py-0.5 rounded transition-colors font-medium ${
                  activeTab === 'cover' ? 'bg-[#c2410c] text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                سرورق (Cover)
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2 py-0.5 rounded transition-colors font-medium hidden sm:inline-block ${
                  activeTab === 'all' ? 'bg-[#c2410c] text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                تمام (All)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
              title="بند کریں"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body - Clean, Wide & Space-saving */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-6 print:p-4 print:overflow-visible w-full max-w-full pb-16" ref={printRef}>
          
          {/* ==================== SECTION 1: FRONT COVER & PREFACE ==================== */}
          {(activeTab === 'all' || activeTab === 'cover') && (
            <div className="border-2 sm:border-4 border-double border-[#1a1a1a] p-3 sm:p-8 flex flex-col justify-between bg-[#fdfcf9] rounded-sm print:break-after-page space-y-5">
              
              {/* Header / Top emblem */}
              <div className="text-center space-y-1">
                <div className="inline-block px-2.5 py-0.5 border border-[#1a1a1a] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#c2410c] bg-white">
                  GENEALOGICAL ARCHIVE & RECORD BOOK
                </div>
                <h1 className="serif text-xl sm:text-3xl font-bold tracking-tight text-[#1a1a1a] pt-1">
                  The M_Z_K Family Archive
                </h1>
                <p className="serif text-sm sm:text-lg italic text-gray-700 font-light">
                  خاندانِ مزید خیل — شجرہ نسب و آرکائیو
                </p>
                <div className="w-16 h-0.5 bg-[#1a1a1a] mx-auto my-2" />
              </div>

              {/* URDU PREFACE SECTION (اردو تحریر) */}
              <div className="p-3 sm:p-5 bg-amber-50/60 border border-amber-900/20 rounded-lg text-right space-y-2.5 dir-rtl shadow-2xs">
                <div className="flex items-center justify-between border-b border-amber-900/20 pb-1.5">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase text-amber-900 tracking-widest font-sans dir-ltr">
                    URDU PREFACE & PROLOGUE
                  </span>
                  <h2 className="text-sm sm:text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: 'serif' }}>
                    شجرہ نسب و تاریخِ خاندانِ مزید خیل (خان برادران)
                  </h2>
                </div>

                <blockquote className="text-[11px] sm:text-xs italic text-amber-950 font-medium leading-relaxed bg-white/80 p-2.5 rounded border-r-3 border-[#c2410c]">
                  ”جس نے اپنا نسب اور اسلاف کی تاریخ کو محفوظ رکھا، اس نے آنے والی نسلوں کو اپنی شناخت اور وقار عطا کیا۔“
                </blockquote>

                <div className="text-[11px] sm:text-xs text-gray-800 leading-relaxed space-y-1.5 font-normal">
                  <p>
                    <strong>پیشِ لفظ و تعارف:</strong> یہ شجرہ نسب اور خاندانی آرکائیو، خاندانِ مزید خیل کے عظیم اجداد <strong>دور محمد خان</strong>، <strong>نور محمد شاہ</strong>، اور <strong>یار محمد شاہ</strong> سے شروع ہونے والی نسلوں کی تاریخ اور نسلی روابط کا ایک جامع اور مستند ریکارڈ ہے۔
                  </p>
                  <p>
                    اس شجرہ میں تمام شاخوں (بشمول گجر خان، زرفراز خان، لال سرفراز خان، انور سرفراز خان، محمد نواز خان، گل محمد جان، خان فقیر وغیرہ) کا مکمل اور اوپر سے نیچے درخت نما شاخوں میں مربوط شجرہ نسب پیش کیا گیا ہے۔
                  </p>
                </div>
              </div>

              {/* Quick Stats Banner */}
              <div className="grid grid-cols-3 gap-1.5 border-y border-gray-300 py-2 text-center text-xs">
                <div>
                  <span className="block text-gray-500 uppercase text-[8px] sm:text-[9px]">Generations</span>
                  <span className="font-bold text-xs sm:text-sm text-[#1a1a1a]">5 Generations</span>
                </div>
                <div>
                  <span className="block text-gray-500 uppercase text-[8px] sm:text-[9px]">Branches</span>
                  <span className="font-bold text-xs sm:text-sm text-[#1a1a1a]">3 Branches</span>
                </div>
                <div>
                  <span className="block text-gray-500 uppercase text-[8px] sm:text-[9px]">Lineage</span>
                  <span className="font-bold text-xs sm:text-sm text-[#1a1a1a]">Root-to-Leaves</span>
                </div>
              </div>

              {/* ABOUT DEVELOPER & COMPILER SECTION */}
              <div className="pt-2 border-t border-[#1a1a1a]">
                <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-[#c2410c]" />
                      <h3 className="serif text-xs sm:text-sm font-bold text-[#1a1a1a]">
                        About the Developer & Compiler / مرتب اور ڈیوپلیپر
                      </h3>
                    </div>
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[8px] sm:text-[9px] font-bold uppercase rounded border border-amber-300">
                      Lead Architect
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                    {/* Developer Photo */}
                    <div className="shrink-0 text-center space-y-1">
                      <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden border border-[#1a1a1a] shadow-sm bg-gray-100 mx-auto">
                        <img
                          src={DEVELOPER_PHOTO}
                          alt="Sadaqat Zeb Khan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="inline-block text-[8px] sm:text-[9px] font-mono bg-gray-100 text-gray-700 px-1 py-0.2 rounded border border-gray-300">
                        Sadaqat Zeb Khan
                      </span>
                    </div>

                    {/* Developer Bio & Details */}
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#1a1a1a]">Sadaqat Zeb Khan</h4>
                        <p className="text-[11px] sm:text-xs font-semibold text-[#c2410c]">
                          Software Engineer & Genealogical Archive Developer
                        </p>
                      </div>

                      <p className="text-[10px] sm:text-xs text-gray-700 leading-relaxed">
                        Sadaqat Zeb Khan is a Software Engineer and Tree Data Structure specialist. He compiled, structured, and developed this digital database system for the Mazid Khail family history, preserving it for future generations.
                      </p>

                      {/* Contact Badges */}
                      <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                        <a
                          href="tel:03426168609"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#fcfaf7] border border-gray-300 text-[10px] text-[#1a1a1a]"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-600" />
                          <span className="font-bold">Contact:</span> 0342-6168609
                        </a>

                        <a
                          href="mailto:szkyousafzai@gmail.com"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#fcfaf7] border border-gray-300 text-[10px] text-[#1a1a1a]"
                        >
                          <Mail className="w-2.5 h-2.5 text-blue-600" />
                          <span className="font-bold">Email:</span> szkyousafzai@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer mark */}
              <div className="pt-2 text-center text-[8px] text-gray-500 uppercase tracking-widest flex justify-between items-center">
                <span>Mazid Khail Archive</span>
                <span>Compiled by Sadaqat Zeb Khan</span>
              </div>

            </div>
          )}

          {/* ==================== SECTION 2: TOP-TO-BOTTOM GENEALOGICAL TREE DIAGRAM ==================== */}
          {(activeTab === 'all' || activeTab === 'tree') && (
            <div className="space-y-4">
              
              {/* Main Family Tree Roots */}
              <div className="space-y-5">
                {founders.map((founder, fIndex) => {
                  return (
                    <div
                      key={founder.id}
                      className="p-2 sm:p-4 rounded-xl bg-[#fcfaf7] border border-orange-200/90 shadow-2xs space-y-2 print:break-inside-avoid"
                    >
                      {/* Branch Header Banner */}
                      <div className="flex items-center justify-between border-b border-orange-200 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c2410c]" />
                          <h3 className="serif font-bold text-xs sm:text-sm text-gray-900">
                            شاخ {fIndex + 1}: <strong className="text-[#c2410c]">{founder.fullName}</strong>
                          </h3>
                        </div>
                        <span className="text-[9px] font-bold bg-orange-100 text-[#c2410c] border border-orange-300 px-1.5 py-0.2 rounded-full">
                          Gen 1 بانی شاخ
                        </span>
                      </div>

                      {/* Recursive Tree Rendering for this founder */}
                      <div className="pt-0.5">
                        {renderTreeNode(founder, 0)}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==================== SECTION 3: TABULAR DIRECTORY ==================== */}
          {(activeTab === 'all' || activeTab === 'directory') && (
            <div className="pt-4 border-t-2 border-gray-300 print:break-before-page space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-300">
                <div>
                  <h2 className="serif text-base sm:text-lg font-bold text-[#1a1a1a]">Family Lineage Index</h2>
                  <p className="text-[11px] text-gray-500">مکمل ریکارڈ بلحاظ نسل و شاخ</p>
                </div>
                <span className="text-[10px] font-mono text-gray-700 font-bold bg-gray-100 px-1.5 py-0.5 rounded border">
                  Record Table
                </span>
              </div>

              <div className="w-full overflow-hidden border border-gray-200 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#1a1a1a] text-white uppercase text-[9px] tracking-wider">
                        <th className="p-1.5 border border-black">S.No</th>
                        <th className="p-1.5 border border-black">نام (Full Name)</th>
                        <th className="p-1.5 border border-black">نسل</th>
                        <th className="p-1.5 border border-black">ولدیت (Father)</th>
                        <th className="p-1.5 border border-black">شاخ (Branch)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {people.map((p, index) => {
                        const father = people.find((item) => item.id === p.fatherId);
                        return (
                          <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-1.5 border border-gray-200 font-mono text-[9px]">{index + 1}</td>
                            <td className="p-1.5 border border-gray-200 font-bold text-[#1a1a1a]">{p.fullName}</td>
                            <td className="p-1.5 border border-gray-200 font-mono text-[9px]">
                              <span className="bg-gray-100 px-1 py-0.2 rounded border border-gray-200 font-bold">
                                G{p.generation}
                              </span>
                            </td>
                            <td className="p-1.5 border border-gray-200 text-gray-700">{father ? father.fullName : '—'}</td>
                            <td className="p-1.5 border border-gray-200 text-[10px] text-gray-600">{p.branchName || 'Mazid Khail'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Small Bottom Floating/Docked Print Action Button - Leaves screen empty for viewing */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 print:hidden flex items-center gap-2 bg-[#1a1a1a]/95 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-xl border border-gray-700">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-orange-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>پرنٹ / PDF محفوظ کریں</span>
          </button>
        </div>

      </div>
    </div>
  );
};
