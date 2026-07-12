'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
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
  Bed,
  Home
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
    <div className="flex flex-col p-6 gap-3">
      <div className="h-3 w-1/4 rounded bg-slate-200 animate-pulse" />
      <div className="h-5 w-3/4 rounded bg-slate-200/80 animate-pulse" />
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-3.5 w-3.5 rounded-full bg-slate-100 animate-pulse" />
        ))}
      </div>
      <div className="h-4 w-1/3 rounded bg-slate-200/60 animate-pulse mt-2" />
    </div>
  </div>
);

export default function HomePage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchCategory, setSearchCategory] = useState<string>('all');
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

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSelectedTagIds([]);
      return;
    }
    // Find matching tag in the loaded tags
    const matchedTag = tags.find(t => 
      t.name.toLowerCase().includes(category) || 
      t.description.toLowerCase().includes(category)
    );
    if (matchedTag) {
      setSelectedTagIds([matchedTag.id]);
    } else {
      setSelectedTagIds([]);
    }
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

  const renderTripAdvisorBubbles = (rating: number) => {
    const roundedRating = Math.round(rating || 4);
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 bubbles`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const isFilled = idx < roundedRating;
          return (
            <span
              key={idx}
              className={`h-3 w-3 rounded-full border border-[#00aa6c] ${
                isFilled ? 'bg-[#00aa6c]' : 'bg-white'
              }`}
            />
          );
        })}
      </div>
    );
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
      return 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=800&q=80';
    }
    if (loc.includes('mirissa') || loc.includes('weligama') || t.includes('surf')) {
      return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF9] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-100 selection:text-teal-900">

      {/* 1. TripAdvisor Style Hero Section with Search Card */}
      <section className="relative w-full min-h-[450px] sm:min-h-[520px] flex flex-col items-center justify-center text-center px-4 py-16 z-20 bg-[#FCFBF9]">
        {/* Full-width Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=2200&q=90')` }}
        />
        {/* Soft elegant TripAdvisor dark-green gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/20 to-transparent" />

        {/* Content Centered on top of background */}
        <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center space-y-6">

          <div className="space-y-3 flex flex-col items-center">
            <h1 className="text-white font-serif text-4xl sm:text-6xl font-black tracking-tight drop-shadow-sm leading-tight">
              Where to?
            </h1>
            <p className="text-white/95 text-xs sm:text-sm font-semibold max-w-xl leading-relaxed drop-shadow-sm">
              Discover verified homestays, traditional meals, and raw Sri Lankan experiences.
            </p>
          </div>

          {/* Integrated Search Card */}
          <div className="w-full bg-white rounded-3xl p-5 shadow-2xl border border-slate-200/60 text-left">
            {/* Search Category Tabs */}
            <div className="flex gap-4 border-b border-slate-100 pb-3 mb-4 text-xs font-bold text-slate-500">
              {[
                { id: 'all', name: 'Search All', icon: <Compass className="h-4 w-4" /> },
                { id: 'stays', name: 'Homestays', icon: <Home className="h-4 w-4" /> },
                { id: 'experiences', name: 'Experiences', icon: <Sparkles className="h-4 w-4" /> },
                { id: 'food', name: 'Culinary Food', icon: <Utensils className="h-4 w-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchCategory(tab.id)}
                  className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-all ${
                    searchCategory === tab.id
                      ? 'text-[#00aa6c] border-[#00aa6c]'
                      : 'border-transparent hover:text-[#00aa6c]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 bg-slate-50 rounded-2xl w-full md:flex-grow">
                <MapPin className="h-5 w-5 text-[#00aa6c] shrink-0" />
                <div className="flex-grow text-left">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Location</span>
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Where are you going? (e.g. Ella, Galle)"
                    className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                {locationQuery && (
                  <button type="button" onClick={() => setLocationQuery('')} className="text-slate-400 hover:text-slate-655">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full md:w-auto bg-[#00aa6c] hover:bg-[#00915c] text-white font-black text-xs uppercase tracking-wider rounded-2xl px-8 py-4 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Quick links below the card */}
          <div className="flex items-center gap-2 flex-wrap justify-center text-xs font-bold text-white/95">
            <span>Trending spots:</span>
            {['Ella', 'Galle', 'Kandy', 'Sigiriya'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => handleQuickLocation(loc)}
                className="text-[11px] font-bold text-slate-800 bg-white/95 hover:bg-white px-3 py-1 rounded-full shadow-sm transition-colors border border-white/20"
              >
                {loc}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. TripAdvisor Categories Icons (Circular Row) */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center gap-6 md:gap-12 overflow-x-auto no-scrollbar py-2 border-b border-slate-200/50 pb-8">
          {[
            { name: 'All Stays', icon: <Compass className="h-5.5 w-5.5" />, tag: 'all' },
            { name: 'Homestays', icon: <Home className="h-5.5 w-5.5" />, tag: 'stay' },
            { name: 'Traditional Kitchen', icon: <Utensils className="h-5.5 w-5.5" />, tag: 'food' },
            { name: 'Mountain Hikes', icon: <Mountain className="h-5.5 w-5.5" />, tag: 'nature' },
            { name: 'Surf & Ocean', icon: <Palmtree className="h-5.5 w-5.5" />, tag: 'beach' },
            { name: 'Tea & Spices', icon: <Coffee className="h-5.5 w-5.5" />, tag: 'tea' }
          ].map((cat) => {
            const isActive = activeCategory === cat.tag;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.tag)}
                className="flex flex-col items-center gap-2 group shrink-0"
              >
                <div className={`h-14 w-14 rounded-full border flex items-center justify-center shadow-sm transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#00aa6c] text-white border-[#00aa6c] scale-105' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-[#00aa6c] hover:text-[#00aa6c] hover:scale-105'
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[11px] font-bold transition-colors ${
                  isActive ? 'text-[#00aa6c]' : 'text-slate-500 group-hover:text-[#00aa6c]'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section id="about" className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 select-none scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-slate-900">Credibility &amp; Trust First</h2>
          <p className="text-sm text-slate-500 font-medium">LankaStay connects global visitors to authentic Sri Lankan stays with security and fairness.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: "SLTDA Standards Compliant",
              desc: "Every listing matches standard tourism metrics, ensuring comfortable accommodation, clean sanitation, and reliable hosts.",
              color: "text-[#00aa6c] bg-[#e8fbf3] border border-[#bbf2dc]"
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
            <div key={i} className="group flex flex-col items-start p-6 bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-300 text-left rounded-2xl">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-6 group-hover:scale-105 transition-transform duration-300`}>
                <item.icon className="h-6 w-6" />
              </span>
              <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="bg-slate-50 border-y border-slate-200/60 py-16 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-black tracking-widest text-[#00aa6c] uppercase">Simple Workflow</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif leading-tight">
                How It Works <br />
                for Travelers
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Our secure platform allows you to book and experience authentic Sri Lankan hospitality with zero complications.
              </p>
              <div className="pt-2">
                <Link href="/auth/register" className="inline-flex items-center gap-2 text-xs font-bold text-[#00aa6c] hover:text-[#00915c] group">
                  <span>Register traveler profile</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Discover & Filter", desc: "Browse verified homestays by specific culinary or regional parameters." },
                { step: "02", title: "Reserve Safely", desc: "Confirm booking request. Your money is secured via locked escrow protection." },
                { step: "03", title: "Immerse Locally", desc: "Stay with local families, enjoy home-cooked meals, and experience Ceylon safely." }
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 border border-slate-200 shadow-sm rounded-2xl">
                  <span className="block text-2xl font-black text-[#00aa6c]/25 font-serif mb-4">{item.step}</span>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 5. Destination Quick Filters */}
      <section id="tailor-made" className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 text-left select-none scroll-mt-20">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">Curated Regional Filters</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Instantly discover homestays across popular travel spots.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Ella', label: 'Misty Mountain Retreats', img: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=600&q=80' },
            { name: 'Galle', label: 'Coast & Fort Heritage', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80' },
            { name: 'Kandy', label: 'Sacred Hill Country', img: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=600&q=80' },
            { name: 'Sigiriya', label: 'Ancient Rock Kingdom', img: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&w=600&q=80' },
          ].map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleQuickLocation(dest.name)}
              className="group relative h-40 sm:h-48 overflow-hidden shadow-sm hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00aa6c] transition-all duration-500 text-left w-full border border-slate-200 rounded-2xl"
            >
              <img src={dest.img} alt={dest.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/50 transition-colors duration-500" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="block font-black text-xl tracking-wide">{dest.name}</span>
                <span className="block text-[9px] font-bold tracking-widest text-[#00aa6c] uppercase mt-1 opacity-90">{dest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 6. TripAdvisor Style Experiences Grid */}
      <section id="tours" ref={resultsRef} className="scroll-mt-20 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 w-full text-left">

          <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">Featured Homestays</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Connect directly and support local families in rural regions.</p>
            </div>
            <button
              onClick={fetchExperiences}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all active:scale-95 disabled:opacity-50 rounded-xl"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#00aa6c] ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Sync Registry'}</span>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div className="border border-rose-200 bg-rose-50 p-10 text-center max-w-xl mx-auto shadow-sm rounded-2xl">
              <p className="text-lg text-rose-900 font-bold mb-2 font-serif">Connection Error</p>
              <p className="text-xs text-rose-700/80 mb-6 font-medium">{error}</p>
              <button onClick={fetchExperiences} className="bg-rose-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-md active:scale-95 rounded-xl">
                Try Again
              </button>
            </div>
          ) : experiences.length === 0 ? (
            <div className="border border-dashed border-slate-250 bg-white py-24 text-center max-w-3xl mx-auto shadow-sm rounded-2xl">
              <div className="inline-flex h-16 w-16 items-center justify-center bg-slate-50 text-slate-400 mb-4 rounded-xl">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-slate-900 text-lg font-bold font-serif">No homestays match the filter</h3>
              <p className="text-xs text-slate-500 mt-2 font-medium max-w-sm mx-auto">We couldn't find any listings matching your parameters. Clear options or try another region.</p>
              {(locationQuery || selectedTagIds.length > 0) && (
                <button
                  onClick={() => { setLocationQuery(''); setSelectedTagIds([]); setActiveCategory('all'); }}
                  className="mt-6 bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-[#00aa6c] transition-all shadow-md active:scale-95 rounded-xl"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {experiences.map((exp) => {
                const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
                const isFavorite = favorites.includes(exp.id);
                return (
                  <Link
                    key={exp.id}
                    href={`/experience/${exp.id}`}
                    className="group flex flex-col overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl relative"
                  >
                    {/* Visual Card Media */}
                    <div className="aspect-[4/3] w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={displayImage}
                        alt={exp.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                      />

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(e, exp.id)}
                        className="absolute right-3.5 top-3.5 z-10 flex h-8 w-8 items-center justify-center bg-white shadow-sm border border-slate-100 hover:scale-105 active:scale-95 transition-all duration-200 rounded-full"
                        aria-label="Add to favorites"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-550'}`}
                        />
                      </button>

                      {/* Top Rank Badge */}
                      <div className="absolute left-3.5 bottom-3.5 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm text-white px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide rounded-lg">
                        <MapPin className="h-3 w-3 text-[#00aa6c]" />
                        <span>{exp.location}</span>
                      </div>
                    </div>

                    {/* Stay Card Details */}
                    <div className="flex flex-1 flex-col p-5 space-y-2.5">
                      
                      {/* Host & tag meta row */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{exp.tags.length > 0 ? exp.tags[0].name : 'Homestay'}</span>
                        {exp.hostIsVerified && (
                          <span className="flex items-center gap-0.5 text-emerald-600">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00aa6c] transition-colors line-clamp-1 font-serif pr-2 leading-tight">
                        {exp.title}
                      </h3>

                      {/* TripAdvisor Green Bubble Rating */}
                      <div className="flex items-center gap-2">
                        {renderTripAdvisorBubbles(exp.averageRating)}
                        <span className="text-[11px] font-bold text-slate-700 mt-0.5">
                          {exp.averageRating > 0 ? exp.averageRating.toFixed(1) : '4.0'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">(5 reviews)</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow font-medium">
                        {exp.description}
                      </p>

                      <div className="h-[1px] bg-slate-100 w-full pt-1" />

                      {/* Host avatar and pricing row */}
                      <div className="flex items-center justify-between pt-1 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                            <span className="text-slate-800 font-bold text-xs uppercase">
                              {exp.hostName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-slate-750 truncate max-w-[100px]">
                            {exp.hostName}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-semibold mr-1">from</span>
                          <span className="text-base font-black text-[#00aa6c]">${exp.basePrice}</span>
                        </div>
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
      <section id="blog" className="bg-slate-50 border-t border-slate-200/60 py-20 select-none relative overflow-hidden text-left scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#00aa6c] uppercase tracking-widest">Traveler Stories</span>
            <h2 className="text-2.5xl font-bold font-serif tracking-tight">Voted Most Authentic Holiday Platform</h2>
            <p className="text-sm text-slate-500">Read verified reviews from adventurers who lived local.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div key={i} className="group bg-white p-6 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all duration-300 rounded-2xl">
                <div className="space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, idx) => (
                      <span key={idx} className="h-3 w-3 rounded-full bg-[#00aa6c] border border-[#00aa6c]" />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 italic">"{t.quote}"</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs">{t.author}</h5>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">{t.location}</span>
                  </div>
                  <span className="text-[9px] bg-slate-50 text-[#00aa6c] border border-slate-150 px-2 py-1 font-bold rounded-lg">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-[#FCFBF9] border-t border-slate-200 py-20 text-left select-none scroll-mt-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-[#00aa6c] uppercase tracking-widest">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight">Got Questions? We Have Answers.</h2>
            <p className="text-xs text-slate-500 font-medium">Learn more about the trust standards and operation of LankaStay.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is LankaStay and how is it different?",
                a: "LankaStay is a verified heritage homestay registry that connects global travelers directly with certified local Sri Lankan families. Unlike standard hotels, we focus on cultural immersion, home-cooked culinary matchmaking, and protecting local economies."
              },
              {
                q: "How are hosts verified and cleared?",
                a: "Every host on LankaStay undergoes official checks. This includes SLTDA standard clearance, local Grama Niladhari residency confirmation, and a verify check of official police records to ensure guest safety and local credibility."
              },
              {
                q: "How does the escrow payment system protect me?",
                a: "When you book a homestay, your money is securely locked in our escrow protection vault. The booking fee is only released directly to the local host's account after check-out, ensuring peace of mind for travelers."
              },
              {
                q: "Are home-cooked meals included in my booking?",
                a: "Many of our verified hosts offer breakfast or traditional culinary experiences. You can search and filter listings by specific culinary tags like 'Traditional Kitchen', 'Tea Estate Brews', or 'Local Curries'."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="text-[#00aa6c] font-serif">Q.</span> {faq.q}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium pl-4">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Action Button to Scroll Top */}
      <button
        onClick={handleScrollTop}
        className={`fixed bottom-8 right-6 z-40 flex items-center justify-center h-12 w-12 bg-slate-900 text-white shadow-lg hover:bg-[#00aa6c] hover:scale-105 active:scale-95 transition-all duration-300 rounded-xl ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        aria-label="Scroll to top"
      >
        <ChevronRight className="h-5 w-5 -rotate-90" />
      </button>
    </div>
  );
}