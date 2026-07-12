'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient'; 
import { 
  Search, 
  MapPin, 
  Star, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  X, 
  ChevronRight, 
  Compass, 
  Heart, 
  Utensils, 
  Palmtree, 
  Mountain, 
  Coffee, 
  Users, 
  ShieldAlert 
} from 'lucide-react';

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
  <div className="flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
    <div className="aspect-[4/3] w-full bg-slate-100 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
    <div className="flex flex-col p-8 gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-3/4 rounded-lg bg-slate-200/60 animate-pulse" />
        <div className="h-10 w-16 shrink-0 rounded-xl bg-teal-50 animate-pulse" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded-none bg-slate-100 animate-pulse" />
        <div className="h-3 w-4/5 rounded-none bg-slate-100 animate-pulse" />
      </div>
      <div className="h-[1px] bg-slate-50 w-full" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-12 rounded-none bg-slate-150 animate-pulse" />
          <div className="h-3 w-24 rounded-none bg-slate-200/60 animate-pulse" />
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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 200);
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

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTagIcon = (tagName: string) => {
    const name = tagName.toLowerCase();
    if (name.includes('food') || name.includes('vegan') || name.includes('breakfast') || name.includes('dining')) {
      return <Utensils className="h-4 w-4" />;
    }
    if (name.includes('nature') || name.includes('adventure') || name.includes('wildlife') || name.includes('hike')) {
      return <Mountain className="h-4 w-4" />;
    }
    if (name.includes('beach') || name.includes('surf') || name.includes('ocean')) {
      return <Palmtree className="h-4 w-4" />;
    }
    if (name.includes('tea') || name.includes('spices') || name.includes('estate')) {
      return <Coffee className="h-4 w-4" />;
    }
    return <Compass className="h-4 w-4" />;
  };

  const getFallbackImage = (location: string, title: string) => {
    const loc = location.toLowerCase();
    const t = title.toLowerCase();
    if (loc.includes('ella') || t.includes('mountain') || t.includes('ella')) {
      return 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80';
    }
    if (loc.includes('galle') || t.includes('beach') || loc.includes('sea') || t.includes('lighthouse')) {
      return 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80';
    }
    if (loc.includes('kandy') || t.includes('temple') || t.includes('lake') || loc.includes('temple')) {
      return 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80';
    }
    if (loc.includes('sigiriya') || t.includes('rock') || loc.includes('dambulla')) {
      return 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80';
    }
    if (loc.includes('mirissa') || loc.includes('weligama') || t.includes('surf')) {
      return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF9] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Full-Width Bleed Hero Section with Centered Grid Content & Solid Overlay Card (Editorial style, zero glassmorphism) */}
      <section className="relative w-full min-h-[600px] sm:min-h-[680px] flex items-center justify-start border-b border-slate-200 z-20">
        {/* Full-width Background Image (Authentic Sri Lankan landscape: Ella Bridge) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=2200&q=90')` }}
        />
        <div className="absolute inset-0 bg-slate-900/10" />

        {/* Content Wrapper to align card with standard site grid margins */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-start">
          
          {/* Solid White Content Card Overlaid (Opaque, clean borders, standard curves, zero glassmorphism) */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200/80 w-full max-w-xl text-left space-y-6 sm:space-y-7 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 px-3.5 py-1.5 text-[11px] font-bold text-teal-800 border border-teal-100/50 uppercase tracking-wider rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-teal-700 animate-pulse" />
              <span>Verified Local Homestay Registry</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-balance text-4xl sm:text-5xl font-extrabold tracking-tight font-serif text-slate-900 leading-[1.12]">
                Live Like a Local in <br />
                <span className="text-teal-700 font-serif italic">Beautiful Sri Lanka</span>
              </h1>
              <div className="h-1 w-12 bg-teal-600 rounded-full" />
            </div>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
              Skip standard hotels. Connect directly with certified Sri Lankan families. Rent cozy homestays, enjoy home-cooked culinary heritage, and explore Ceylon with absolute peace of mind.
            </p>

            {/* Solid Search Console inside the card */}
            <div className="space-y-4 pt-2">
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="bg-slate-50 px-5 py-4 border border-slate-200 focus-within:border-teal-700 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all duration-300 group flex items-center gap-3 rounded-xl">
                  <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-teal-650 shrink-0" />
                  <div className="flex-grow">
                    <label htmlFor="search-input" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Where to?</label>
                    <input
                      id="search-input"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Ella, Galle, Kandy..."
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none placeholder:text-slate-350"
                    />
                  </div>
                  {locationQuery && (
                    <button type="button" onClick={() => setLocationQuery('')} className="text-slate-450 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Popular:</span>
                  {['Ella', 'Galle', 'Kandy', 'Sigiriya'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleQuickLocation(loc)}
                      className="font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 transition-colors border border-slate-200/30 rounded-lg text-xs"
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-teal-750 hover:bg-teal-800 py-4 sm:py-4.5 text-sm font-bold text-white shadow-lg shadow-teal-750/20 active:scale-[0.98] transition-all duration-300 rounded-xl"
                >
                  <Search className="h-4.5 w-4.5" />
                  <span className="tracking-wide">Explore Stays</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Category Filter Bar (Solid cards, clean borders) */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 select-none">
        <div className="bg-white shadow-[0_4px_25px_rgba(0,0,0,0.01)] border border-slate-200 p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
              Filter by Culinary &amp; Environment Tags
            </span>
            {selectedTagIds.length > 0 && (
              <button 
                onClick={() => setSelectedTagIds([])}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                Clear all ({selectedTagIds.length})
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => { setSelectedTagIds([]); setActiveCategory('all'); }}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-300 shrink-0 border rounded-full ${
                selectedTagIds.length === 0 && activeCategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-950 shadow-md'
                  : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>All Homestays</span>
            </button>

            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => { handleTagToggle(tag.id); setActiveCategory(tag.id); }}
                  className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-300 shrink-0 border rounded-full ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-800 shadow-md'
                      : 'bg-white text-slate-650 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {getTagIcon(tag.name)}
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid (Solid, premium border designs with clean borders) */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 select-none">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-slate-900">Credibility &amp; Trust First</h2>
          <p className="text-base text-slate-500 font-medium">LankaStay connects global visitors to authentic Sri Lankan stays with security and fairness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Award, 
              title: "SLTDA Standards Compliant", 
              desc: "Every listing matches standard tourism metrics, ensuring comfortable accommodation, clean sanitation, and reliable hosts.", 
              color: "text-teal-700 bg-teal-50 border border-teal-200/50" 
            },
            { 
              icon: ShieldCheck, 
              title: "GN Clearance Certified", 
              desc: "All hosts undergo residential check clearances verified via local Grama Niladhari and official police records.", 
              color: "text-emerald-700 bg-emerald-50 border border-emerald-250/30" 
            },
            { 
              icon: CheckCircle2, 
              title: "Protected Escrow Payment", 
              desc: "Funds stay locked in escrow until check-out, ensuring 90% booking fees release directly to hosts on complete verification.", 
              color: "text-amber-700 bg-amber-50 border border-amber-200/50" 
            }
          ].map((item, i) => (
            <div key={i} className="group flex flex-col items-start p-8 bg-white border border-slate-200 hover:border-slate-350 shadow-sm hover:shadow-md transition-all duration-500 text-left rounded-2xl">
              <span className={`flex h-14 w-14 items-center justify-center rounded-xl ${item.color} mb-8 group-hover:scale-105 transition-transform duration-500`}>
                <item.icon className="h-6.5 w-6.5" />
              </span>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. solid, premium How It Works Section */}
      <section className="bg-slate-100 border-y border-slate-200/60 py-20 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4 space-y-5">
              <span className="text-xs font-black tracking-widest text-teal-700 uppercase">Simple Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-serif leading-tight">
                How It Works <br />
                for Travelers
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Our secure platform allows you to book and experience authentic Sri Lankan hospitality with zero complications.
              </p>
              <div className="pt-2">
                <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 group">
                  <span>Register traveler profile</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Discover & Filter", desc: "Browse verified homestays by specific culinary or regional parameters." },
                { step: "02", title: "Reserve Safely", desc: "Confirm booking request. Your money is secured via locked escrow protection." },
                { step: "03", title: "Immerse Locally", desc: "Stay with local families, enjoy home-cooked meals, and experience Ceylon safely." }
              ].map((item, index) => (
                <div key={index} className="bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <span className="block text-3xl font-black text-teal-700/25 font-serif mb-6">{item.step}</span>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. Destination Quick Filters */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 text-left select-none">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Curated Regional Filters</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Instantly discover homestays across popular travel spots.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Ella', label: 'Misty Mountain Retreats', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80' },
            { name: 'Galle', label: 'Coast & Fort Heritage', img: 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kandy', label: 'Sacred Hill Country', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80' },
            { name: 'Sigiriya', label: 'Ancient Rock Kingdom', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-48 sm:h-56 overflow-hidden shadow-sm hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 transition-all duration-500 text-left w-full border border-slate-200 rounded-2xl"
            >
              <img src={dest.img} alt={dest.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-slate-900/60 group-hover:bg-slate-900/70 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="block font-black text-2xl tracking-wide">{dest.name}</span>
                <span className="block text-[11px] font-bold tracking-widest text-teal-300 uppercase mt-2 opacity-90">{dest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Main Experiences Grid */}
      <section ref={resultsRef} className="scroll-mt-20 pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 w-full text-left">
          
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-serif">Featured Homestays</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Connect directly and support local families in rural regions.</p>
            </div>
            <button
              onClick={fetchExperiences}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 shadow-sm transition-all active:scale-95 disabled:opacity-50 rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 text-teal-700 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Sync Registry'}</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="border border-rose-200 bg-rose-50 p-12 text-center max-w-2xl mx-auto shadow-sm rounded-2xl">
              <p className="text-xl text-rose-900 font-bold mb-3 font-serif">Connection Error</p>
              <p className="text-sm text-rose-700/80 mb-8 font-medium">{error}</p>
              <button onClick={fetchExperiences} className="bg-rose-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-lg active:scale-95 rounded-xl">
                Try Again
              </button>
            </div>
          ) : experiences.length === 0 ? (
            <div className="border border-dashed border-slate-200 bg-white py-32 text-center max-w-4xl mx-auto shadow-sm rounded-2xl">
              <div className="inline-flex h-20 w-20 items-center justify-center bg-slate-50 text-slate-400 mb-6 rounded-xl">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-slate-900 text-2xl font-bold font-serif">No homestays match the filter</h3>
              <p className="text-base text-slate-500 mt-3 font-medium max-w-md mx-auto">We couldn't find any listings matching your parameters. Clear options or try another region.</p>
              {(locationQuery || selectedTagIds.length > 0) && (
                <button
                  onClick={() => { setLocationQuery(''); setSelectedTagIds([]); }}
                  className="mt-8 bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition-all shadow-lg active:scale-95 rounded-xl"
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
                const isFavorite = favorites.includes(exp.id);
                return (
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.id}`}
                    className="group flex flex-col overflow-hidden bg-white border border-slate-200 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 transition-all duration-500 rounded-2xl relative"
                  >
                    {/* Visual Card Media */}
                    <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={displayImage}
                        alt={exp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      
                      {/* Favorite Button (Floating clean opaque circle) */}
                      <button
                        onClick={(e) => toggleFavorite(e, exp.id)}
                        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center bg-white shadow-md border border-slate-100 hover:scale-110 active:scale-95 transition-all duration-200 rounded-full"
                        aria-label="Add to favorites"
                      >
                        <Heart 
                          className={`h-5 w-5 transition-colors ${
                            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
                          }`} 
                        />
                      </button>

                      {/* Top Badges (Solid opaque backgrounds, standard curves) */}
                      <div className={`absolute left-5 top-5 flex items-center gap-1.5 bg-white px-3.5 py-2 text-xs font-black text-slate-900 shadow-md rounded-lg ${isHighlyRated ? 'ring-2 ring-amber-400' : ''}`}>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                      </div>

                      {exp.hostIsVerified && (
                        <div className="absolute left-5 bottom-16 flex items-center gap-1 bg-emerald-600 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md rounded-lg">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Verified Host</span>
                        </div>
                      )}

                      {/* Location Badge */}
                      <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-slate-950 text-white px-3.5 py-2 border border-slate-800 rounded-lg">
                        <MapPin className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">{exp.location}</span>
                      </div>
                    </div>

                    {/* Stay Card Details */}
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2 font-serif pr-2 leading-snug">
                          {exp.title}
                        </h3>
                        <div className="shrink-0 text-right bg-teal-50 text-teal-950 px-4 py-2.5 border border-teal-200/50 rounded-xl">
                          <span className="block text-2xl font-black leading-none text-teal-800">${exp.basePrice.toLocaleString()}</span>
                          <span className="block text-[9px] font-bold uppercase tracking-widest text-teal-600 mt-1.5">per guest</span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed flex-grow font-medium">
                        {exp.description}
                      </p>

                      <div className="my-6 h-[1px] bg-slate-100 w-full" />

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3.5">
                          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
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
                              <span key={t.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 rounded-lg">
                                {t.name}
                              </span>
                            ))}
                            {exp.tags.length > 1 && (
                              <span className="bg-slate-50 border border-slate-200 px-2 py-1.5 text-[10px] font-bold text-slate-600 rounded-lg">
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

      {/* 7. Premium Testimonials Block */}
      <section className="bg-slate-900 text-white py-24 select-none relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Traveler Stories</span>
            <h2 className="text-3.5xl font-bold font-serif tracking-tight">Voted Most Authentic Holiday Platform</h2>
            <p className="text-base text-slate-400">Read verified reviews from adventurers who lived local.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Staying with Anura's family in Ella was the highlight of our trip. They welcomed us with fresh king coconuts, and we made traditional coconut sambol together over woodfire! LankaStay verified status made us feel 100% safe.",
                author: "Sarah & Mark",
                location: "United Kingdom",
                stars: 5,
                tag: "Ella Hilltop Cottage"
              },
              {
                quote: "The GN clearance check gives so much security. The cottage in Galle was gorgeous, just a 5-min walk to local surf spots. The food cooked by Mrs. Jayasinghe was the best Sri Lankan food we ever tasted. Absolutely recommended!",
                author: "Jonas Müller",
                location: "Germany",
                stars: 5,
                tag: "Galle Heritage Homestay"
              },
              {
                quote: "Elena stayed at Kandy View Villa and found the escrow booking security incredibly transparent. Smooth check-in, check-out, and beautiful home-cooked food. Strongly recommended!",
                author: "Elena Petrova",
                location: "Switzerland",
                stars: 5,
                tag: "Kandy Mountain View Villa"
              }
            ].map((t, i) => (
              <div key={i} className="bg-slate-800 p-8 border border-slate-700/60 flex flex-col justify-between hover:border-slate-650 transition-all duration-300 rounded-2xl">
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <Star key={idx} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 italic">"{t.quote}"</p>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-white text-sm">{t.author}</h5>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.location}</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-teal-400 border border-slate-700 px-3 py-1.5 font-bold rounded-lg">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Gorgeous CTA Host invite section (Solid, clean edge) */}
      <section className="w-full bg-slate-950 text-white py-24 px-6 sm:px-16 md:px-24 border-t border-slate-900 text-left relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-xs font-bold text-teal-300 border border-slate-800 uppercase tracking-widest rounded-lg">
              <Award className="h-4 w-4" />
              <span>Partner With Us</span>
            </div>

            <h2 className="text-balance text-4xl sm:text-6xl font-bold font-serif leading-[1.1] tracking-tight">
              Share Your World, <br/>
              <span className="text-teal-400 font-serif italic">Grow Your Income</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-355 leading-relaxed max-w-xl font-medium">
              Turn your extra space into a thriving opportunity. Join thousands of verified Sri Lankan hosts offering genuine experiences to global travelers.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-5">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-3 bg-teal-500 hover:bg-teal-400 px-8 py-4 sm:py-5 text-sm font-bold text-slate-950 shadow-md active:scale-95 transition-all duration-300 rounded-xl"
              >
                <span>Become a Host Today</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-transparent border border-slate-850 hover:border-slate-700 hover:bg-slate-900 px-8 py-4 sm:py-5 text-sm font-bold text-white transition-all duration-300 rounded-xl"
              >
                <span>Sign In to Dashboard</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
          <div className="hidden lg:block border border-slate-800 p-10 bg-slate-900/50 shadow-2xl rounded-2xl">
            <h4 className="text-lg font-bold text-white font-serif mb-4">Host Guarantee Highlights</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-medium">
              <li className="flex items-center gap-3">✓ 90% direct payout share released immediately.</li>
              <li className="flex items-center gap-3">✓ Full freedom to set daily pricing and seasonal surges.</li>
              <li className="flex items-center gap-3">✓ Pre-arrival traveler checks via identity registries.</li>
              <li className="flex items-center gap-3">✓ Zero registration cost for local families.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Floating Action Button to Scroll Top */}
      <button
        onClick={handleScrollTop}
        className={`fixed bottom-8 right-6 z-40 flex items-center justify-center h-14 w-14 bg-slate-900 text-white shadow-lg hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all duration-500 rounded-xl ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronRight className="h-6 w-6 -rotate-90" />
      </button>
    </div>
  );
}