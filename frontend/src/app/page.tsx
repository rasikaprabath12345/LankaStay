'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient';
import { Search, MapPin, Star, Sparkles, Filter, Loader2, RefreshCw, ShieldCheck, Heart, Calendar, DollarSign, Compass, CompassIcon, Trees, Flame, Sunset, Sunrise } from 'lucide-react';

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
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  const handleCategoryClick = (category: string, query: string) => {
    setActiveCategory(category);
    setLocationQuery(query);
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
    <div className="flex flex-col min-h-screen bg-[#fdfbf7] text-slate-800 font-sans antialiased">
      {/* Luxury Search Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f5f0e6] via-[#fdfbf7] to-[#fdfbf7] py-20 lg:py-28 border-b border-[#ebdcb9]/30">
        {/* Glow effect decoration */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-teal-600/5 rounded-full blur-[160px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-bold text-teal-800 border border-teal-200/40 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>EXPERIENCE GENUINE hospitality</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6.5xl leading-[1.08] font-serif">
                Authentic Ceylon <br />
                <span className="text-teal-700 italic font-semibold">Homestays</span> &amp; Culture
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                LankaStay invites you to step inside local homes, share home-cooked traditional meals, and discover the hidden beauty of Sri Lanka through secure, custom-matched filters.
              </p>

              {/* Combined Search Bar */}
              <form onSubmit={handleSearchSubmit} className="max-w-2xl rounded-2xl bg-white p-2.5 shadow-xl shadow-slate-100/70 border border-slate-150 flex flex-col sm:flex-row gap-2 mt-4 hover:shadow-2xl hover:border-slate-200 transition-all duration-300">
                <div className="flex flex-1 items-center gap-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-100 py-3">
                  <MapPin className="h-5 w-5 text-teal-650 shrink-0" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Where to? (e.g. Ella, Galle, Kandy)"
                    className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-750 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-teal-750/10 hover:bg-teal-700 active:scale-95 transition-all duration-200"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Registry</span>
                </button>
              </form>
            </div>

            {/* Right Collage Column */}
            <div className="lg:col-span-5 relative h-[360px] sm:h-[420px] hidden md:block select-none">
              {/* Photo 1: Sigiriya */}
              <div className="absolute top-[5%] left-[5%] w-[60%] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-[-3deg] hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80" 
                  alt="Sigiriya Fortress"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo 2: Ella Train */}
              <div className="absolute top-[25%] right-[5%] w-[55%] aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-[4deg] hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80" 
                  alt="Ella Nine Arch"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Photo 3: Galle Lighthouse */}
              <div className="absolute bottom-[2%] left-[25%] w-[45%] aspect-[1/1] rounded-3xl overflow-hidden shadow-xl border-4 border-white rotate-[-2deg] hover:rotate-0 hover:scale-105 hover:z-30 transition-all duration-500 cursor-pointer">
                <img 
                  src="https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80" 
                  alt="Galle Lighthouse"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Preference Tags Selector */}
      <section className="bg-white border-b border-slate-100 py-8 text-center select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Destination Filters */}
          <div className="flex justify-center items-center gap-6 overflow-x-auto pb-4 scrollbar-none">
            <button
              onClick={() => handleCategoryClick('all', '')}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'all' ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-450 hover:text-slate-900'
              }`}
            >
              <CompassIcon className="h-5 w-5" />
              <span>All Locations</span>
            </button>
            <button
              onClick={() => handleCategoryClick('ella', 'Ella')}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'ella' ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-450 hover:text-slate-900'
              }`}
            >
              <Trees className="h-5 w-5" />
              <span>Ella Mountains</span>
            </button>
            <button
              onClick={() => handleCategoryClick('galle', 'Galle')}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'galle' ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-450 hover:text-slate-900'
              }`}
            >
              <Sunset className="h-5 w-5" />
              <span>Galle Beaches</span>
            </button>
            <button
              onClick={() => handleCategoryClick('kandy', 'Kandy')}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'kandy' ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-450 hover:text-slate-900'
              }`}
            >
              <Flame className="h-5 w-5" />
              <span>Kandy Heritage</span>
            </button>
            <button
              onClick={() => handleCategoryClick('sigiriya', 'Sigiriya')}
              className={`flex flex-col items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all shrink-0 ${
                activeCategory === 'sigiriya' ? 'border-teal-700 text-teal-700' : 'border-transparent text-slate-450 hover:text-slate-900'
              }`}
            >
              <Sunrise className="h-5 w-5" />
              <span>Sigiriya Rock</span>
            </button>
          </div>

          {/* Cultural constraint sub-filters */}
          {tags.length > 0 && (
            <div className="mt-8 border-t border-slate-50 pt-6">
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                MATCH PREFERENCE TAGS
              </span>
              <div className="flex flex-wrap justify-center gap-2">
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
      </section>

      {/* Grid of Experiences */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow">
        <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-5">
          <div className="text-left">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Featured Homestay Registries
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked accommodations featuring verify status and custom seasonal pricing.
            </p>
          </div>
          <button
            onClick={fetchExperiences}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Listings</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-700" />
            <span className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-wider">
              Loading Ceylon Stays...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-6 text-center max-w-md mx-auto">
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
          <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center bg-white">
            <p className="text-slate-500 text-sm font-semibold">No homestays found matching your filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the destination category or removing preference checkboxes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {experiences.map((exp) => {
              const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
              return (
                <div
                  key={exp.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#ebdcb9]/15 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#ebdcb9]/40 transition-all duration-300"
                >
                  {/* Photo Container */}
                  <div className="aspect-[4/3] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    <img 
                      src={displayImage} 
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    {/* Rating Badge */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                    </div>

                    {/* Verification Clearance Badge */}
                    {exp.hostIsVerified && (
                      <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full bg-emerald-650 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified host</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6 text-left">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-teal-650 shrink-0" />
                      <span>{exp.location}</span>
                    </div>
                    
                    <h3 className="mt-2.5 text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                      <Link href={`/experience/${exp.id}`}>
                        <span className="absolute inset-0"></span>
                        {exp.title}
                      </Link>
                    </h3>
                    
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                      {exp.description}
                    </p>

                    {/* Horizontal separator */}
                    <div className="my-4 h-[1px] bg-slate-100"></div>

                    {/* Preferences match display */}
                    {exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {exp.tags.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 border border-teal-150/10"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold tracking-wider text-slate-400">HOSTED BY</span>
                        <span className="text-xs font-bold text-slate-655 truncate max-w-[125px]">
                          {exp.hostName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-teal-700">
                          ${exp.basePrice}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium"> / guest</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Elegant Professional Features Grid */}
      <section className="bg-white border-y border-[#ebdcb9]/20 py-20 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Why LankaStay Registry?</h2>
            <p className="text-sm text-slate-500">
              A university IT project baseline designed with strict verification, matching, and escrow policies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border border-slate-100 p-6 rounded-2xl bg-[#fdfbf7]/50 hover:shadow-lg transition-all duration-300">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-4 shadow-sm">
                <Heart className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Dietary &amp; Cultural Matches</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Filter hosts by lifestyle and dietary preferences (Vegan, Halal, Pet-friendly) to ensure a compatible cultural stay.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-[#fdfbf7]/50 hover:shadow-lg transition-all duration-300">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4 shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Strict Host Verification</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Hosts must upload Grama Niladhari and Police clearances. Listing remains disabled until admin check-approval.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-[#fdfbf7]/50 hover:shadow-lg transition-all duration-300">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-4 shadow-sm">
                <Calendar className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Dynamic Seasonal Rates</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Baseline rates automatically transition to custom peak multipliers during festival seasons and holiday intervals.
              </p>
            </div>

            <div className="border border-slate-100 p-6 rounded-2xl bg-[#fdfbf7]/50 hover:shadow-lg transition-all duration-300">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-4 shadow-sm">
                <DollarSign className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Escrow Splits &amp; Commission</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Funds are held in secure escrow, releasing 90% payout share directly to local hosts and 10% platform commission on complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Invite Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-teal-750 to-teal-700 p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-teal-800/10 text-left">
          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl sm:text-3.5xl font-bold font-serif leading-tight">Share Your Home, Earn Income</h2>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-3 leading-relaxed">
              Are you a local Sri Lankan host? LankaStay gives you control over peak pricing calendars and pays a verified 90% payout share directly to your account.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link 
                href="/auth/register" 
                className="rounded-xl bg-white px-6 py-3.5 text-xs font-bold text-teal-800 hover:bg-teal-50 active:scale-95 transition-all shadow-sm"
              >
                Become a Host
              </Link>
              <Link 
                href="/auth/login" 
                className="rounded-xl bg-teal-800/40 border border-teal-500/40 px-6 py-3.5 text-xs font-bold hover:bg-teal-800/60 transition-colors"
              >
                Explore Stays
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
