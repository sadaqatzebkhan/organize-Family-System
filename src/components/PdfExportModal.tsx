import React, { useRef } from 'react';
import { X, Printer, Download, Mail, Phone, User, BookOpen, Shield, Code, Sparkles, Award } from 'lucide-react';
import { Person, FamilyBranch } from '../types';

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

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white text-[#1a1a1a] rounded-xl border border-gray-300 shadow-2xl flex flex-col overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Header bar - Hidden when printing */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a1a1a] text-white print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c2410c]" />
            <div>
              <h2 className="font-bold text-sm sm:text-base">Mazid Khail Family Archive — PDF & Book View</h2>
              <p className="text-[11px] text-gray-400">Front Cover, Urdu Preface, Developer Profile & Printable Directory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#c2410c] hover:bg-[#a33309] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12 print:p-8 print:overflow-visible" ref={printRef}>
          
          {/* ==================== PAGE 1: FRONT COVER ==================== */}
          <div className="min-h-[800px] border-8 border-double border-[#1a1a1a] p-8 sm:p-12 flex flex-col justify-between bg-[#fdfcf9] rounded-sm print:min-h-screen print:border-8 print:break-after-page">
            
            {/* Header / Top emblem */}
            <div className="text-center space-y-3">
              <div className="inline-block px-4 py-1.5 border border-[#1a1a1a] text-xs font-bold uppercase tracking-widest text-[#c2410c] bg-white">
                GENEALOGICAL ARCHIVE & RECORD BOOK
              </div>
              <h1 className="serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1a1a1a] pt-4">
                The Khan Family Archive
              </h1>
              <p className="serif text-xl sm:text-2xl italic text-gray-700 font-light">
                Mazid Khail Genealogical Database
              </p>
              <div className="w-32 h-0.5 bg-[#1a1a1a] mx-auto my-4" />
            </div>

            {/* URDU PREFACE SECTION (اردو تحریر) */}
            <div className="my-8 p-6 sm:p-8 bg-amber-50/40 border-2 border-amber-900/20 rounded-lg text-right space-y-4 dir-rtl shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-3 mb-2">
                <span className="text-xs font-bold uppercase text-amber-900 tracking-widest font-sans dir-ltr">
                  URDU PREFACE & HISTORICAL PROLOGUE
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]" style={{ fontFamily: 'serif' }}>
                  شجرہ نسب و تاریخِ خاندانِ مزید خیل (خان برادران)
                </h2>
              </div>

              <blockquote className="text-sm sm:text-base italic text-amber-950 font-medium leading-relaxed bg-white/70 p-4 rounded border-r-4 border-[#c2410c] my-3">
                ”جس نے اپنا نسب اور اسلاف کی تاریخ کو محفوظ رکھا، اس نے آنے والی نسلوں کو اپنی شناخت اور وقار عطا کیا۔“
              </blockquote>

              <div className="text-xs sm:text-sm text-gray-800 leading-relaxed space-y-3 font-normal">
                <p>
                  <strong>پیشِ لفظ و تعارف:</strong> یہ شجرہ نسب اور خاندانی آرکائیو، خاندانِ مزید خیل کے عظیم اجداد دور محمد خان، نور محمد شاہ، اور یار محمد شاہ سے شروع ہونے والی نسلوں کے شاندار تاریخ اور نسلی روابط کا ایک جامع اور مستند ریکارڈ ہے۔ اس کا بنیادی مقصد اپنے اسلاف کی یادگار کو زندہ رکھنا، خاندانی بکھراؤ کو اتحاد میں بدلنا، اور جدید دور کی روشن نسل کو اپنے آباؤ اجداد کی قربانیوں، عظمت اور اصل جڑوں سے آراستہ و پیراستہ کرنا ہے۔
                </p>
                <p>
                  اس شجرہ میں دورِ قدیم سے لے کر موجودہ دور تک تمام شاخوں (بشمول گجر خان، زرفراز خان، لال سرفراز خان، انور سرفراز خان، محمد نواز خان، گل محمد جان، خان فقیر وغیرہ) کا مکمل اور مرتب ریکارڈ پیش کیا گیا ہے۔
                </p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="grid grid-cols-4 gap-2 border-y border-gray-300 py-3 text-center text-xs">
              <div>
                <span className="block text-gray-500 uppercase text-[10px]">Total Members</span>
                <span className="font-bold text-base text-[#1a1a1a]">{stats.totalPeople}</span>
              </div>
              <div>
                <span className="block text-gray-500 uppercase text-[10px]">Generations</span>
                <span className="font-bold text-base text-[#1a1a1a]">{stats.maxGeneration}</span>
              </div>
              <div>
                <span className="block text-gray-500 uppercase text-[10px]">Branches</span>
                <span className="font-bold text-base text-[#1a1a1a]">{stats.totalBranches}</span>
              </div>
              <div>
                <span className="block text-gray-500 uppercase text-[10px]">Relationships</span>
                <span className="font-bold text-base text-[#1a1a1a]">{stats.totalRelationships}</span>
              </div>
            </div>

            {/* ABOUT DEVELOPER & COMPILER SECTION */}
            <div className="mt-8 pt-6 border-t-2 border-[#1a1a1a]">
              <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#c2410c]" />
                    <h3 className="serif text-lg font-bold text-[#1a1a1a]">
                      About the Developer & Compiler / مرتب اور ڈیوپلیپر
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase rounded border border-amber-300">
                    Lead System Architect
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Developer Photo */}
                  <div className="shrink-0 text-center space-y-2">
                    <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-[#1a1a1a] shadow-md bg-gray-100 mx-auto">
                      <img
                        src="/developer_sadaqat.jpg.jpeg"
                        alt="Sadaqat Zeb Khan"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to /developer_sadaqat.jpg if needed
                          (e.currentTarget as HTMLImageElement).src = '/developer_sadaqat.jpg';
                        }}
                      />
                    </div>
                    <span className="inline-block text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-300">
                      Developer Photo
                    </span>
                  </div>

                  {/* Developer Bio & Details */}
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div>
                      <h4 className="text-xl font-bold text-[#1a1a1a]">Sadaqat Zeb Khan</h4>
                      <p className="text-xs font-semibold text-[#c2410c]">
                        Software Engineer & Genealogical Archive Developer
                      </p>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed">
                      Sadaqat Zeb Khan is a passionate Software Engineer and Tree Data Structure specialist. He compiled, structured, and developed this digital database system for the Mazid Khail family history. His work transforms paper ancestry records into an interactive, full-stack genealogical web platform ensuring digital preservation for future generations.
                    </p>

                    {/* Contact Badges */}
                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <a
                        href="tel:03426168609"
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#fcfaf7] border border-gray-300 text-xs text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold">Contact:</span> 0342-6168609
                      </a>

                      <a
                        href="mailto:szkyousafzai@gmail.com"
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#fcfaf7] border border-gray-300 text-xs text-[#1a1a1a] hover:border-[#1a1a1a] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold">Email:</span> szkyousafzai@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer mark */}
            <div className="pt-6 text-center text-[10px] text-gray-500 uppercase tracking-widest flex justify-between items-center">
              <span>Mazid Khail Official Archive</span>
              <span>Compiled by Sadaqat Zeb Khan</span>
              <span>Confidential Document</span>
            </div>

          </div>

          {/* ==================== PAGE 2: FAMILY DIRECTORY INDEX ==================== */}
          <div className="pt-8 border-t-2 border-gray-300 print:break-before-page">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-300">
              <div>
                <h2 className="serif text-2xl font-bold text-[#1a1a1a]">Family Directory & Lineage Index</h2>
                <p className="text-xs text-gray-500">Complete listing of recorded members sorted by generation and branch</p>
              </div>
              <span className="text-xs font-mono text-gray-500">{people.length} Records Total</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1a1a1a] text-white uppercase text-[10px] tracking-wider">
                    <th className="p-2 border border-black">S.No</th>
                    <th className="p-2 border border-black">Full Name</th>
                    <th className="p-2 border border-black">Gen</th>
                    <th className="p-2 border border-black">Branch</th>
                    <th className="p-2 border border-black">Father / Parents</th>
                    <th className="p-2 border border-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p, index) => {
                    const father = people.find((item) => item.id === p.fatherId);
                    return (
                      <tr key={p.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2 border border-gray-200 font-mono text-[10px]">{index + 1}</td>
                        <td className="p-2 border border-gray-200 font-bold text-[#1a1a1a]">{p.fullName}</td>
                        <td className="p-2 border border-gray-200 font-mono">Gen {p.generation}</td>
                        <td className="p-2 border border-gray-200">{p.branchName || 'Mazid Khail'}</td>
                        <td className="p-2 border border-gray-200 text-gray-700">{father ? father.fullName : '—'}</td>
                        <td className="p-2 border border-gray-200 text-[11px]">
                          {p.aliveStatus === 'alive' || p.aliveStatus === 'living' ? (
                            <span className="text-emerald-700 font-semibold">Living</span>
                          ) : p.aliveStatus === 'deceased' ? (
                            <span className="text-gray-500 font-medium">Deceased</span>
                          ) : (
                            <span className="text-gray-400 italic">Unknown</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
