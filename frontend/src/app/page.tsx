'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '../lib/apiClient';
import { Search, MapPin, Star, Sparkles, Filter, Loader2, RefreshCw } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Search Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-teal-50/30 to-slate-50/50 py-24 border-b border-teal-100/20">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/10 px-3 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200/50 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Discover local lifestyles & cultural registries</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Authentic Sri Lankan <span className="text-teal-600">Homestays</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-slate-600">
            Connect with verified local hosts, share home-cooked traditional meals, and explore the island's heritage through matchmaking travel constraints.
          </p>

          {/* Combined Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mt-10 max-w-3xl rounded-2xl bg-white p-2 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-2">
            <div className="flex flex-1 items-center gap-2 px-3 border-b md:border-b-0 md:border-r border-slate-100 py-2.5">
              <MapPin className="h-5 w-5 text-teal-550 shrink-0" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Where in Sri Lanka? (e.g. Kandy, Ella, Galle)"
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 active:scale-95 transition-all"
            >
              <Search className="h-4 w-4" />
              <span>Search Registry</span>
            </button>
          </form>

          {/* Dietary & Cultural Tag Filters */}
          {tags.length > 0 && (
            <div className="mx-auto mt-8 max-w-4xl">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-450 mb-3">
                <Filter className="h-3.5 w-3.5" />
                <span>DIETARY &amp; CULTURAL FILTER CONSTRAINTS</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-600'
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
        <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Explore Available Stays
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked homestays matching your preference profiles.
            </p>
          </div>
          <button
            onClick={fetchExperiences}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Sync Listings</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            <span className="text-sm text-slate-500 mt-3 font-medium">
              Loading Sri Lankan registries...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center">
            <p className="text-sm text-rose-800 font-semibold">Error Loading Listings</p>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
            <button
              onClick={fetchExperiences}
              className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : experiences.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center bg-white">
            <p className="text-slate-500 text-sm font-medium">
              No experiences found matching these search criteria.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try removing filter filters or search for another location in Sri Lanka.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {experiences.map((exp) => {
              const displayImage = exp.imageUrl || getFallbackImage(exp.location, exp.title);
              return (
                <div
                  key={exp.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Grid */}
                  <div className="aspect-[4/3] w-full bg-slate-100 relative flex items-center justify-center overflow-hidden">
                    <img 
                      src={displayImage} 
                      alt={exp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent"></div>
                    
                    {/* Rating Badge */}
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{exp.averageRating > 0 ? exp.averageRating.toFixed(1) : 'New'}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 text-left">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <MapPin className="h-3.5 w-3.5 text-teal-650 shrink-0" />
                      <span>{exp.location}</span>
                    </div>
                    
                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      <Link href={`/experience/${exp.id}`}>
                        <span className="absolute inset-0"></span>
                        {exp.title}
                      </Link>
                    </h3>
                    
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed flex-grow">
                      {exp.description}
                    </p>

                    {/* Horizontal divider */}
                    <div className="my-4 h-[1px] bg-slate-100"></div>

                    {/* Matching Tags */}
                    {exp.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {exp.tags.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100/50"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-[9px] font-semibold text-slate-400">HOSTED BY</span>
                        <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">
                          {exp.hostName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-teal-600">
                          ${exp.basePrice}
                        </span>
                        <span className="text-[10px] text-slate-400"> / guest</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
