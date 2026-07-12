'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { Calendar, User, Clock, Loader2, FileCheck, Star, AlertCircle, PlusCircle, Smile } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  amount: number;
  status: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
}

interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  experienceLocation: string;
  guestCount: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: number; // 1 = Pending, 2 = Confirmed, 3 = Active, 4 = Completed, 5 = Cancelled
  createdAt: string;
  payment: Payment | null;
  review: Review | null;
}

export default function TouristDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Submitting state
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Tourist')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const loadBookings = async () => {
    try {
      const data = await apiClient.get<Booking[]>('/bookings');
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Tourist') {
      loadBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, { status: 5 }); // 5 = Cancelled
      await loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    setReviewLoading(true);
    setReviewError(null);
    try {
      await apiClient.post('/bookings/review', {
        bookingId: selectedBookingId,
        rating,
        comment,
      });
      setSelectedBookingId(null);
      setComment('');
      setRating(5);
      await loadBookings();
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Pending Host Approval';
      case 2: return 'Confirmed';
      case 3: return 'Active (Checked-in)';
      case 4: return 'Completed';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1: return 'bg-amber-50 text-amber-800 border-amber-200';
      case 2: return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 3: return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 4: return 'bg-sky-50 text-sky-800 border-sky-200';
      case 5: return 'bg-rose-50 text-rose-800 border-rose-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500 mt-2 font-medium">Loading tourist dashboard...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          My Travel Bookings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track upcoming local homestays and submit cultural reviews.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Clock className="mx-auto h-12 w-12 text-slate-350" />
          <p className="mt-4 text-sm font-semibold text-slate-700">No homestays booked yet</p>
          <p className="text-xs text-slate-500 mt-1">Start browsing our verified registries to book your stay!</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition-colors"
          >
            Explore Experiences
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3 flex-grow text-left">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Booked on {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900">
                  {booking.experienceTitle}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">📅 {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5">👥 {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}</span>
                  <span className="flex items-center gap-1.5">📍 {booking.experienceLocation}</span>
                  <span className="flex items-center gap-1.5 font-semibold text-teal-600">💵 Total Price: ${booking.totalPrice}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-center items-end shrink-0 gap-3">
                {(booking.status === 1 || booking.status === 2) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="rounded-xl border border-rose-200 hover:bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-all w-full md:w-auto"
                  >
                    Cancel Booking
                  </button>
                )}

                {/* Reviews controls */}
                {booking.status === 4 && (
                  <>
                    {!booking.review ? (
                      <button
                        onClick={() => setSelectedBookingId(booking.id)}
                        className="rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-500/10 transition-all w-full md:w-auto flex items-center justify-center gap-1.5"
                      >
                        <Smile className="h-4 w-4" />
                        <span>Leave a Review</span>
                      </button>
                    ) : (
                      <div className="rounded-xl bg-slate-50 border border-slate-200/50 p-3 text-xs w-full text-left">
                        <div className="flex items-center gap-1 text-amber-500 font-bold mb-1">
                          {Array.from({ length: booking.review.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                          <span className="ml-1 text-slate-700">({booking.review.rating}/5)</span>
                        </div>
                        <p className="text-slate-500 italic">"{booking.review.comment}"</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog modal */}
      {selectedBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up text-left">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Write Review</h3>
            <p className="text-xs text-slate-500 mb-4">Share your feedback about the homestay and local hosts.</p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {reviewError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">RATING STARS</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform active:scale-90"
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  COMMENT DETAIL
                </label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Tell us about the hospitality, local food, and constraints matching..."
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookingId(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex justify-center items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-teal-500"
                >
                  {reviewLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  <span>Submit Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
