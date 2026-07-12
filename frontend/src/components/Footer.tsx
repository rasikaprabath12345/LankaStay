'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Mail, Phone, MapPin, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-left">
          
          {/* Brand section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform duration-250">
                <Compass className="h-4.5 w-4.5" />
              </span>
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                Lanka<span className="text-teal-400 font-sans font-extrabold">Stay</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-xs">
              A premium Local Homestay &amp; Cultural Experience Registry connecting verified hosts with tourists seeking authentic Sri Lankan hospitality.
            </p>
            <div className="border border-slate-900 bg-slate-900/40 p-4 rounded-xl max-w-xs space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>SLTDA Compliant Vetting</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                All hosts are strictly vetted via Grama Niladhari residency checks and local police clearance records.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Quick Links</h4>
            <ul className="space-y-3.5 text-xs">
              <li>
                <Link href="/#tours" className="hover:text-teal-400 transition-colors">
                  Explore Experiences
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-teal-400 transition-colors">
                  Sign In to Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-teal-400 transition-colors">
                  Become a Host
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-teal-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Preference Tags */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Preference Tags</h4>
            <ul className="space-y-3.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span>🌱</span>
                <span>Vegan Friendly</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🕌</span>
                <span>Halal Certified Stays</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🐾</span>
                <span>Pet Friendly Stays</span>
              </li>
              <li className="flex items-center gap-2">
                <span>🍲</span>
                <span>Traditional Ceylon Food</span>
              </li>
            </ul>
          </div>

          {/* Contact Info & Socials */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-5">Get in Touch</h4>
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-teal-500 shrink-0" />
                  <a href="mailto:support@lankastay.lk" className="hover:text-teal-400 transition-colors">support@lankastay.lk</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-teal-500 shrink-0" />
                  <a href="tel:+94112345678" className="hover:text-teal-400 transition-colors">+94 (11) 234-5678</a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-teal-500 shrink-0" />
                  <span>Colombo, Sri Lanka</span>
                </li>
              </ul>
            </div>
            
            {/* Social Links */}
            <div className="space-y-2">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Connect Socially</span>
              <div className="flex gap-3">
                <a href="#" aria-label="Facebook" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3h-4V6.5C13 5.3 13.8 5 14.5 5H17V2h-3.5C9.9 2 9 3.5 9 5.8V8z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                  <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="#" aria-label="Twitter" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} LankaStay. All rights reserved. Sri Lanka Tourism Development Authority Registry.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> in Sri Lanka
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
