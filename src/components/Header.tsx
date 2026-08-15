import React, { useState } from 'react';
import { Network, Users, GitFork, ShieldCheck, Menu, X, Search, BookOpen, QrCode, Smartphone, Download, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'tree' | 'people' | 'branches' | 'chat' | 'admin';
  onNavigate: (page: 'home' | 'tree' | 'people' | 'branches' | 'chat' | 'admin') => void;
  isAdmin: boolean;
  onSearchClick: () => void;
  onOpenPdfModal?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  isAdmin,
  onSearchClick,
  onOpenPdfModal,
  onOpenInstallModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Archive Home' },
    { id: 'tree', label: 'Interactive Tree' },
    { id: 'people', label: 'People Directory' },
    { id: 'branches', label: 'Branches' },
    { id: 'chat', label: 'Family Chat' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#fcfaf7]/95 backdrop-blur-md border-b border-black/10 text-[#1a1a1a] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Family Title */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            id="header-logo-button"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-xl overflow-hidden shadow-sm border border-black/20 group-hover:scale-105 transition-transform">
              <img
                src="/logo.svg"
                alt="MK Family Archive Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="serif text-xl sm:text-2xl lg:text-3xl italic font-light tracking-tight text-[#1a1a1a] group-hover:text-[#c2410c] transition-colors whitespace-nowrap">
                The M_Z_K Family
              </h1>
              <span className="label-caps mt-0.5 text-[9px] sm:text-[10px]">
                with S_Z_K
              </span>
            </div>
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
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                id="header-mobile-app-button"
                className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded px-2.5 sm:px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 transition-all shadow-2xs whitespace-nowrap shrink-0"
                title="موبائل پر ایپ انسٹال کریں"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Mobile App</span>
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
              <span className="hidden sm:inline font-medium">Search family...</span>
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
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-[#1a1a1a] bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#c2410c]"
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
            {onOpenInstallModal && (
              <button
                onClick={() => {
                  onOpenInstallModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-bold text-emerald-800 flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>موبائل پر ایپ انسٹال کریں (Install Mobile App)</span>
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


