import React, { useState } from 'react';
import { Network, Users, GitFork, ShieldCheck, Menu, X, Search, BookOpen, QrCode, Smartphone, Download } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'tree' | 'people' | 'branches' | 'admin';
  onNavigate: (page: 'home' | 'tree' | 'people' | 'branches' | 'admin') => void;
  isAdmin: boolean;
  onSearchClick: () => void;
  onOpenPdfModal?: () => void;
  onOpenMobileModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isAdmin,
  onSearchClick,
  onOpenPdfModal,
  onOpenMobileModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Archive Home' },
    { id: 'tree', label: 'Interactive Tree' },
    { id: 'people', label: 'People Directory' },
    { id: 'branches', label: 'Branches' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf7]/95 backdrop-blur-md border-b border-black/10 text-[#1a1a1a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Family Title */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col text-left focus:outline-none group shrink-0"
            id="header-logo-button"
          >
            <h1 className="serif text-xl sm:text-2xl lg:text-3xl italic font-light tracking-tight text-[#1a1a1a] group-hover:text-[#c2410c] transition-colors whitespace-nowrap">
              The Khan Family Archive
            </h1>
            <span className="label-caps mt-0.5 text-[9px] sm:text-[10px]">
              Mazid Khail Genealogical Database
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 text-sm font-medium shrink-0">
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  id={`nav-item-${item.id}`}
                  className={`transition-colors py-1 whitespace-nowrap shrink-0 ${
                    active
                      ? 'underline underline-offset-8 text-[#1a1a1a] font-serif font-bold decoration-2'
                      : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {onOpenMobileModal && (
              <button
                onClick={onOpenMobileModal}
                id="header-mobile-qr-button"
                title="Download Mobile App / Scan QR Code"
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded px-2.5 sm:px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 transition-all shadow-2xs whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Download App / QR</span>
                <span className="sm:hidden">Download</span>
              </button>
            )}

            {onOpenPdfModal && (
              <button
                onClick={onOpenPdfModal}
                id="header-pdf-book-button"
                className="hidden md:flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 rounded px-3 py-1.5 text-xs font-bold hover:bg-amber-100 transition-all shadow-2xs whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#c2410c]" />
                <span>PDF Book</span>
              </button>
            )}

            <button
              onClick={onSearchClick}
              id="header-search-trigger"
              className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-1.5 text-xs text-[#1a1a1a] hover:border-[#1a1a1a] transition-all shadow-2xs whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="hidden xl:inline font-medium">Search...</span>
            </button>

            <button
              onClick={() => onNavigate('admin')}
              id="header-admin-portal-button"
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors shadow-2xs whitespace-nowrap shrink-0 ${
                currentPage === 'admin'
                  ? 'bg-[#c2410c] text-white'
                  : 'bg-[#1a1a1a] text-white hover:bg-gray-800'
              }`}
            >
              <span>{isAdmin ? 'Admin Portal' : 'Admin Login'}</span>
              {isAdmin && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="header-mobile-menu-trigger"
              className="lg:hidden p-2 text-[#1a1a1a] border border-gray-200 rounded"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fcfaf7] border-b border-black/10 px-6 py-4 space-y-2">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'font-bold text-[#1a1a1a] underline underline-offset-4'
                    : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-gray-200 space-y-2">
            {onOpenMobileModal && (
              <button
                onClick={() => {
                  onOpenMobileModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-bold text-emerald-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>Download Mobile App & QR Code</span>
                </div>
                <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded font-mono">Scan QR</span>
              </button>
            )}

            {onOpenPdfModal && (
              <button
                onClick={() => {
                  onOpenPdfModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-bold text-amber-900 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#c2410c]" />
                <span>Download PDF Book & Records</span>
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-bold text-[#c2410c] flex items-center justify-between"
            >
              <span>{isAdmin ? 'Admin Portal' : 'Admin Login'}</span>
              {isAdmin && <span className="text-xs text-emerald-600 font-normal">Active</span>}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


