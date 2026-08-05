import React, { useState } from 'react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Star, ShieldCheck, MapPin, Navigation, Eye, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onSelect }) => {
  const { isSaved, toggleSaveListing, setSelectedListing, setInspectionModalListing } = useAuth();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const saved = isSaved(listing.id);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImageIdx(prev => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.images.length > 1) {
      setCurrentImageIdx(prev => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  const formattedPrice = new Intl.NumberFormat().format(listing.price);

  const typeLabels: Record<string, string> = {
    hostel: 'Hostel',
    self_contain: 'Self-Contain',
    single_room: 'Single Room',
    flat_apartment: 'Flat Apartment',
    shared_lodge: 'Shared Lodge',
    studio: 'Studio',
  };

  return (
    <div
      onClick={() => {
        setSelectedListing(listing);
        if (onSelect) onSelect(listing);
      }}
      className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Top Image Box */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img
          src={listing.images[currentImageIdx] || listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-black/20" />

        {/* Carousel Buttons */}
        {listing.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Image Indicator Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {listing.images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {listing.isAgentVerified && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-semibold text-[11px] tracking-wide shadow-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Verified Agent
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 dark:bg-black/80 backdrop-blur text-white font-medium text-[11px]">
              {typeLabels[listing.type] || listing.type}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveListing(listing.id);
            }}
            className={`p-2 rounded-full backdrop-blur transition-all pointer-events-auto ${
              saved
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-black/40 hover:bg-black/70 text-white'
            }`}
            title={saved ? 'Unsave listing' : 'Save listing'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Info Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-white font-medium text-xs flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-400" />
            {listing.distanceToCampusMinutes} min walk to campus
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{listing.ratings.overall}</span>
              {listing.ratings.count > 0 && (
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">({listing.ratings.count})</span>
              )}
            </div>
          </div>

          {/* Location & University */}
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{listing.universityName}</span> • {listing.campus}
          </p>

          {/* Facilities Summary */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-slate-600 dark:text-slate-300">
            {listing.facilities.slice(0, 3).map((fac, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 capitalize font-medium">
                {fac.replace('_', ' ')}
              </span>
            ))}
            {listing.facilities.length > 3 && (
              <span className="text-slate-400 text-[10px] font-semibold">+ {listing.facilities.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Footer Price & Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {listing.currency}{formattedPrice}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {listing.pricePeriod}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              {listing.availableRooms} {listing.availableRooms === 1 ? 'room' : 'rooms'} available
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setInspectionModalListing(listing);
            }}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/20"
          >
            <Calendar className="w-3.5 h-3.5" />
            Inspect
          </button>
        </div>
      </div>
    </div>
  );
};
