'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navTabs = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/#about' },
    { name: 'Tours', href: '/#tours' },
    { name: 'Tailor-Made Stays', href: '/#tailor-made' },
    { name: 'Blog', href: '/#blog' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact Us', href: '/#contact' }
  ];

  return (
    <nav className={`z-50 w-full transition-all duration-300 ${
      isHome 
        ? 'absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent border-b border-white/10 text-white' 
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

            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-6">
              {navTabs.map((tab) => (
                <Link 
                  key={tab.name}
                  href={tab.href}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    isHome ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-teal-700'
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Right Side Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'Host' && (
                  <span className={`hidden lg:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                    isHome 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-205/30'
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
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-teal-700'
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

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl border transition-colors ${
                isHome 
                  ? 'border-white/15 text-white/80 hover:bg-white/10 hover:text-white' 
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-700'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Links Dropdown */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t px-6 py-5 space-y-4 animate-fadeIn shadow-2xl relative z-50 ${
          isHome 
            ? 'bg-slate-900 border-white/10 text-white' 
            : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <div className="flex flex-col space-y-2">
            {navTabs.map((tab) => (
              <Link 
                key={tab.name}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold uppercase tracking-wider py-2 transition-colors border-b ${
                  isHome ? 'border-white/5 text-white/80 hover:text-white' : 'border-slate-50 text-slate-600 hover:text-teal-700'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* User Auth actions in Mobile Drawer */}
          <div className="pt-2">
            {user ? (
              <div className="flex flex-col space-y-3">
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-2 rounded-full py-3 text-xs font-bold transition-all shadow-sm ${
                    isHome 
                      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20' 
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md`}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-3 text-xs font-bold uppercase tracking-wider transition-colors border rounded-full ${
                    isHome ? 'border-white/20 text-white hover:bg-white/10' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full text-center py-3 text-xs font-bold shadow-md rounded-full bg-teal-700 text-white hover:bg-teal-800`}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
