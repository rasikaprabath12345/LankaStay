'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { apiClient } from '../../../lib/apiClient';
import { 
  DollarSign, Home, PlusCircle, Check, X, ShieldAlert, ShieldCheck, CalendarRange, Users, Loader2, Sparkles, AlertCircle 
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
}

interface Payment {
  id: string;
  amount: number;
  hostEarnings: number;
  platformCommission: number;
  status: number;
}

interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  touristName: string;
  touristEmail: string;
  guestCount: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: number;
  createdAt: string;
  payment: Payment | null;
}

interface Experience {
  id: string;
  title: string;
  basePrice: number;
  location: string;
  isActive: boolean;
  tags: Tag[];
  peakSeasons: any[];
  imageUrl?: string;
}

export default function HostDashboard() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Experience Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [imageUrl4, setImageUrl4] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Seasonal Pricing Form State
  const [selectedExpIdForSeason, setSelectedExpIdForSeason] = useState<string | null>(null);
  const [seasonName, setSeasonName] = useState('');
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');
  const [seasonMultiplier, setSeasonMultiplier] = useState('1.5');
  const [seasonLoading, setSeasonLoading] = useState(false);
  const [seasonError, setSeasonError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/dashboard/host');
      } else if (user.role !== 'Host') {
        router.push(user.role === 'Admin' ? '/dashboard/admin' : '/dashboard/tourist');
      }
    }
  }, [user, authLoading, router]);

  const loadHostData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sync verification states
      await refreshUser();
      
      // Get all tags
      const tagsData = await apiClient.get<Tag[]>('/experiences/tags');
      setTags(tagsData);

      // Get bookings for host
      const bookingsData = await apiClient.get<Booking[]>('/bookings');
      setBookings(bookingsData);

      // Fetch experiences
      const expData = await apiClient.get<Experience[]>('/experiences');
      // Filter experiences hosted by this specific user
      if (user) {
        setExperiences(expData.filter((e: any) => e.hostId === user.id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load host dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Host') {
      loadHostData();
    }
  }, [user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageConvert(file, index);
    }
  };

  const handleImageConvert = (file: File, index: number) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (index === 1) setImageUrl(base64String);
      if (index === 2) setImageUrl2(base64String);
      if (index === 3) setImageUrl3(base64String);
      if (index === 4) setImageUrl4(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateLoading(true);

    try {
      const combinedImages = [imageUrl, imageUrl2, imageUrl3, imageUrl4]
        .map(url => url.trim())
        .filter(url => url !== '')
        .join('|');

      await apiClient.post('/experiences', {
        title,
        description,
        basePrice: Number(basePrice),
        location,
        tagIds: selectedTagIds,
        imageUrl: combinedImages,
      });

      // Reset
      setTitle('');
      setDescription('');
      setBasePrice('');
      setLocation('');
      setImageUrl('');
      setImageUrl2('');
      setImageUrl3('');
      setImageUrl4('');
      setSelectedTagIds([]);
      setShowAddForm(false);
      
      await loadHostData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create experience.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddPeakSeason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpIdForSeason) return;

    setSeasonError(null);
    setSeasonLoading(true);
    try {
      await apiClient.post(`/experiences/${selectedExpIdForSeason}/peak-season`, {
        name: seasonName,
        startDate: seasonStart,
        endDate: seasonEnd,
        seasonalMultiplier: Number(seasonMultiplier),
      });

      setSelectedExpIdForSeason(null);
      setSeasonName('');
      setSeasonStart('');
      setSeasonEnd('');
      setSeasonMultiplier('1.5');
      await loadHostData();
    } catch (err: any) {
      setSeasonError(err.message || 'Failed to configure peak season.');
    } finally {
      setSeasonLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: number) => {
    try {
      await apiClient.put(`/bookings/${bookingId}/status`, { status });
      await loadHostData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const renderImageSlot = (index: number, label: string, value: string, setValue: (val: string) => void) => {
    return (
      <div className="flex flex-col space-y-2 border border-slate-200/60 p-4 rounded-2xl bg-slate-50 relative group/slot text-left">
        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        
        {value ? (
          <div className="relative aspect-[4/3] w-full bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <img src={value} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/65 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleImageConvert(file, index);
            }}
            className="border-2 border-dashed border-slate-250 hover:border-teal-500 rounded-xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all bg-white relative min-h-[140px]"
          >
            <Home className="h-6 w-6 text-slate-350 mb-2 group-hover/slot:text-teal-650 transition-colors" />
            <span className="text-[11px] font-bold text-slate-700">Drag & Drop Image Here</span>
            <span className="text-[9px] text-slate-400 font-semibold mt-1">or click to browse file</span>
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        )}

        <input
          type="url"
          value={value.startsWith('data:image/') ? '' : value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Or paste image URL here..."
          className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 focus:border-teal-500 focus:outline-none"
        />
      </div>
    );
  };

  // Calculations
  const completedBookings = bookings.filter((b) => b.status === 4); // Completed
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.payment?.hostEarnings || 0), 0);

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Pending Approval';
      case 2: return 'Confirmed';
      case 3: return 'Active';
      case 4: return 'Completed';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
        <span className="text-sm text-slate-500 mt-2 font-medium">Loading host registry portal...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Host Management Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish homestays, manage pricing structures, and accept tourist reservations.
          </p>
        </div>

        {/* Verification Alert Badge */}
        {user?.isVerified ? (
          <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200/50 self-start md:self-auto">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Registry Profile</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 border border-amber-200/50 self-start md:self-auto">
            <ShieldAlert className="h-4 w-4" />
            <span>Verification Review Pending</span>
          </div>
        )}
      </div>

      {/* Strict Host Verification block */}
      {!user?.isVerified && (
        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/30 p-6 mb-8">
          <div className="flex gap-3 text-amber-800">
            <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">Listing Restriction Active</h3>
              <p className="text-xs mt-1 leading-relaxed text-slate-600">
                Your account is currently in pending state. Admin is reviewing your Grama Niladhari and Police Clearance documents. You cannot publish homestays or host guests until your account has been verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview Grid */}
      {user?.isVerified && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs text-slate-400 font-semibold">TOTAL EARNINGS (90%)</span>
                <p className="text-2xl font-black text-slate-900">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Home className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs text-slate-400 font-semibold">MY HOMESTAYS</span>
                <p className="text-2xl font-black text-slate-900">{experiences.length} stays</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <span className="text-xs text-slate-400 font-semibold">TOTAL RESERVATIONS</span>
                <p className="text-2xl font-black text-slate-900">{bookings.length} reservations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      {user?.isVerified && (
        <div className="space-y-12">
          {/* Incoming Bookings Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Guest Reservations</h2>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No reservations received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-2">Homestay</th>
                      <th className="py-3 px-2">Guest Detail</th>
                      <th className="py-3 px-2">Dates</th>
                      <th className="py-3 px-2">Earnings</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-2 font-bold text-slate-900">{booking.experienceTitle}</td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">{booking.touristName}</span>
                            <span className="text-[10px] text-slate-400">{booking.touristEmail}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-xs">
                          <div className="flex flex-col">
                            <span>📅 {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                            <span className="text-slate-400 mt-0.5">👥 {booking.guestCount} guests</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 font-semibold text-emerald-600">
                          ${(booking.totalPrice * 0.90).toFixed(2)}
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            booking.status === 1 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            booking.status === 2 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            booking.status === 3 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            booking.status === 4 ? 'bg-sky-50 text-sky-800 border-sky-200' :
                            'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-1.5">
                            {booking.status === 1 && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 2)} // Approve -> Confirmed
                                  className="rounded-lg bg-emerald-600 hover:bg-emerald-600 p-1.5 text-white flex items-center justify-center"
                                  title="Approve Booking"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, 5)} // Reject -> Cancelled
                                  className="rounded-lg bg-rose-600 hover:bg-rose-600 p-1.5 text-white flex items-center justify-center"
                                  title="Reject Booking"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            
                            {booking.status === 2 && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 3)} // Confirmed -> Active (check-in)
                                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-xs font-semibold text-white"
                              >
                                Check-In
                              </button>
                            )}

                            {booking.status === 3 && (
                              <button
                                onClick={() => handleUpdateStatus(booking.id, 4)} // Active -> Completed (payout trigger)
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white"
                              >
                                Complete Stay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Manage Stays and Peak season config */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">My Listing Registries</h2>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-teal-500 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Homestay</span>
              </button>
            </div>

            {/* Create Homestay Form Panel */}
            {showAddForm && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl animate-scale-up">
                <h3 className="text-base font-bold text-slate-900 mb-4">New Homestay</h3>
                <form onSubmit={handleCreateExperience} className="space-y-4">
                  {createError && (
                    <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                      <AlertCircle className="h-4 w-4" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Homestay Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Traditional Ella Mountain Retreat"
                        className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600">Base Price (USD / night)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        placeholder="50"
                        className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Location (City/District)</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ella, Badulla District"
                      className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-3">Homestay Gallery Images (Up to 4)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderImageSlot(1, "Image 1 (Main Cover)", imageUrl, setImageUrl)}
                      {renderImageSlot(2, "Image 2 (Gallery)", imageUrl2, setImageUrl2)}
                      {renderImageSlot(3, "Image 3 (Gallery)", imageUrl3, setImageUrl3)}
                      {renderImageSlot(4, "Image 4 (Gallery)", imageUrl4, setImageUrl4)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the homestay, proximity to sights, cultural food experiences, and cultural environment..."
                      className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Checkbox tags */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-600 mb-2">Cultural &amp; Dietary Tags Match</span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const isSelected = selectedTagIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleTagToggle(t.id)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'border-teal-600 bg-teal-550/20 text-teal-700'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500"
                    >
                      {createLoading ? 'Publishing...' : 'Publish'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {experiences.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No active homestays listed yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    {/* Stay Image */}
                    <div className="aspect-[16/9] w-full bg-slate-100 relative">
                      <img 
                        src={exp.imageUrl || (
                          exp.location.toLowerCase().includes('ella') || exp.title.toLowerCase().includes('ella')
                            ? 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80'
                            : exp.location.toLowerCase().includes('galle') || exp.title.toLowerCase().includes('galle')
                              ? 'https://images.unsplash.com/photo-1588598126483-24765d778d91?auto=format&fit=crop&w=800&q=80'
                              : exp.location.toLowerCase().includes('kandy') || exp.title.toLowerCase().includes('kandy')
                                ? 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=800&q=80'
                                : exp.location.toLowerCase().includes('sigiriya') || exp.title.toLowerCase().includes('sigiriya')
                                  ? 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80'
                                  : 'https://images.unsplash.com/photo-1563189333-c174cae6878b?auto=format&fit=crop&w=800&q=80'
                        )} 
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-5 flex-grow">
                      <h4 className="font-bold text-slate-900 text-base">{exp.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">📍 {exp.location}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {exp.tags.map((t) => (
                          <span key={t.id} className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-100/30">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 mt-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Base Price: <strong className="text-teal-600">${exp.basePrice}</strong>
                      </span>

                      <button
                        onClick={() => setSelectedExpIdForSeason(exp.id)}
                        className="rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50/50 px-3 py-1.5 text-xs font-semibold"
                      >
                        Set Peak Season Pricing
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set Peak Season Dialog Modal */}
      {selectedExpIdForSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up text-left">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Configure Peak Pricing</h3>
            <p className="text-xs text-slate-500 mb-4">Set date intervals when the baseline rates undergo seasonal multipliers adjustments.</p>

            <form onSubmit={handleAddPeakSeason} className="space-y-4">
              {seasonError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>{seasonError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Season Name (e.g. Kandy Perahera)</label>
                <input
                  type="text"
                  required
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  placeholder="Kandy Esala Perahera"
                  className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={seasonStart}
                    onChange={(e) => setSeasonStart(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={seasonEnd}
                    onChange={(e) => setSeasonEnd(e.target.value)}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Seasonal Multiplier (e.g. 1.5 = 1.5x price)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={seasonMultiplier}
                  onChange={(e) => setSeasonMultiplier(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExpIdForSeason(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={seasonLoading}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-teal-500"
                >
                  {seasonLoading ? 'Saving...' : 'Add Season'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
