import React from 'react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_UNIVERSITIES } from '../data/mockData';
import { ShieldCheck, Heart, Mail, Phone, MapPin, ExternalLink, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveView, setSelectedUniversity, setAuthModalOpen, setAuthModalTab } = useAuth();

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45 shadow-sm" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight uppercase">CAMPORA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Africa's premier student accommodation platform. Connecting university students with verified agents for hostels, self-contain apartments, and lodges near major African campuses.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                Student Safety Mandate
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Campora does not process rent payments. We connect you to verified agents for free physical inspections before you sign agreements.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-emerald-400 transition-colors">
                  Featured Accommodations
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('search')} className="hover:text-emerald-400 transition-colors">
                  Advanced Housing Search
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('saved')} className="hover:text-emerald-400 transition-colors">
                  Saved Bookmarks
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('search')} className="hover:text-emerald-400 transition-colors">
                  Explore Student Hostels
                </button>
              </li>
            </ul>
          </div>

          {/* Universities */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Popular Universities</h4>
            <ul className="space-y-2 text-slate-400">
              {INITIAL_UNIVERSITIES.slice(0, 5).map(uni => (
                <li key={uni.id}>
                  <button
                    onClick={() => {
                      setSelectedUniversity(uni);
                      setActiveView('search');
                    }}
                    className="hover:text-emerald-400 transition-colors text-left truncate max-w-[180px]"
                  >
                    {uni.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Agents */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Property Agents</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setAuthModalTab('agent_signup');
                    setAuthModalOpen(true);
                  }}
                  className="font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Become a Verified Agent
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li><span>Agent Verification Guidelines</span></li>
              <li><span>Hostel Subscription Plans</span></li>
              <li><span>AI Listing Generator</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <p>© 2026 Campora Africa Inc. All rights reserved.</p>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM STATUS: OPTIMAL</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Safety Guidelines</span>
            <span>Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
