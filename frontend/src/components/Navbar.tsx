'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, Menu, X, Search, Globe, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Stays');
  const [searchQuery, setSearchQuery] = useState('');

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

  const mainNavLinks = [
    { name: 'Plan with AI', href: '#', icon: <Sparkles className="h-3.5 w-3.5 text-[#00aa6c]" /> },
    { name: 'Discover', href: '/#tours' },
    { name: 'Review', href: '/#blog' }
  ];

  const subTabs = [
    { name: 'All Stays', href: '#tours' },
    { name: 'Destinations', href: '#tailor-made' },
    { name: 'About Us', href: '#about' },
    { name: 'Reviews', href: '#blog' },
    { name: 'FAQ', href: '#faq' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Find element and scroll or route
      const element = document.getElementById('tours');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="z-55 w-full sticky top-0 border-b border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center gap-4">
          
          {/* Left Side: Brand Logo */}
          <div className="flex items-center gap-6 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8fbf3] text-[#00aa6c] transition-transform duration-250 group-hover:scale-105">
                <svg className="h-5 w-5 text-[#00AA6C] fill-current" viewBox="0 0 24 24">
                  {/* TripAdvisor Owl eyes + Compass concept */}
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
                  <circle cx="8" cy="12" r="2.2" fill="currentColor" />
                  <circle cx="16" cy="12" r="2.2" fill="currentColor" />
                  <circle cx="8" cy="12" r="0.8" fill="white" />
                  <circle cx="16" cy="12" r="0.8" fill="white" />
                  <path d="M12 15c-1.2 0-2.2-0.7-2.2-0.7h4.4s-1 0.7-2.2 0.7z" fill="currentColor" />
                </svg>
              </span>
              <span className="text-xl font-bold tracking-tight font-serif text-slate-950">
                Lanka<span className="font-sans font-extrabold text-[#00aa6c]">Stay</span>
              </span>
            </Link>
          </div>

          {/* Center Column: Small Pill Search Bar */}
          <div className="hidden md:flex flex-grow max-w-sm">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 px-3.5 py-1.5 rounded-full w-full focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00aa6c]/40 focus-within:border-[#00aa6c] transition-all">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Sigiriya, Galle, Kandy..."
                  className="bg-transparent text-xs font-semibold outline-none w-full text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              {mainNavLinks.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#00aa6c] transition-colors"
                >
                  {tab.icon && tab.icon}
                  <span>{tab.name}</span>
                </Link>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            {/* Currency selector (USD decorative) */}
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#00aa6c] transition-colors">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">USD</span>
            </div>

            {/* User Profile / Auth buttons */}
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'Host' && (
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/30">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Host
                  </span>
                )}

                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#00aa6c] transition-all shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold leading-none text-slate-900">
                      {user.fullName}
                    </span>
                    <span className="text-[8px] font-black tracking-wider uppercase mt-0.5 text-slate-400">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center justify-center rounded-full border border-slate-100 p-2 text-slate-400 hover:bg-slate-55 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-[#00aa6c] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-[#171717] hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="flex lg:hidden items-center shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#00aa6c] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Sub-navbar under top bar, only for Home route */}
      {isHome && (
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-11 items-center gap-6 overflow-x-auto no-scrollbar py-1 text-left">
              {subTabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`text-xs font-bold whitespace-nowrap pb-2 border-b-2 transition-all ${
                    activeTab === tab.name
                      ? 'text-[#00aa6c] border-[#00aa6c]'
                      : 'text-slate-500 border-transparent hover:text-[#00aa6c]'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Links Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white text-slate-900 px-6 py-5 space-y-4 animate-fadeIn shadow-2xl relative z-50">
          <div className="flex flex-col space-y-2">
            {mainNavLinks.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-wider py-2.5 transition-colors border-b border-slate-50 text-slate-700 hover:text-[#00aa6c]"
              >
                {tab.name}
              </Link>
            ))}
            {subTabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-wider py-2.5 transition-colors border-b border-slate-50 text-slate-500 hover:text-[#00aa6c]"
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
                  className="flex items-center justify-center gap-2 rounded-full py-3 text-xs font-bold border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md"
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
                  className="w-full text-center py-3 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200 text-slate-650 hover:bg-slate-50 rounded-full"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-xs font-bold shadow-md rounded-full bg-[#171717] hover:bg-slate-800 text-white"
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

