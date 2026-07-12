'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User, LayoutDashboard, CheckSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/15 group-hover:scale-105 transition-transform duration-250">
                <Compass className="h-4.5 w-4.5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                Lanka<span className="text-teal-700 font-sans font-extrabold">Stay</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-teal-700 transition-colors">
                Explore Stays
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Host Verification status indicator with pulse animation */}
                {user.role === 'Host' && (
                  <span className={`hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${user.isVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40' : 'bg-amber-50 text-amber-700 border border-amber-200/40'}`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user.isVerified ? 'bg-emerald-400' : 'bg-amber-500'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </span>
                    {user.isVerified ? 'Verified Host' : 'Pending Verification'}
                  </span>
                )}
                
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition-all shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  <span>Dashboard</span>
                </Link>

                <div className="h-4 w-[1px] bg-slate-200"></div>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-none">
                      {user.fullName}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center justify-center rounded-xl border border-slate-100 p-2 text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-teal-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-xl bg-teal-700 px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-700/10 hover:bg-teal-700 active:scale-95 transition-all"
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
