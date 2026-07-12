'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Admin':
        return '/dashboard/admin';
      case 'Host':
        return '/dashboard/host';
      case 'Tourist':
      default:
        return '/dashboard/tourist';
    }
  };

  return (
    <nav className={`z-50 w-full transition-all duration-300 ${
      isHome 
        ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent border-b border-white/10 text-white' 
        : 'sticky top-0 border-b border-slate-200 bg-white shadow-sm text-slate-900'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-250 ${
                isHome ? 'bg-white text-teal-800' : 'bg-teal-700 text-white shadow-md shadow-teal-700/15'
              } group-hover:scale-105`}>
                <Compass className="h-4.5 w-4.5" />
              </span>
              <span className={`text-xl font-bold tracking-tight font-serif ${isHome ? 'text-white' : 'text-slate-900'}`}>
                Lanka<span className={`font-sans font-extrabold ${isHome ? 'text-teal-350' : 'text-teal-700'}`}>Stay</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                  isHome ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-teal-700'
                }`}
              >
                Explore Stays
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Host Verification status indicator with pulse animation */}
                {user.role === 'Host' && (
                  <span className={`hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                    isHome 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'bg-emerald-55 text-emerald-700 border border-emerald-200/40'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.isVerified ? 'bg-emerald-400' : 'bg-amber-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {user.isVerified ? 'Verified Host' : 'Pending Verification'}
                  </span>
                )}
                
                <Link
                  href={getDashboardLink()}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                    isHome 
                      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20' 
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-55 hover:text-teal-700'
                  }`}
                >
                  <LayoutDashboard className={`h-4 w-4 ${isHome ? 'text-white/60' : 'text-slate-400'}`} />
                  <span>Dashboard</span>
                </Link>

                <div className={`h-4 w-[1px] ${isHome ? 'bg-white/20' : 'bg-slate-200'}`}></div>

                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                    isHome ? 'bg-white/10 text-white border-white/20' : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className={`text-xs font-bold leading-none ${isHome ? 'text-white' : 'text-slate-900'}`}>
                      {user.fullName}
                    </span>
                    <span className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${isHome ? 'text-white/60' : 'text-slate-400'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className={`flex items-center justify-center rounded-xl border p-2 transition-colors ${
                    isHome 
                      ? 'border-white/15 text-white/60 hover:bg-white/10 hover:text-rose-400' 
                      : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-rose-600'
                  }`}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    isHome ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-teal-700'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className={`rounded-full px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 ${
                    isHome 
                      ? 'bg-white/15 border border-white/20 text-white hover:bg-white/25 hover:shadow-lg' 
                      : 'bg-teal-700 text-white hover:bg-teal-800 hover:shadow-teal-700/10'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
