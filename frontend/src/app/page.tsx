'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient';
import { Search, MapPin, Star, Sparkles, Filter, Loader2, RefreshCw, ShieldCheck, Heart, Calendar, DollarSign, Compass, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen bg-slate-50/20 text-slate-800 font-sans antialiased">
      
      {/* Charming & Immersive Hero Banner Section */}
      <section className="relative mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-[32px] overflow-hidden h-[460px] sm:h-[500px] shadow-2xl flex items-center justify-center">
          {/* Background image overlay */}
          <div className="absolute inset-0 bg-cover bg-center select-none" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1600&q=80')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent"></div>

          {/* Hero text overlay */}
          <div className="relative z-10 text-center px-4 sm:px-8 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-[11px] font-bold text-teal-300 border border-white/20 backdrop-blur-md uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-teal-300 animate-pulse" />
              <span>Verified Local Homestay Registry</span>
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-serif leading-tight">
              Step Inside a Genuine <br />
              Sri Lankan Home
            </h1>
            
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
              Share authentic home-cooked traditional meals, exchange rich local family stories, and explore the hidden countryside under fully verified safety audits.
            </p>
          </div>
        </div>

        {/* Floating Search Console */}
        <div className="relative z-20 -mt-16 max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-150/70">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Location Input */}
              <div className="md:col-span-8 flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <MapPin className="h-5 w-5 text-teal-650 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Select Destination</label>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Where are you traveling? (e.g. Ella, Kandy, Galle)"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-450 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Search */}
              <div className="md:col-span-4 h-full">
                <button
                  type="submit"
                  className="w-full h-full flex items-center justify-center gap-2 rounded-2xl bg-teal-750 hover:bg-teal-700 py-4.5 text-sm font-bold text-white shadow-lg shadow-teal-750/15 active:scale-95 transition-all duration-200"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span>Search Registry</span>
                </button>
              </div>
            </form>

            {/* Cultural preference tag filter options */}
            {tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 text-left">
                <span className="block text-[9px] font-extrabold tracking-widest text-slate-450 uppercase mb-3">
                  Match Cultural &amp; Dietary Preferences
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
                            ? 'border-teal-650 bg-teal-650 text-white shadow-sm shadow-teal-650/10'
                            : 'border-slate-200 bg-white text-slate-655 hover:border-teal-500 hover:text-teal-650'
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

      {/* Trust & Safety Badges Bar - Essential for Credibility */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 mt-6 select-none">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-750 font-bold border border-teal-100">
              <Award className="h-5.5 w-5.5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-400">SLTDA Framework Compliant</h4>
              <p className="text-xs text-slate-550 mt-0.5 leading-normal">Independent registry compliant with local community tourism standards.</p>
            </div>
          </div>
          <div className="h-[1px] w-full md:h-10 md:w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
              <ShieldCheck className="h-5.5 w-5.5" />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-400">Police &amp; GN Clearance Auditing</h4>
              <p className="text-xs text-slate-550 mt-0.5 leading-normal">All listings undergo mandatory Grama Niladhari residence clearance checks.</p>
            </div>
          </div>
          <div className="h-[1px] w-full md:h-10 md:w-[1px] bg-slate-200"></div>
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-100">
              <CheckCircle2 className="h-5.5 w-5.5" />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-400">Locked Escrow Payout Protection</h4>
              <p className="text-xs text-slate-550 mt-0.5 leading-normal">Your payment is held securely in escrow, releasing 90% share to host on complete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Quick Filters */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 text-left select-none">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-serif mb-5">Explore by Destination</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Ella', label: 'Hill Country retreat', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=400&q=80' },
            { name: 'Galle', label: 'Ocean waves & forts', img: 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=400&q=80' },
            { name: 'Kandy', label: 'Sacred mountain lake', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Sigiriya', label: 'Ancient royal rock fortress', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=400&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-24 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
            >
              <img src={dest.img} alt={dest.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/30 transition-colors"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="block font-bold text-sm leading-none">{dest.name}</span>
                <span className="block text-[9px] text-slate-200 mt-1">{dest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Main Experiences Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow text-left">
        <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Available Homestays</h2>
            <p className="text-sm text-slate-500 mt-1">Book direct with verified local hosts across Sri Lanka.</p>
          </div>
          <button
            onClick={fetchExperiences}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            <span>Sync Listings</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-650" />
            <span className="text-xs text-slate-450 mt-3 font-semibold uppercase tracking-wider">Syncing LankaStay registries...</span>
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
          <div className="rounded-2xl border border-dashed border-slate-200 py-20 text-center bg-white">
            <p className="text-slate-500 text-sm font-semibold">No homestays match your selected filters.</p>
            <p className="text-xs text-slate-450 mt-1">Try changing your location input or matching options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {experiences.map((exp) => {
              const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
              return (
                <div
                  key={exp.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Visual container */}
                  <div className="aspect-[4/3] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    <img 
                      src={displayImage} 
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-fade-in"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    
                    {/* Rating Star Badge */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                    </div>

                    {/* Vetted Host Clearance Badge */}
                    {exp.hostIsVerified && (
                      <div className="absolute left-3.5 top-3.5 flex items-center gap-1 rounded-full bg-emerald-650 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified host</span>
                      </div>
                    )}
                  </div>

                  {/* Stay Details */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-teal-650 shrink-0" />
                      <span>{exp.location}</span>
                    </div>
                    
                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-teal-750 transition-colors line-clamp-1">
                      <Link href={`/experience/${exp.id}`}>
                        <span className="absolute inset-0"></span>
                        {exp.title}
                      </Link>
                    </h3>
                    
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                      {exp.description}
                    </p>

                    <div className="my-4 h-[1px] bg-slate-100"></div>

                    {/* Preference categories */}
                    {exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {exp.tags.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-700 border border-teal-150/15"
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
                        <span className="text-lg font-black text-teal-750">
                          ${exp.basePrice}
                        </span>
                        <span className="text-[10px] text-slate-450"> / guest</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Elegant CTA Host invite section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="rounded-[32px] bg-slate-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-teal-550/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Become a Host</span>
            <h2 className="text-3xl sm:text-4.5xl font-bold font-serif leading-tight">Share Your Home, Earn Income</h2>
            <p className="text-sm text-slate-350 leading-relaxed">
              Open your doors to travelers seeking authentic Sri Lankan lives. LankaStay hosts receive 90% payout splits and complete control over seasonal pricing windows.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link 
                href="/auth/register"
                className="rounded-xl bg-teal-650 hover:bg-teal-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                Register as Host
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
