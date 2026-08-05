import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../lib/api';
import { searchAccommodationWithAi } from '../lib/gemini';
import { ListingCard } from './ListingCard';
import { Listing } from '../types';
import { INITIAL_UNIVERSITIES } from '../data/mockData';
import { 
  Search, Sparkles, ShieldCheck, Calendar, GraduationCap, MapPin, Navigation, 
  CheckCircle, ArrowRight, Star, Building2, UserCheck, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { setSelectedUniversity, setActiveView, setAuthModalOpen, setAuthModalTab, addToast } = useAuth();

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchListings({})
      .then(data => setFeaturedListings(data.slice(0, 6)))
      .catch(() => {});
  }, []);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      setActiveView('search');
      return;
    }
    setAiLoading(true);
    try {
      await searchAccommodationWithAi(aiPrompt);
      setActiveView('search');
    } catch (err) {
      setActiveView('search');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden bg-slate-950 text-white rounded-b-[40px] shadow-xl border-b border-emerald-900/30">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Agents • Zero Upfront Rent Payments • Free Inspections</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance">
            Discover Verified Student Accommodation Near <span className="text-emerald-400">Your Campus</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Campora connects Nigerian university, polytechnic, and college students with verified landlords and agents offering hostels, self-contain apartments, and shared lodges near campus.
          </p>

          {/* AI Prompt Input Bar */}
          <div className="max-w-2xl mx-auto p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <form onSubmit={handleAiSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Sparkles className="w-5 h-5 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Self-contain under ₦300k near UNILAG gate with solar power..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 border border-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={aiLoading}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 shadow-md"
              >
                {aiLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* University Tabs Quick Select */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">Top Campuses:</span>
            {INITIAL_UNIVERSITIES.slice(0, 8).map(uni => (
              <button
                key={uni.id}
                onClick={() => {
                  setSelectedUniversity(uni);
                  setActiveView('search');
                }}
                className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-emerald-950 hover:border-emerald-500 text-slate-200 text-xs font-semibold border border-slate-800 transition-all flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{uni.shortName}</span>
                <span className="text-[10px] text-slate-400 font-normal">({uni.state})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Role Gateway Gateway Card Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider">
              Onboarding Gateway
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Choose Your Account Type & Sign In
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Access specialized portals tailored for Tertiary Students and CAC-Verified Property Agents.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('role_select')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-colors shadow-md flex items-center gap-2"
            >
              <span>Get Started & Select Role</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Verified Agents Only</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agents submit government ID, property documentation, and office address before listing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-fit">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Free Physical Inspections</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schedule inspection with verified agents at no cost before making any rent commitment.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Walk Time to Gate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Know exact walking distance in minutes to campus gates, shuttle stops, and supermarkets.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-fit">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Student Reviews</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Read rating breakdowns on security, 24/7 electricity, water supply, and noise levels.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Accommodations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Featured Accommodations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified hostels and apartments near top African universities
            </p>
          </div>

          <button
            onClick={() => setActiveView('search')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredListings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* University Campuses Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Explore Hostels by University Campus
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct access to student housing listings across Nigeria, Kenya, South Africa, Ghana, and Uganda.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_UNIVERSITIES.map(uni => (
            <div
              key={uni.id}
              onClick={() => {
                setSelectedUniversity(uni);
                setActiveView('search');
              }}
              className="group p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {uni.country}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {uni.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {uni.city} • {uni.totalListings} hostels available
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Campora Works Step By Step */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 bg-slate-900 text-white rounded-3xl space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simple 3-Step Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold">How Campora Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
            <span className="text-4xl font-black text-emerald-500/40 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="text-base font-bold">Discover & Compare</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use natural language AI search or filters to compare verified hostels, distance to gate, price, and water/power ratings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
            <span className="text-4xl font-black text-emerald-500/40 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="text-base font-bold">Book Free Inspection</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Select an inspection date and meet verified agents physically at the property. Never pay any fee before inspecting!
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 relative">
            <span className="text-4xl font-black text-emerald-500/40 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="text-base font-bold">Move In Safely</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Finalize tenancy agreement directly with landlord/verified agent and enjoy your academic semester hassle-free.
            </p>
          </div>
        </div>
      </section>

      {/* Become an Agent CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-600/20">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">Are You a Landlord or Agent?</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">List Your Hostels on Campora</h2>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
              Reach thousands of students searching for accommodation near major universities across Nigeria, Kenya, South Africa, and Ghana.
            </p>
          </div>

          <button
            onClick={() => {
              setAuthModalTab('agent_signup');
              setAuthModalOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-white text-indigo-900 font-extrabold text-xs sm:text-sm hover:bg-indigo-50 transition-colors shadow-lg shrink-0 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Register Agent Profile</span>
          </button>
        </div>
      </section>

    </div>
  );
};
