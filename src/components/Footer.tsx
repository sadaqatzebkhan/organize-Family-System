import React from 'react';
import { Shield, QrCode, Smartphone } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'home' | 'tree' | 'people' | 'branches' | 'admin') => void;
  lastUpdated?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lastUpdated }) => {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-16 border-t border-black">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-white/10 text-xs">
          
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="serif text-xl italic font-light">The Khan Family Archive</h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              A private genealogical resource preserving the history, lineage, and descendant branches of the Mazid Khail family tree across generations, compiled from historical family records by Sadaqat Zeb Khan.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <span className="label-caps text-gray-400 block mb-3">Explore Archive</span>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('tree')} className="hover:text-white hover:underline transition-colors">
                  Interactive Tree
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('people')} className="hover:text-white hover:underline transition-colors">
                  People Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('branches')} className="hover:text-white hover:underline transition-colors">
                  Family Branches
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Admin */}
          <div>
            <span className="label-caps text-gray-400 block mb-3">Administration</span>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              </li>
              {lastUpdated && (
                <li className="text-[11px] text-gray-500 pt-2">
                  Last Updated: {new Date(lastUpdated).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 gap-2">
          <div>&copy; {new Date().getFullYear()} Khan Family Legacy Database • Confidential Family Resource</div>
          <div className="flex space-x-6 items-center">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
              Archive Active
            </span>
            <span className="opacity-50">Ref: ARCHIVE-PDF-V1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


