'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient'; // Ensure this path is correct in your project
import { Search, MapPin, Star, Sparkles, RefreshCw, ShieldCheck, CheckCircle2, Award, ArrowRight, X, ChevronRight } from 'lucide-react';

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

const SkeletonCard = () => (
  <div className="flex flex-col overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <div className="aspect-[4/3] w-full bg-slate-200/60 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
    <div className="flex flex-col p-6 sm:p-7 gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-10 w-16 shrink-0 rounded-xl bg-teal-50/50 animate-pulse" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="h-[1px] bg-slate-50 w-full" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-2 w-12 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-slate-200/60 animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          setScrolled(window.scrollY > 400);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to retrieve Ceylon experiences.');
      } else {
        setError('An unexpected error occurred.');
      }
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
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickLocation = (loc: string) => {
    setLocationQuery(loc);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFallbackImage = (location: string, title: string) => {
    const loc = location.toLowerCase();
    const t = title.toLowerCase();
    if (loc.includes('ella') || t.includes('mountain')) return 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80';
    if (loc.includes('galle') || t.includes('beach') || loc.includes('sea')) return 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80';
    if (loc.includes('kandy') || t.includes('temple')) return 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';
    if (loc.includes('sigiriya') || t.includes('rock')) return 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80';
    return 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
      
      {/* 1. Ultra-Premium Hero Banner Section */}
      <section className="relative mx-auto max-w-[96%] xl:max-w-7xl w-full pt-6 sm:pt-8 mb-32 z-20">
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-visible shadow-[0_20px_60px_-15px_rgba(13,148,136,0.15)] h-[550px] sm:h-[680px] flex flex-col items-center justify-center border border-white/50">
          
          <div className="absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-slate-900">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out will-change-transform scale-110"
              style={{ 
                backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=2000&q=90')`,
                transform: `translateY(${scrollY * 0.25}px)` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90 mix-blend-multiply" />
            <div className="absolute inset-0 bg-teal-900/20 mix-blend-overlay" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl space-y-8 -mt-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-bold text-white border border-white/20 backdrop-blur-md uppercase tracking-[0.2em] shadow-2xl cursor-default">
              <Sparkles className="h-4 w-4 text-teal-300 animate-pulse" />
              <span className="drop-shadow-sm">Curated Sri Lankan Stays</span>
            </div>

            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-[5.5rem] font-serif leading-[1.05] drop-shadow-2xl">
              Experience the True <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-200 inline-block mt-2">
                Heart of Ceylon
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-200/90 leading-relaxed max-w-2xl mx-auto drop-shadow-md font-medium">
              Discover authentic homestays, savor home-cooked delicacies, and immerse yourself in local culture—verified for your absolute peace of mind.
            </p>
          </div>

          <div className="absolute -bottom-16 sm:-bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-30">
            <div
              className={`bg-white/70 backdrop-blur-3xl rounded-[2rem] sm:rounded-full p-4 sm:p-5 border border-white transition-all duration-700 ${
                scrolled ? 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] translate-y-2' : 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]'
              }`}
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 flex items-center gap-4 w-full bg-white rounded-xl sm:rounded-full px-6 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 hover:border-teal-200 focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all duration-300 group">
                  <MapPin className="h-6 w-6 text-teal-600/70 group-focus-within:text-teal-600 transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <label htmlFor="location-search" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                      Where to?
                    </label>
                    <input
                      id="location-search"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Ella, Kandy, Galle..."
                      className="w-full bg-transparent text-base font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-medium focus:outline-none"
                    />
                  </div>
                  {locationQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationQuery('')}
                      className="shrink-0 rounded-full bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="hidden md:flex flex-1 items-center gap-2 overflow-x-auto no-scrollbar pl-2 mask-linear-fade">
                  {tags.slice(0, 3).map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className={`shrink-0 rounded-full px-5 py-3 text-xs font-bold transition-all duration-300 ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25 ring-2 ring-teal-600 ring-offset-2'
                            : 'bg-white/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-slate-200/60'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full sm:w-auto shrink-0">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-slate-900 hover:bg-teal-700 px-8 py-4 sm:py-5 text-sm font-bold text-white shadow-xl shadow-slate-900/20 hover:shadow-teal-700/30 active:scale-95 transition-all duration-300"
                  >
                    <Search className="h-5 w-5" />
                    <span className="tracking-wide">Explore</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Premium Trust Indicators */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12 select-none relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
          {[
            { icon: Award, title: "SLTDA Compliant", desc: "Aligned with Sri Lanka's official community tourism framework.", color: "text-teal-600 bg-teal-50" },
            { icon: ShieldCheck, title: "Rigorous Auditing", desc: "Every host undergoes mandatory identity and safety clearances.", color: "text-emerald-600 bg-emerald-50" },
            { icon: CheckCircle2, title: "Secure Escrow", desc: "Payments are secured instantly and released strictly upon completion.", color: "text-amber-600 bg-amber-50" }
          ].map((item, i) => (
            <div key={i} className="group flex flex-col items-center text-center p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 cursor-default">
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                <item.icon className="h-7 w-7" />
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed max-w-[250px]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Destination Quick Filters */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 text-left select-none">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-serif">Curated Destinations</h2>
            <p className="text-base text-slate-500 mt-2 font-medium">Tap to instantly filter homestays by popular regions.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { name: 'Ella', label: 'Misty Mountains', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80' },
            { name: 'Galle', label: 'Coastal Heritage', img: 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kandy', label: 'Sacred Kingdom', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80' },
            { name: 'Sigiriya', label: 'Ancient Wonders', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 transition-all duration-500 text-left w-full"
            >
              <img src={dest.img} alt={dest.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 text-white transform group-hover:-translate-y-2 transition-transform duration-500">
                <span className="block font-black text-2xl tracking-wide">{dest.name}</span>
                <span className="block text-[11px] font-bold tracking-widest text-teal-300 uppercase mt-2 opacity-90">{dest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Main Experiences Grid */}
      <section ref={resultsRef} className="scroll-mt-10 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-200/60 pb-6">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-serif">Featured Homestays</h2>
              <p className="text-base text-slate-500 mt-2 font-medium">Handpicked local homes ready to welcome you.</p>
            </div>
            <button
              onClick={fetchExperiences}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh View'}</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50/50 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <p className="text-2xl text-rose-900 font-bold mb-3 font-serif">Oops! Something went wrong.</p>
              <p className="text-base text-rose-700/80 mb-8 font-medium">{error}</p>
              <button onClick={fetchExperiences} className="rounded-full bg-rose-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-95">
                Try Again
              </button>
            </div>
          ) : experiences.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center max-w-4xl mx-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 mb-6 rotate-3">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-slate-900 text-2xl font-bold font-serif">No homestays found</h3>
              <p className="text-base text-slate-500 mt-3 font-medium max-w-md mx-auto">We couldn't find any stays matching your current filters. Try adjusting your search criteria.</p>
              {(locationQuery || selectedTagIds.length > 0) && (
                <button
                  onClick={() => { setLocationQuery(''); setSelectedTagIds([]); }}
                  className="mt-8 rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
              {experiences.map((exp) => {
                const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
                const isHighlyRated = exp.averageRating >= 4.8;
                return (
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.id}`}
                    className="group flex flex-col overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={displayImage}
                        alt={exp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                      <div className={`absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-black text-slate-900 shadow-xl ${isHighlyRated ? 'ring-2 ring-amber-400' : ''}`}>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                      </div>

                      {exp.hostIsVerified && (
                        <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-md px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Verified</span>
                        </div>
                      )}

                      <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white/95 backdrop-blur-md bg-black/30 rounded-full px-4 py-2 border border-white/20">
                        <MapPin className="h-4 w-4" />
                        <span className="text-[11px] font-bold tracking-widest uppercase">{exp.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-7">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 font-serif pr-2">
                          {exp.title}
                        </h3>
                        <div className="shrink-0 text-right bg-teal-50/80 text-teal-900 rounded-[1rem] px-4 py-2 border border-teal-100/50">
                          <span className="block text-xl font-black leading-none">${exp.basePrice.toLocaleString()}</span>
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-teal-600/80 mt-1.5">per guest</span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-grow font-medium">
                        {exp.description}
                      </p>

                      <div className="my-6 h-[1px] bg-slate-100 w-full" />

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-base uppercase drop-shadow-sm">
                              {exp.hostName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Hosted By</span>
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                              {exp.hostName}
                            </span>
                          </div>
                        </div>

                        {exp.tags.length > 0 && (
                          <div className="flex gap-1.5">
                            {exp.tags.slice(0, 1).map((t) => (
                              <span key={t.id} className="rounded-full bg-slate-100/80 border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                                {t.name}
                              </span>
                            ))}
                            {exp.tags.length > 1 && (
                              <span className="rounded-full bg-slate-100/80 border border-slate-200 px-2 py-1.5 text-[10px] font-bold text-slate-600">
                                +{exp.tags.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Elegant CTA Host invite section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-left relative z-10 mb-10">
        <div className="rounded-[3rem] bg-slate-950 p-10 sm:p-16 lg:p-24 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-teal-300 border border-white/10 uppercase tracking-widest backdrop-blur-sm">
              <Award className="h-4 w-4" />
              <span>Partner With Us</span>
            </div>

            <h2 className="text-balance text-5xl sm:text-6xl lg:text-7xl font-bold font-serif leading-[1.05] tracking-tight">
              Share Your World, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Grow Your Income</span>
            </h2>

            <p className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-xl font-medium">
              Turn your extra space into a thriving opportunity. Join thousands of verified Sri Lankan hosts offering genuine experiences to global travelers.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-5">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-teal-500 hover:bg-teal-400 px-8 py-4 sm:py-5 text-sm font-bold text-slate-950 shadow-[0_0_40px_rgba(20,184,166,0.4)] active:scale-95 transition-all duration-300"
              >
                <span>Become a Host Today</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 px-8 py-4 sm:py-5 text-sm font-bold text-white transition-all duration-300"
              >
                <span>Sign In to Dashboard</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Button */}
      <button
        onClick={handleScrollTop}
        className={`fixed bottom-8 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:bg-teal-700 hover:scale-110 active:scale-95 transition-all duration-500 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );
}