'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      setError('Login failed');
      return;
    }

    router.push('/admin/orders');
  };

  return (
    <main className="min-h-screen bg-[#0e0d0c] pt-[7rem] sm:pt-[7.5rem] px-5">
      <div className="max-w-md mx-auto panel-soft p-8 mt-12">
        <h1 className="text-[#f2ecde] text-2xl mb-4">Admin Login</h1>
        <p className="text-[#c4b9a7] text-sm mb-6">Development-only access. Real admin auth is required for production.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-[#f2ecde] text-sm">
            Admin Token
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="w-full min-h-[46px] mt-2 px-3 bg-[#12110f] border border-[#f2ecde33] rounded"
              required
            />
          </label>
          {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          <button type="submit" className="btn-primary w-full">Sign In</button>
        </form>
      </div>
    </main>
  );
}
