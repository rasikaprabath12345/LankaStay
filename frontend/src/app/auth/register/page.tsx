'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Compass, Mail, Lock, User, ShieldAlert, Loader2, AlertCircle, FileText } from 'lucide-react';

export default function RegisterPage() {
  const { register, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Tourist' | 'Host'>('Tourist');
  
  // Host verification clearance files (simulated URLs)
  const [gnClearanceUrl, setGnClearanceUrl] = useState('');
  const [policeClearanceUrl, setPoliceClearanceUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: any = {
      email,
      password,
      fullName,
      role: role === 'Host' ? 2 : 3, // Enum values: Host = 2, Tourist = 3
    };

    if (role === 'Host') {
      if (!gnClearanceUrl || !policeClearanceUrl) {
        setError('Hosts must provide both Grama Niladhari and Police Clearance document links.');
        setLoading(false);
        return;
      }
      payload.gramaNiladhariClearanceUrl = gnClearanceUrl;
      payload.policeClearanceUrl = policeClearanceUrl;
    }

    try {
      await register(payload);
      router.push(role === 'Host' ? '/dashboard/host' : '/dashboard/tourist');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-500/25">
            <Compass className="h-6 w-6" />
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-teal-600 hover:text-teal-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow-xl border border-slate-100 sm:rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Sunil Perera"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700">I want to register as a:</span>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Tourist')}
                  className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${
                    role === 'Tourist'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Tourist / Guest
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Host')}
                  className={`flex items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${
                    role === 'Host'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-700'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Local Host
                </button>
              </div>
            </div>

            {role === 'Host' && (
              <div className="space-y-4 rounded-xl bg-slate-50 border border-slate-200/60 p-4 animate-fade-in">
                <div className="flex gap-2 text-xs text-amber-700">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Strict Verification: Hosts are verified by admins based on local certifications before listings are published.
                  </span>
                </div>

                <div>
                  <label htmlFor="gnClearance" className="block text-xs font-semibold text-slate-600">
                    Grama Niladhari Certificate Link (mock URL)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      id="gnClearance"
                      type="text"
                      required={role === 'Host'}
                      value={gnClearanceUrl}
                      onChange={(e) => setGnClearanceUrl(e.target.value)}
                      placeholder="https://example.com/clearance-gn.pdf"
                      className="block w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="policeClearance" className="block text-xs font-semibold text-slate-600">
                    Police Clearance Certificate Link (mock URL)
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                      id="policeClearance"
                      type="text"
                      required={role === 'Host'}
                      value={policeClearanceUrl}
                      onChange={(e) => setPoliceClearanceUrl(e.target.value)}
                      placeholder="https://example.com/clearance-police.pdf"
                      className="block w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/10 hover:bg-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
