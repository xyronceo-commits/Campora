import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../lib/api';
import { searchAccommodationWithAi } from '../lib/gemini';
import { ListingCard } from './ListingCard';
import { Listing, Facility } from '../types';
import { INITIAL_UNIVERSITIES } from '../data/mockData';
import { Search, Sparkles, Filter, X, SlidersHorizontal, Navigation, ShieldCheck, RefreshCw, Check, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SearchFilters: React.FC = () => {
  const { selectedUniversity, setSelectedUniversity, addToast } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedOwnership, setSelectedOwnership] = useState('all');
  const [selectedInstType, setSelectedInstType] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [gender, setGender] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedFacilities, setSelectedFacilities] = useState<Facility[]>([]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [maxDistanceMinutes, setMaxDistanceMinutes] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest'>('newest');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const loadData = async (aiMatchedIds?: string[]) => {
    setLoading(true);
    try {
      const data = await fetchListings({
        universityId: selectedUniversity ? selectedUniversity.id : undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        gender: gender !== 'all' ? gender : undefined,
        maxPrice: maxPrice !== '' ? Number(maxPrice) : null,
        searchQuery: searchQuery || undefined,
      });

      let results = [...data];

      if (aiMatchedIds && aiMatchedIds.length > 0) {
        results = results.filter(l => aiMatchedIds.includes(l.id));
      }

      // Filter by University Ownership (Federal, State, Private)
      if (selectedOwnership !== 'all') {
        results = results.filter(l => {
          const u = INITIAL_UNIVERSITIES.find(uni => uni.id === l.universityId);
          return u?.ownership === selectedOwnership;
        });
      }

      // Filter by Institution Type (University, Polytechnic, College of Education)
      if (selectedInstType !== 'all') {
        results = results.filter(l => {
          const u = INITIAL_UNIVERSITIES.find(uni => uni.id === l.universityId);
          return u?.institutionType === selectedInstType;
        });
      }

      // Filter by Nigerian State
      if (selectedState !== 'all') {
        results = results.filter(l => {
          const u = INITIAL_UNIVERSITIES.find(uni => uni.id === l.universityId);
          return u?.state === selectedState;
        });
      }

      if (onlyVerified) {
        results = results.filter(l => l.isAgentVerified);
      }

      if (selectedFacilities.length > 0) {
        results = results.filter(l => 
          selectedFacilities.every(fac => l.facilities.includes(fac))
        );
      }

      if (maxDistanceMinutes !== '') {
        results = results.filter(l => l.distanceToCampusMinutes <= Number(maxDistanceMinutes));
      }

      // Sort
      if (sortBy === 'price_asc') {
        results.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_desc') {
        results.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'distance') {
        results.sort((a, b) => a.distanceToCampusMinutes - b.distanceToCampusMinutes);
      } else if (sortBy === 'rating') {
        results.sort((a, b) => b.ratings.overall - a.ratings.overall);
      } else {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setListings(results);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    selectedUniversity, 
    selectedType, 
    selectedOwnership, 
    selectedInstType, 
    selectedState, 
    gender, 
    maxPrice, 
    searchQuery, 
    onlyVerified, 
    selectedFacilities, 
    maxDistanceMinutes, 
    sortBy
  ]);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiExplanation(null);
    try {
      const result = await searchAccommodationWithAi(aiPrompt);
      setAiExplanation(result.explanation);
      addToast('AI Search Complete', `Matched listings for "${aiPrompt}"`, 'success');
      loadData(result.matchedListingIds);
    } catch (err) {
      addToast('Error', 'AI search failed, fallback filters applied', 'warning');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleFacility = (fac: Facility) => {
    setSelectedFacilities(prev => 
      prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedOwnership('all');
    setSelectedInstType('all');
    setSelectedState('all');
    setGender('all');
    setMaxPrice('');
    setSelectedFacilities([]);
    setOnlyVerified(false);
    setMaxDistanceMinutes('');
    setAiExplanation(null);
    setAiPrompt('');
  };

  const facilityList: { key: Facility; label: string }[] = [
    { key: 'electricity_247', label: '24/7 Power Supply' },
    { key: 'solar_power', label: 'Solar Inverter Backup' },
    { key: 'wifi', label: 'High Speed Fiber Wi-Fi' },
    { key: 'water_running', label: 'Running Water / Borehole' },
    { key: 'security_guard', label: 'Uniform Security Guard' },
    { key: 'cctv', label: 'CCTV Surveillance' },
    { key: 'kitchen', label: 'Kitchenette' },
    { key: 'laundry', label: 'Laundry Facility' },
    { key: 'gym', label: 'Student Gym' },
    { key: 'furnished', label: 'Fully Furnished' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Explore Hostels & Accommodations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search verified student hostels, self-contains, and shared lodges near your campus.
          </p>
        </div>

        {selectedUniversity && (
          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
              {selectedUniversity.shortName.substring(0, 3)}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Selected Campus</p>
              <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{selectedUniversity.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Search Header Bar */}
      <div className="p-6 rounded-2xl bg-black text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 text-emerald-400 border border-neutral-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Natural Language AI Accommodation Finder
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Describe Your Ideal Student Home
          </h2>
          <p className="text-xs text-neutral-400">
            e.g. "Find me a quiet self-contain apartment under 300k near UNILAG gate with 24/7 electricity and fiber internet."
          </p>

          <form onSubmit={handleAiSearch} className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Gemini AI to filter accommodation..."
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none placeholder:text-slate-400"
              />
              {aiPrompt && (
                <button
                  type="button"
                  onClick={() => setAiPrompt('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-indigo-600/30"
            >
              {aiLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Search</span>
                </>
              )}
            </button>
          </form>

          {aiExplanation && (
            <div className="p-3 rounded-xl bg-slate-800/80 border border-emerald-500/40 text-xs text-emerald-200 mt-2 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{aiExplanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Nigerian Institution Category Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          Filter Campus System:
        </span>
        {[
          { id: 'all_inst', label: 'All Institutions', owner: 'all', type: 'all' },
          { id: 'fed_uni', label: '🏛️ Federal Universities', owner: 'Federal', type: 'University' },
          { id: 'state_uni', label: '🏛️ State Universities', owner: 'State', type: 'University' },
          { id: 'pvt_uni', label: '🏫 Private Universities', owner: 'Private', type: 'University' },
          { id: 'poly', label: '🛠️ Polytechnics', owner: 'all', type: 'Polytechnic' },
          { id: 'coe', label: '🎓 Colleges of Education', owner: 'all', type: 'College of Education' },
        ].map(chip => {
          const isActive = selectedOwnership === chip.owner && selectedInstType === chip.type;
          return (
            <button
              key={chip.id}
              onClick={() => {
                setSelectedOwnership(chip.owner);
                setSelectedInstType(chip.type);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Main Filter Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        
        {/* Search Query Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, street name, or hostel name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* State Selector Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">📍 All States in Nigeria</option>
          <option value="Lagos">Lagos State</option>
          <option value="Oyo">Oyo State (Ibadan/Ogbomoso)</option>
          <option value="Ogun">Ogun State (Abeokuta/Ilaro/Ota)</option>
          <option value="Osun">Osun State (Ile-Ife/Osogbo)</option>
          <option value="Ondo">Ondo State (Akure)</option>
          <option value="FCT Abuja">FCT Abuja</option>
          <option value="Enugu">Enugu State</option>
          <option value="Anambra">Anambra State (Awka)</option>
          <option value="Imo">Imo State (Owerri)</option>
          <option value="Rivers">Rivers State (Port Harcourt)</option>
          <option value="Edo">Edo State (Benin City)</option>
          <option value="Kwara">Kwara State (Ilorin)</option>
          <option value="Kaduna">Kaduna State</option>
          <option value="Kano">Kano State</option>
          <option value="Niger">Niger State (Minna)</option>
          <option value="Delta">Delta State (Abraka)</option>
          <option value="Akwa Ibom">Akwa Ibom State (Uyo)</option>
          <option value="Plateau">Plateau State (Jos)</option>
        </select>

        {/* Accommodation Type Select */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Room Types</option>
          <option value="hostel">Private Hostel</option>
          <option value="self_contain">Self-Contain</option>
          <option value="single_room">Single Room</option>
          <option value="flat_apartment">2/3 Bedroom Flat</option>
          <option value="shared_lodge">Shared Lodge</option>
          <option value="studio">Studio</option>
        </select>

        {/* Sort By Select */}
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High (₦)</option>
          <option value="price_desc">Price: High to Low (₦)</option>
          <option value="distance">Proximity: Nearest to Campus</option>
          <option value="rating">Highest Agent Rating</option>
        </select>

        {/* Filter Drawer Toggle */}
        <button
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 border transition-colors ${
            selectedFacilities.length > 0 || onlyVerified || maxPrice || maxDistanceMinutes
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>More Filters</span>
          {(selectedFacilities.length > 0 || onlyVerified) && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        <button
          onClick={resetFilters}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
          title="Reset Filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Expanded Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-md space-y-5 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Max Budget & Distance */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Budget & Distance
                </h4>
                
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Max Price Limit</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Max Walking Time to Campus (Mins)</label>
                  <input
                    type="number"
                    value={maxDistanceMinutes}
                    onChange={(e) => setMaxDistanceMinutes(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Gender Preference */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Gender Preference
                </h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['all', 'female_only', 'male_only', 'coed'].map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-colors ${
                        gender === g
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {g.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Only Show Verified Agents
                  </label>
                </div>
              </div>

              {/* Required Facilities Checklist */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Must-Have Infrastructure
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {facilityList.map(fac => {
                    const checked = selectedFacilities.includes(fac.key);
                    return (
                      <button
                        key={fac.key}
                        type="button"
                        onClick={() => toggleFacility(fac.key)}
                        className={`p-2 rounded-xl text-left border font-medium flex items-center justify-between transition-colors ${
                          checked
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">{fac.label}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Available Accommodation Listings
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              {listings.length}
            </span>
          </h3>

          <p className="text-xs text-slate-500">
            Near {selectedUniversity ? selectedUniversity.name : 'All Campuses'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No Accommodations Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try relaxing your price filters, selecting a different university, or resetting search keywords.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
