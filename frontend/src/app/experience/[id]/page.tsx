'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { MapPin, Star, User, Calendar, Users, Loader2, Sparkles, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  description: string;
}

interface PeakSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  seasonalMultiplier: number;
}

interface Review {
  id: string;
  bookingId: string;
  touristName: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  peakSeasons: PeakSeason[];
  averageRating: number;
  imageUrl?: string;
}

export default function ExperienceDetailsPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const router = useRouter();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  
  // Submit state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetails() {
      try {
        const expData = await apiClient.get<Experience>(`/experiences/${id}`);
        setExperience(expData);
        
        // Fetch reviews associated with this experience
        // We will mock/filter reviews from experience details directly, or we can fetch reviews
        // (Our ExperienceDto mapped bookings -> reviews directly in application layer, let's map them from there)
        // Wait, let's pull reviews from the experiences bookings details or reviews endpoints if needed.
        // In ExperienceDto, we have average rating. Let's see: we can mock review values or get them if we had a reviews endpoint,
        // but for now, we will render reviews list if experiences model contains it.
        // Let's create mock reviews if empty, or map them if available.
      } catch (err: any) {
        setError(err.message || 'Experience not found.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  // Recalculate price when dates or guests change
  const handleCalculatePrice = useCallback(async () => {
    if (!startDate || !endDate || guestCount < 1) {
      setCalculatedPrice(null);
      return;
    }
    setCalculating(true);
    try {
      const response = await apiClient.get<{ totalPrice: number }>('/bookings/calculate-price', {
        params: {
          experienceId: id,
          startDate,
          endDate,
          guestCount,
        },
      });
      setCalculatedPrice(response.totalPrice);
    } catch (e) {
      console.error('Failed to calculate price', e);
    } finally {
      setCalculating(false);
    }
  }, [id, startDate, endDate, guestCount]);

  useEffect(() => {
    handleCalculatePrice();
  }, [handleCalculatePrice]);

  const handleBookExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      router.push(`/auth/login?redirect=/experience/${id}`);
      return;
    }

    if (user.role !== 'Tourist') {
      setBookingError('Only Tourist profiles are allowed to reserve experiences.');
      return;
    }

    setBookingLoading(true);
    try {
      await apiClient.post('/bookings', {
        experienceId: id,
        guestCount,
        startDate,
        endDate,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/tourist');
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500 mt-2 font-medium">Fetching Ceylon experience...</span>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="mx-auto max-w-xl text-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Experience Details</h2>
        <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
          {error || 'The requested experience could not be loaded.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-teal-600" /> {experience.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {experience.averageRating > 0 ? `${experience.averageRating.toFixed(1)} rating` : 'New Listing'}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-3">
              {experience.title}
            </h1>

            {/* Tags */}
            {experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {experience.tags.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/20 dark:text-teal-400"
                    title={t.description}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image Showcase */}
          <div className="aspect-[16/9] w-full rounded-2xl bg-slate-100 border border-slate-200/50 relative flex items-center justify-center overflow-hidden">
            <img 
              src={experience.imageUrl || (
                experience.location.toLowerCase().includes('ella') || experience.title.toLowerCase().includes('ella')
                  ? 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=1200&q=80'
                  : experience.location.toLowerCase().includes('galle') || experience.title.toLowerCase().includes('galle')
                    ? 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=1200&q=80'
                    : experience.location.toLowerCase().includes('kandy') || experience.title.toLowerCase().includes('kandy')
                      ? 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1200&q=80'
                      : experience.location.toLowerCase().includes('sigiriya') || experience.title.toLowerCase().includes('sigiriya')
                        ? 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80'
                        : 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=1200&q=80'
              )} 
              alt={experience.title} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 dark:bg-slate-950 dark:border-slate-800/50">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About this experience</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {experience.description}
            </p>
          </div>

          {/* Host Bio details */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200/60 p-6 dark:bg-slate-900 dark:border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-400">
                <User className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">YOUR LOCAL HOST</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{experience.hostName}</p>
              </div>
            </div>

            {experience.hostIsVerified ? (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Local Host</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Verification Pending</span>
              </div>
            )}
          </div>

          {/* Peak Seasons calendar reference */}
          {experience.peakSeasons.length > 0 && (
            <div className="bg-amber-50/20 rounded-2xl border border-amber-200/30 p-5 dark:bg-amber-950/10 dark:border-amber-950/20">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2">Host Seasonal Pricing Alert</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                This experience is located in an area with peak seasons. Booking dates overlapping with the periods below will have multipliers applied:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {experience.peakSeasons.map((ps) => (
                  <li key={ps.id} className="flex justify-between font-medium">
                    <span>📅 {ps.name} ({new Date(ps.startDate).toLocaleDateString()} - {new Date(ps.endDate).toLocaleDateString()})</span>
                    <span className="text-teal-600 dark:text-teal-400">{ps.seasonalMultiplier}x rate</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Widget Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl dark:border-slate-800/80 dark:bg-slate-950">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">${experience.basePrice}</span>
                <span className="text-xs text-slate-500"> / guest / night</span>
              </div>
            </div>

            <form onSubmit={handleBookExperience} className="space-y-4">
              {bookingSuccess ? (
                <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/20">
                  <div className="flex justify-center mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white animate-scale-up">
                      <Check className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Reservation Successful!</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Redirecting to your dashboard...</p>
                </div>
              ) : (
                <>
                  {bookingError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Check-In Date
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Check-Out Date
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Calendar className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Guests count
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Calculated Price Display */}
                  {calculatedPrice !== null && (
                    <div className="rounded-xl bg-slate-50 border border-slate-200/50 p-4 dark:bg-slate-900 dark:border-slate-850">
                      <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                        <span>Dynamic calculation:</span>
                        {calculating && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
                      </div>
                      <div className="flex justify-between items-baseline font-bold">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Total Price</span>
                        <span className="text-xl text-teal-600 dark:text-teal-400">${calculatedPrice}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || calculating}
                    className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {bookingLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </span>
                    ) : (
                      <span>{user ? 'Book Experience' : 'Sign In to Book'}</span>
                    )}
                  </button>

                  {!user && (
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                      Authentication is required to reserve homestays.
                    </p>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
