'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
          {/* Brand section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-250">
                <Compass className="h-4.5 w-4.5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Lanka<span className="text-teal-600">Stay</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
              A premium Local Homestay & Cultural Experience Registry connecting verified hosts with tourists seeking authentic Sri Lankan hospitality.
            </p>
            <p className="text-[10px] text-slate-400 border border-slate-100 rounded-xl p-3 bg-slate-50/50 mt-4 leading-relaxed font-semibold max-w-xs">
              🛡️ Fully compliant with the SLTDA community registry guidelines. All hosts are vetted via local Grama Niladhari and Police clearance certificates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-teal-600 transition-colors">
                  Explore Experiences
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-teal-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-teal-600 transition-colors">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Preference Tags</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>🌱 Vegan Friendly</li>
              <li>🕌 Halal Stays</li>
              <li>🐾 Pet Friendly</li>
              <li>🍲 Traditional Ceylon Food</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Get in Touch</h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>support@lankastay.lk</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>+94 (11) 234-5678</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
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
