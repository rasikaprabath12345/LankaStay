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
  <div className="flex flex-col overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
    <div className="aspect-[4/3] w-full bg-slate-200/50 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
    <div className="flex flex-col p-8 gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="h-6 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-10 w-16 shrink-0 rounded-xl bg-teal-50/50 animate-pulse" />
      </div>
      <div className="space-y-2.5">
        <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-3 w-4/5 rounded-full bg-slate-100 animate-pulse" />
      </div>
      <div className="h-[1px] bg-slate-50 w-full" />
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-12 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          setScrolled(window.scrollY > 200);
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

  // Helper to map tags to icons for dashboard filters
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
    <div className="flex flex-col min-h-screen bg-[#fcfcfb] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-200 selection:text-teal-900">
      
      {/* 1. Brand-New Immersive Hero Section */}
      <section className="relative w-full min-h-[92vh] flex items-center justify-center pt-16 pb-24 overflow-hidden bg-slate-950">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-100 ease-out scale-105 opacity-60"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2200&q=90')`,
            transform: `translateY(${scrollY * 0.3}px)` 
          }}
        />
        {/* Modern Layered Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/30 via-transparent to-amber-950/20" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#fcfcfb] to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Hero Copy */}
          <div className="flex-1 space-y-8 text-white max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-teal-300 border border-white/10 backdrop-blur-md uppercase tracking-[0.15em] shadow-lg">
              <Sparkles className="h-4.5 w-4.5 text-teal-300 animate-pulse" />
              <span>Certified Sri Lankan Heritage Registry</span>
            </div>

            <h1 className="text-balance text-5xl sm:text-7xl font-extrabold tracking-tight font-serif leading-[1.05] drop-shadow-lg">
              Live Like a Local <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-300 inline-block mt-2">
                In Paradise
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 leading-relaxed font-medium">
              Skip the hotels. Rent authentic rooms, villas, and cottages directly from verified Sri Lankan families. Experience pure hospitality, home-cooked food, and unforgettable cultural stories.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white font-serif">1.2k+</span>
                <span className="block text-xs text-slate-400 font-bold uppercase mt-1">Homestays</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white font-serif">4.9★</span>
                <span className="block text-xs text-slate-400 font-bold uppercase mt-1">Guest Rating</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black text-white font-serif">100%</span>
                <span className="block text-xs text-slate-400 font-bold uppercase mt-1">GN Secured</span>
              </div>
            </div>
          </div>

          {/* Floating Booking / Search Console */}
          <div className="w-full lg:w-[450px] shrink-0">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 text-left">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Find Your Experience</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Search verified stays across Sri Lanka.</p>
              </div>

              <form onSubmit={handleSearchSubmit} className="space-y-4">
                {/* Location query */}
                <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/5 transition-all duration-300 group flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-teal-600 shrink-0" />
                  <div className="flex-grow">
                    <label htmlFor="hero-location" className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Destination</label>
                    <input
                      id="hero-location"
                      type="text"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      placeholder="e.g. Ella, Galle, Kandy..."
                      className="w-full bg-transparent text-sm font-bold text-slate-800 focus:outline-none placeholder:text-slate-300"
                    />
                  </div>
                  {locationQuery && (
                    <button type="button" onClick={() => setLocationQuery('')} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Popular suggestions */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Popular:</span>
                  {['Ella', 'Galle', 'Kandy'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleQuickLocation(loc)}
                      className="text-xs font-bold text-teal-600 bg-teal-50/50 hover:bg-teal-50 border border-teal-100/50 rounded-full px-2.5 py-1 transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 py-4.5 text-sm font-bold text-white shadow-xl shadow-teal-600/20 hover:shadow-teal-700/30 active:scale-[0.98] transition-all duration-300"
                >
                  <Search className="h-5 w-5" />
                  <span className="tracking-wide">Explore Stays</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand-New Category filter bar (Airbnb style icon navigation) */}
      <section className="relative z-20 -mt-10 mx-auto max-w-[92%] xl:max-w-7xl w-full">
        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-slate-100 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
              Filter by Culinary &amp; Environment
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
          
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mask-linear-fade py-1">
            <button
              onClick={() => { setSelectedTagIds([]); setActiveCategory('all'); }}
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold transition-all duration-300 shrink-0 ${
                selectedTagIds.length === 0 && activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                  className={`flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold transition-all duration-300 shrink-0 border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20'
                      : 'bg-white text-slate-600 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
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

      {/* 3. Vetted & Vouched Trust Indicators */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 select-none">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight font-serif text-slate-900">Why Choose LankaStay?</h2>
          <p className="text-base text-slate-500 font-medium">We bridge local Sri Lankan families with global travelers safely and transparently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Award, 
              title: "SLTDA Standards compliant", 
              desc: "Every listing is audited to verify sanitation, bedroom facilities, and security to meet Sri Lankan tourism standards.", 
              color: "text-teal-600 bg-teal-50" 
            },
            { 
              icon: ShieldCheck, 
              title: "Grama Niladhari Clearance", 
              desc: "Hosts verify their profile via police records and official Grama Niladhari residence certifications for zero risk.", 
              color: "text-emerald-600 bg-emerald-50" 
            },
            { 
              icon: CheckCircle2, 
              title: "Escrow booking shield", 
              desc: "Payments are held locked. Payouts (90% share directly to the host) release safely only once your stay completes.", 
              color: "text-amber-600 bg-amber-50" 
            }
          ].map((item, i) => (
            <div key={i} className="group flex flex-col items-start p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-slate-200/60 hover:shadow-[0_20px_45px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 transition-all duration-500 text-left">
              <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.color} mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`}>
                <item.icon className="h-7 w-7" />
              </span>
              <h4 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Beautiful How It Works Section */}
      <section className="bg-slate-50 border-y border-slate-100 py-24 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4 space-y-6">
              <span className="text-xs font-black tracking-widest text-teal-600 uppercase">Seamless Matchmaking</span>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-serif leading-tight">
                How It Works <br />
                for Travelers
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Our platform makes experiencing Sri Lanka's beautiful countryside effortless, transparent, and completely worry-free.
              </p>
              <div className="pt-2">
                <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 group">
                  <span>Create traveler account</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Select Destination", desc: "Search stays by location and filter based on food (Halal, Vegan) or nature features." },
                { step: "02", title: "Request & Book", desc: "Submit your travel dates. All payments are secured in locked escrow shields." },
                { step: "03", title: "Immerse Safely", desc: "Enjoy cozy beds, fresh Sri Lankan curries, and share heritage stories with your host." }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-lg transition-all duration-300">
                  <span className="block text-3xl font-black text-teal-600/20 font-serif mb-6">{item.step}</span>
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
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Curated Sri Lankan Regions</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Quickly explore stays in Sri Lanka's most beautiful spots.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Ella', label: 'Misty Mountains', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80' },
            { name: 'Galle', label: 'Coastal Heritage', img: 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kandy', label: 'Sacred Kingdom', img: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=600&q=80' },
            { name: 'Sigiriya', label: 'Ancient Fortress', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50 transition-all duration-500 text-left w-full border border-slate-200/40"
            >
              <img src={dest.img} alt={dest.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500" />
              <div className="absolute bottom-6 left-6 text-white transform group-hover:-translate-y-1 transition-all duration-500">
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
          
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6 border-b border-slate-200/60 pb-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-serif">Featured Homestays</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Book direct and support local communities across the country.</p>
            </div>
            <button
              onClick={fetchExperiences}
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-white border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-350 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Sync Registry'}</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-10">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="rounded-[2.5rem] border border-rose-100 bg-rose-50/20 p-12 text-center max-w-2xl mx-auto shadow-sm">
              <p className="text-xl text-rose-900 font-bold mb-3 font-serif">Connection Error</p>
              <p className="text-sm text-rose-700/80 mb-8 font-medium">{error}</p>
              <button onClick={fetchExperiences} className="rounded-full bg-rose-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-95">
                Try Again
              </button>
            </div>
          ) : experiences.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-slate-200 bg-white py-32 text-center max-w-4xl mx-auto shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 mb-6 rotate-3">
                <Search className="h-10 w-10" />
              </div>
              <h3 className="text-slate-900 text-2xl font-bold font-serif">No homestays match the filter</h3>
              <p className="text-base text-slate-500 mt-3 font-medium max-w-md mx-auto">We couldn't find any listings matching your parameters. Clear options or try another region.</p>
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
                    className="group flex flex-col overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_25px_50px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
                  >
                    {/* Visual Card Media */}
                    <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={displayImage}
                        alt={exp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-500" />

                      {/* Top Badges */}
                      <div className={`absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 text-xs font-black text-slate-900 shadow-xl ${isHighlyRated ? 'ring-2 ring-amber-400' : ''}`}>
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                      </div>

                      {exp.hostIsVerified && (
                        <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-md px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-xl">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Verified Host</span>
                        </div>
                      )}

                      {/* Location Chip */}
                      <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white/95 backdrop-blur-md bg-black/40 rounded-full px-4 py-2 border border-white/20">
                        <MapPin className="h-4 w-4 text-teal-300" />
                        <span className="text-[11px] font-bold tracking-widest uppercase">{exp.location}</span>
                      </div>
                    </div>

                    {/* Stay Card Details */}
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 font-serif pr-2 leading-snug">
                          {exp.title}
                        </h3>
                        <div className="shrink-0 text-right bg-teal-50/70 text-teal-950 rounded-[1.25rem] px-4 py-2.5 border border-teal-100/50">
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
                              <span key={t.id} className="rounded-full bg-slate-50 border border-slate-200/60 px-3 py-1.5 text-[10px] font-bold text-slate-600">
                                {t.name}
                              </span>
                            ))}
                            {exp.tags.length > 1 && (
                              <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-1.5 text-[10px] font-bold text-slate-600">
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
        <div className="absolute left-0 bottom-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Traveler Stories</span>
            <h2 className="text-4xl font-bold font-serif tracking-tight">Voted Most Authentic Holiday Platform</h2>
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
                quote: "Escrow payment protection was excellent. It worked smoothly, and we had zero issues. The host was incredible, taking us around Nuwara Eliya tea estates. 10/10 service and platform cleanliness.",
                author: "Elena Petrova",
                location: "Switzerland",
                stars: 5,
                tag: "Kandy Mountain View Villa"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                <div className="space-y-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <Star key={idx} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 italic">"{t.quote}"</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-white text-sm">{t.author}</h5>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{t.location}</span>
                  </div>
                  <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-3 py-1.5 rounded-full font-bold">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Gorgeous CTA Host invite section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-left relative z-10">
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

      {/* Floating Action Button to Scroll Top */}
      <button
        onClick={handleScrollTop}
        className={`fixed bottom-8 right-6 z-40 flex items-center justify-center h-14 w-14 rounded-full bg-slate-900 text-white shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:bg-teal-700 hover:scale-110 active:scale-95 transition-all duration-500 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ChevronRight className="h-6 w-6 -rotate-90" />
      </button>
    </div>
  );
}