'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient';
import { Search, MapPin, Star, Sparkles, Filter, Loader2, RefreshCw, ShieldCheck, Heart, Calendar, DollarSign, Compass, ArrowRight, Home, Shield, Award, Users } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  description: string;
}

interface Experience {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  location: string;
  isActive: boolean;
  hostId: string;
  hostName: string;
  hostIsVerified: boolean;
  tags: Tag[];
  averageRating: number;
  imageUrl?: string;
}

export default function HomePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tags on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const tagsData = await apiClient.get<Tag[]>('/experiences/tags');
        setTags(tagsData);
      } catch (err) {
        console.error('Failed to load tags preference filters', err);
      }
    }
    loadInitialData();
  }, []);

  const fetchExperiences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tagIdsString = selectedTagIds.join(',');
      const data = await apiClient.get<Experience[]>('/experiences', {
        params: {
          location: locationQuery || undefined,
          tagIds: tagIdsString || undefined,
        },
      });
      setExperiences(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve Ceylon experiences.');
    } finally {
      setLoading(false);
    }
  }, [locationQuery, selectedTagIds]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExperiences();
  };

  const handleQuickLocation = (loc: string) => {
    setLocationQuery(loc);
  };

  const getFallbackImage = (location: string, title: string) => {
    const loc = location.toLowerCase();
    const t = title.toLowerCase();
    if (loc.includes('ella') || t.includes('ella') || loc.includes('mountain') || t.includes('mountain')) {
      return 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80'; // Ella Bridge
    }
    if (loc.includes('galle') || t.includes('galle') || loc.includes('beach') || t.includes('beach') || loc.includes('coast') || t.includes('coast') || loc.includes('sea')) {
      return 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80'; // Galle Lighthouse
    }
    if (loc.includes('kandy') || t.includes('kandy') || loc.includes('temple') || t.includes('temple') || loc.includes('lake') || t.includes('lake')) {
      return 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80'; // Kandy Temple
    }
    if (loc.includes('sigiriya') || t.includes('sigiriya') || loc.includes('rock') || t.includes('rock') || loc.includes('dambulla') || t.includes('dambulla')) {
      return 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80'; // Sigiriya
    }
    return 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=800&q=80'; // Tea plantation
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 text-slate-800 font-sans antialiased">
      {/* Luxury Hero Banner Section */}
      <section className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-[32px] overflow-hidden h-[480px] sm:h-[540px] shadow-2xl flex items-center justify-center">
          {/* Background image overlay */}
          <div className="absolute inset-0 bg-cover bg-center select-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/40 to-transparent"></div>

          {/* Hero text overlay */}
          <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-teal-300 border border-white/20 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              <span>THE OFFICIAL CULTURAL &amp; HOMESTAY REGISTRY</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-serif leading-tight">
              Experience the True Soul <br className="hidden sm:block" />
              of Sri Lankan Hospitality
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Match with local hosts across Ceylon, filter by specific dietary and lifestyle preferences, and enjoy secure escrow protected stay registries.
            </p>
          </div>
        </div>

        {/* Overlapping Search Panel */}
        <div className="relative z-20 -mt-16 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-100/90">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Location Input */}
              <div className="md:col-span-8 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <MapPin className="h-5 w-5 text-teal-650 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</label>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Where are you traveling? (e.g. Ella, Kandy, Galle)"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-4 h-full">
                <button
                  type="submit"
                  className="w-full h-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-500 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/10 active:scale-95 transition-all duration-200"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Registry</span>
                </button>
              </div>
            </form>

            {/* Quick-filter preference tags inside console */}
            {tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                <span className="block text-[10px] font-bold tracking-widest text-slate-450 uppercase mb-3">
                  Match Cultural Preferences
                </span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.id)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold border transition-all duration-200 ${
                          isSelected
                            ? 'border-teal-650 bg-teal-650 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-650'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Destination Quick Picks */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif mb-6">Popular Destination Regions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Ella', label: 'Mountain Bridges & Tea', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80' },
            { name: 'Galle', label: 'Coastal Forts & Waves', img: 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=400&q=80' },
            { name: 'Kandy', label: 'Sacred Temples & Lakes', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Sigiriya', label: 'Ancient Rock Fortress', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=400&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-28 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
            >
              <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="block font-bold text-sm">{dest.name}</span>
                <span className="block text-[10px] text-slate-200">{dest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Listings Registry */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow text-left">
        <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Explore Homestay Listings</h2>
            <p className="text-sm text-slate-500 mt-1">Verified host locations matching your safety and dietary profiles.</p>
          </div>
          <button
            onClick={fetchExperiences}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Registry</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-650" />
            <span className="text-xs text-slate-450 mt-3 font-semibold uppercase tracking-wider">Retrieving LankaStay database...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/10 p-6 text-center max-w-md mx-auto">
            <p className="text-sm text-rose-800 font-bold">Error loading stays</p>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
            <button
              onClick={fetchExperiences}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-20 text-center bg-white">
            <p className="text-slate-500 text-sm font-semibold">No homestays found matching your filters.</p>
            <p className="text-xs text-slate-450 mt-1">Try clearing your search filters or input a new location.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {experiences.map((exp) => {
              const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
              return (
                <div
                  key={exp.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-350"
                >
                  {/* Photo Frame */}
                  <div className="aspect-[4/3] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    <img 
                      src={displayImage} 
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    {/* Rating Star Badge */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                    </div>

                    {/* Host Verified Badge */}
                    {exp.hostIsVerified && (
                      <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full bg-emerald-650 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified host</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-teal-650 shrink-0" />
                      <span>{exp.location}</span>
                    </div>
                    
                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                      <Link href={`/experience/${exp.id}`}>
                        <span className="absolute inset-0"></span>
                        {exp.title}
                      </Link>
                    </h3>
                    
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                      {exp.description}
                    </p>

                    <div className="my-4 h-[1px] bg-slate-100"></div>

                    {/* Matching Preference Tags */}
                    {exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {exp.tags.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-150/10"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold tracking-wider text-slate-400">HOSTED BY</span>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                          {exp.hostName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-teal-700">
                          ${exp.basePrice}
                        </span>
                        <span className="text-[10px] text-slate-455"> / guest</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Safety & Payout Assurance Dashboard Section */}
      <section className="bg-white border-y border-slate-200/60 py-20 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-teal-750 uppercase tracking-widest block">ASSURED AND SECURED</span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Trust &amp; Security at LankaStay</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                LankaStay isn't just a registry; it's a vetted environment designed to verify hosts and protect payments in secure escrow.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Host Clearance Audits</h4>
                  <p className="text-xs text-slate-550 mt-1 leading-relaxed">Hosts must upload valid Grama Niladhari and Police certificates. Stays remain locked until verification.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Secure Escrow Protection</h4>
                  <p className="text-xs text-slate-550 mt-1 leading-relaxed">Payments are held in platform escrow, releasing a 90% payout share on completion.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dynamic Seasonal Multipliers</h4>
                  <p className="text-xs text-slate-550 mt-1 leading-relaxed">Rates adjust automatically to host-configured dates during Ceylon festival seasons.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Cultural &amp; Dietary Matching</h4>
                  <p className="text-xs text-slate-550 mt-1 leading-relaxed">Filter matches by lifestyle restrictions (Vegan, Halal) to find your perfect homestay match.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="rounded-[32px] bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          {/* Ambient glow backgrounds */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Share Your Heritage</span>
            <h2 className="text-3xl sm:text-4.5xl font-bold font-serif leading-tight">Become a LankaStay Host Today</h2>
            <p className="text-sm text-slate-350 leading-relaxed">
              List your spare rooms, serve traditional Ceylon curries, and invite guests into your home. With LankaStay, you get 90% payout splits and complete control over seasonal peak pricing windows.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link 
                href="/auth/register"
                className="rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-teal-650/15 active:scale-95 transition-all duration-200"
              >
                Become a Host
              </Link>
              <Link 
                href="/auth/login"
                className="rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 px-6 py-3.5 text-xs font-bold transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
