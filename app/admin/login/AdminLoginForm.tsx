'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setError('Invalid email or password.');
        return;
      }

      window.location.assign('/admin');
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-[0.74rem] uppercase tracking-[0.18em] text-[#a89986]" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full min-h-[48px] rounded-sm border border-[#f2ecde24] bg-[#0f0e0d] px-4 text-[#f2ecde] outline-none transition-colors placeholder:text-[#6f665a] focus:border-[#d7c8b1]"
          placeholder="admin@shittytees.com"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[0.74rem] uppercase tracking-[0.18em] text-[#a89986]" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full min-h-[48px] rounded-sm border border-[#f2ecde24] bg-[#0f0e0d] px-4 text-[#f2ecde] outline-none transition-colors placeholder:text-[#6f665a] focus:border-[#d7c8b1]"
          required
        />
      </div>

      {error ? <p className="text-sm text-[#ff9a9a]">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full min-h-[48px] uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'SIGNING IN...' : 'SIGN IN'}
      </button>
    </form>
  );
}