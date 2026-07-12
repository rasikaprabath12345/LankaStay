'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { 
  MapPin, 
  Star, 
  User, 
  Calendar, 
  Users, 
  Loader2, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Heart, 
  Pencil, 
  ChevronRight, 
  Clock, 
  ArrowLeft 
} from 'lucide-react';

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

  // New States for TripAdvisor UI
  const [isSaved, setIsSaved] = useState(false);
  const [similarStays, setSimilarStays] = useState<Experience[]>([]);

  useEffect(() => {
    async function loadDetails() {
      try {
        const expData = await apiClient.get<Experience>(`/experiences/${id}`);
        setExperience(expData);
      } catch (err: any) {
        setError(err.message || 'Experience not found.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [id]);

  useEffect(() => {
    if (!experience) return;
    const currentExp = experience;
    async function loadSimilar() {
      try {
        const data = await apiClient.get<Experience[]>('/experiences');
        const filtered = data.filter(e => e.id !== currentExp.id);
        const matched = filtered.filter(e => e.location.toLowerCase() === currentExp.location.toLowerCase());
        setSimilarStays(matched.length > 0 ? matched.slice(0, 3) : filtered.slice(0, 3));
      } catch (err) {
        console.error('Failed to load similar stays', err);
      }
    }
    loadSimilar();
  }, [experience]);

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
      // Create the booking entry in database
      await apiClient.post('/bookings', {
        experienceId: id,
        guestCount,
        startDate,
        endDate,
      });

      // Prepare custom booking message for host
      const message = `Hi ${experience?.hostName || 'Host'}, I have just submitted a reservation request for your homestay "${experience?.title || 'Stay'}" on LankaStay!

Reservation Details:
- Check-in: ${startDate}
- Check-out: ${endDate}
- Guests: ${guestCount}
${calculatedPrice ? `- Total Price: $${calculatedPrice}\n` : ''}
Please check your LankaStay Dashboard and confirm my request on WhatsApp!`;

      // Open WhatsApp chat
      const whatsappUrl = `https://wa.me/94771234567?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      setBookingSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/tourist');
      }, 3000);
    } catch (err: any) {
      setBookingError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderTripAdvisorBubbles = (rating: number) => {
    const roundedRating = Math.round(rating || 4); // Fallback rating to 4 bubbles
    return (
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 bubbles`}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const isFilled = idx < roundedRating;
          return (
            <span 
              key={idx} 
              className={`h-3.5 w-3.5 rounded-full border border-[#00aa6c] ${
                isFilled ? 'bg-[#00aa6c]' : 'bg-white'
              }`} 
            />
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-teal-650" />
        <span className="text-sm text-slate-500 mt-2 font-medium">Fetching Ceylon experience...</span>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="mx-auto max-w-xl text-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-900">Experience Details</h2>
        <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {error || 'The requested experience could not be loaded.'}
        </div>
      </div>
    );
  }

  const displayReviews = reviews.length > 0 ? reviews : [
    {
      id: '1',
      bookingId: 'mock1',
      touristName: 'Elena Rostova',
      rating: 5,
      comment: 'Absolutely spectacular village tour! The traditional clay-pot lunch cooked by Mrs. Jayasinghe was the highlight of our entire trip. The bullock cart ride felt very nostalgic.',
      createdAt: 'June 2026'
    },
    {
      id: '2',
      bookingId: 'mock2',
      touristName: 'Jonas S.',
      rating: 4,
      comment: 'Very authentic and educational. Sigiriya village walk is scenic. Vetted host check gave us peace of mind. Strongly recommend the cooking class!',
      createdAt: 'May 2026'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FCFBF9] text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-teal-100 selection:text-teal-900 animate-fade-in">
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Breadcrumbs */}
        <nav className="text-xs font-semibold text-slate-500 mb-4 text-left flex flex-wrap items-center gap-1">
          <Link href="/" className="hover:text-teal-700 transition-colors">Asia</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/" className="hover:text-teal-700 transition-colors">Sri Lanka</Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-700">{experience.location}</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{experience.title}</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6 text-left">
          <Link href="/#tours" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>See all stays &amp; things to do</span>
          </Link>
        </div>

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div className="text-left space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {experience.title}
            </h1>
            
            {/* TripAdvisor rating & meta info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                {renderTripAdvisorBubbles(experience.averageRating)}
                <span className="text-slate-800 font-bold">
                  {experience.averageRating > 0 ? experience.averageRating.toFixed(1) : '4.0'}
                </span>
                <span className="text-slate-400 font-normal">({displayReviews.length} reviews)</span>
              </div>
              <span>•</span>
              <span className="hover:underline cursor-pointer">#14 of 43 Stays in {experience.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-teal-650 shrink-0" /> {experience.location}</span>
            </div>
            
            {/* Quick Operational Info */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-extrabold uppercase text-[10px]">Open Now</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> 7:30 AM - 5:30 PM</span>
            </div>
          </div>

          {/* Save / Review actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className="inline-flex items-center gap-2 border border-slate-200 bg-white px-5 py-2.5 hover:bg-slate-50 active:scale-95 rounded-full font-bold text-xs text-slate-800 transition-all shadow-sm select-none"
            >
              <Heart className={`h-4.5 w-4.5 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button className="inline-flex items-center gap-2 border border-slate-200 bg-white px-5 py-2.5 hover:bg-slate-50 active:scale-95 rounded-full font-bold text-xs text-slate-800 transition-all shadow-sm select-none">
              <Pencil className="h-4.5 w-4.5 text-slate-500" />
              <span>Review</span>
            </button>
          </div>
        </div>

        {/* 4-Image Collage Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 rounded-3xl overflow-hidden w-full shadow-md mb-10">
          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative group">
            <img 
              src={experience.imageUrl || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80'} 
              alt={experience.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1616091216791-a5360b5f625c?auto=format&fit=crop&w=800&q=80" 
              alt="Traditional Ceylon Curry" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80" 
              alt="Rural Sri Lankan Walk" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80" 
              alt="Coastal Heritage Stays" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>

        {/* Details and Sidebar Grid */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-3 items-start">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-10 text-left">
            
            {/* About Stays */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.005)]">
              <h2 className="text-xl font-bold text-slate-900 mb-4 font-serif">About this Experience</h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                {experience.description}
              </p>

              {experience.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-50">
                  {experience.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-xl bg-teal-50 border border-teal-100/50 px-4 py-2 text-xs font-bold text-teal-800"
                      title={t.description}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Local Host Profile details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl bg-white border border-slate-100 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.005)]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100/50 text-teal-700 shrink-0 font-bold text-xl uppercase">
                  {experience.hostName.charAt(0)}
                </div>
                <div className="text-left space-y-1">
                  <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Your Local Host</span>
                  <h3 className="text-lg font-bold text-slate-900">{experience.hostName}</h3>
                </div>
              </div>

              {experience.hostIsVerified ? (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100/50 px-4 py-2.5 text-xs font-bold text-emerald-800 shrink-0 self-start sm:self-auto">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>SLTDA &amp; GN Verified Host</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100/50 px-4 py-2.5 text-xs font-bold text-amber-800 shrink-0 self-start sm:self-auto">
                  <AlertTriangle className="h-4.5 w-4.5" />
                  <span>Vetting Verification Pending</span>
                </div>
              )}
            </div>

            {/* Peak Season Information */}
            {experience.peakSeasons.length > 0 && (
              <div className="bg-amber-50/20 rounded-3xl border border-amber-200/20 p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-700" />
                  <h3 className="text-base font-bold text-amber-900">Seasonal Pricing Reference</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  This location matches tourist seasonality parameters. Rates overlapping with the following peak periods are dynamically calculated with seasonal multipliers:
                </p>
                <div className="space-y-2.5 pt-2">
                  {experience.peakSeasons.map((ps) => (
                    <div key={ps.id} className="flex justify-between items-center bg-white/70 border border-amber-200/20 p-4 rounded-2xl text-xs font-bold text-slate-800">
                      <span>📅 {ps.name} ({new Date(ps.startDate).toLocaleDateString()} - {new Date(ps.endDate).toLocaleDateString()})</span>
                      <span className="text-teal-700 bg-teal-55 px-3 py-1 rounded-xl">{ps.seasonalMultiplier}x seasonal rate</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TripAdvisor Reviews Section */}
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.005)] space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="text-xl font-bold text-slate-900 font-serif">Traveler Reviews</h3>
                <span className="text-xs font-bold text-teal-700 hover:underline cursor-pointer">Write a review</span>
              </div>

              <div className="space-y-6">
                {displayReviews.map((rev) => (
                  <div key={rev.id} className="space-y-3 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-sm text-slate-900">{rev.touristName}</h4>
                        <div className="flex items-center gap-2">
                          {renderTripAdvisorBubbles(rev.rating)}
                          <span className="text-[10px] text-slate-400 font-semibold">{rev.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Checkout Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl space-y-6">
              <div>
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reservation Rate</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">${experience.basePrice}</span>
                  <span className="text-xs text-slate-500 font-bold">/ guest</span>
                </div>
              </div>

              {/* Escrow note */}
              <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl text-left">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-none">
                  <span className="block text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">Escrow Protected</span>
                  <span className="block text-[9.5px] text-slate-500 font-semibold">Your funds are locked safely until check-out.</span>
                </div>
              </div>

              <form onSubmit={handleBookExperience} className="space-y-4">
                {bookingSuccess ? (
                  <div className="rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-100/50">
                    <div className="flex justify-center mb-2">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white animate-scale-up">
                        <Check className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="text-sm font-bold text-emerald-800">Booking Successful!</p>
                    <p className="text-xs text-emerald-600 mt-1">Redirecting to tourist dashboard...</p>
                  </div>
                ) : (
                  <>
                    {bookingError && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 font-medium">
                        <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Check-In Date
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Check-Out Date
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Guests count
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <Users className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          required
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3.5 text-sm font-bold text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Calculated Price Display */}
                    {calculatedPrice !== null && (
                      <div className="rounded-2xl bg-slate-50 border border-slate-200/50 p-4 animate-fade-in mt-4">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">
                          <span>Total Calculation</span>
                          {calculating && <Loader2 className="h-3 w-3 animate-spin text-teal-650" />}
                        </div>
                        <div className="flex justify-between items-baseline font-black">
                          <span className="text-xs text-slate-650">Total Price</span>
                          <span className="text-2xl text-teal-705">${calculatedPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading || calculating}
                      className="w-full rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white py-3.5 text-sm font-black uppercase tracking-wider shadow-md hover:shadow-[#25D366]/10 active:scale-95 transition-all disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Connecting to Host...</span>
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          <span>{user ? 'Book via WhatsApp' : 'Sign In to Book'}</span>
                        </>
                      )}
                    </button>

                    {!user && (
                      <p className="text-[10px] text-center text-slate-400 mt-2.5 font-semibold">
                        Authentication is required to reserve experiences.
                      </p>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>

        </div>

        {/* Similar Stays Carousel */}
        {similarStays.length > 0 && (
          <div className="mt-20 border-t border-slate-100 pt-16 text-left">
            <h3 className="text-2xl font-bold font-serif text-slate-900 mb-10">Similar Experiences</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarStays.map((stay) => {
                const displayImg = stay.imageUrl || 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80';
                return (
                  <Link 
                    key={stay.id} 
                    href={`/experience/${stay.id}`}
                    className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.005)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 transition-all duration-500"
                  >
                    <div className="aspect-[1.3] w-full bg-slate-55 relative overflow-hidden">
                      <img src={displayImg} alt={stay.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-50 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        {renderTripAdvisorBubbles(stay.averageRating)}
                        <span>{stay.averageRating > 0 ? stay.averageRating.toFixed(1) : '4.0'}</span>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-sm text-white px-3.5 py-1.5 border border-slate-800 rounded-xl flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-teal-400" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">{stay.location}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <h4 className="font-bold text-lg font-serif text-slate-900 line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                        {stay.title}
                      </h4>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                        <span className="text-xs text-slate-400 font-semibold">Price per guest</span>
                        <span className="text-lg font-black text-teal-800">${stay.basePrice}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
