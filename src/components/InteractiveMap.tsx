import React, { useState } from 'react';
import { MapPin, Navigation, ShoppingBag, Bus, Hospital, Utensils, Check } from 'lucide-react';

interface InteractiveMapProps {
  lat: number;
  lng: number;
  title: string;
  universityName?: string;
  address?: string;
  distanceMinutes?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  lat,
  lng,
  title,
  universityName = 'University Campus',
  address = 'Main University Gate Road',
  distanceMinutes = 5,
}) => {
  const [activeAmenity, setActiveAmenity] = useState<string | null>('all');

  // Nearby mock points around property
  const nearbyPlaces = [
    { type: 'campus', name: `${universityName} Gate`, dist: `${distanceMinutes} min walk (0.4 km)`, icon: Navigation, color: 'bg-emerald-500' },
    { type: 'supermarket', name: 'Campus Mega Supermarket', dist: '3 min walk (0.2 km)', icon: ShoppingBag, color: 'bg-amber-500' },
    { type: 'transport', name: 'University Shuttle & Bus Stop', dist: '2 min walk (0.1 km)', icon: Bus, color: 'bg-sky-500' },
    { type: 'hospital', name: 'Student Medical Centre / Pharmacy', dist: '7 min walk (0.5 km)', icon: Hospital, color: 'bg-rose-500' },
    { type: 'restaurant', name: 'Student Food Court & Eateries', dist: '4 min walk (0.3 km)', icon: Utensils, color: 'bg-purple-500' },
  ];

  const filteredPlaces = activeAmenity === 'all' 
    ? nearbyPlaces 
    : nearbyPlaces.filter(p => p.type === activeAmenity || p.type === 'campus');

  // Construct OpenStreetMap Embed URL
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.008}%2C${lat - 0.006}%2C${lng + 0.008}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="flex flex-col gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-base">
            <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Location & Proximity Map
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{address}</p>
        </div>
        <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium text-xs rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5" />
          {distanceMinutes} mins to campus gate
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setActiveAmenity('all')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${
            activeAmenity === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          {activeAmenity === 'all' && <Check className="w-3.5 h-3.5" />}
          All Nearby
        </button>
        <button
          onClick={() => setActiveAmenity('supermarket')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${
            activeAmenity === 'supermarket'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Supermarkets
        </button>
        <button
          onClick={() => setActiveAmenity('transport')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${
            activeAmenity === 'transport'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Bus className="w-3.5 h-3.5" />
          Transport
        </button>
        <button
          onClick={() => setActiveAmenity('hospital')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${
            activeAmenity === 'hospital'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Hospital className="w-3.5 h-3.5" />
          Hospitals
        </button>
        <button
          onClick={() => setActiveAmenity('restaurant')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 font-medium ${
            activeAmenity === 'restaurant'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          Eateries
        </button>
      </div>

      {/* Map Embed Frame */}
      <div className="relative w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group">
        <iframe
          title="Accommodation Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmUrl}
          className="w-full h-full filter contrast-[1.02]"
        />
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          {title}
        </div>
      </div>

      {/* Nearby Places List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {filteredPlaces.map((place, idx) => {
          const Icon = place.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-xs"
            >
              <div className={`p-2 rounded-lg text-white ${place.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{place.name}</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">{place.dist}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
