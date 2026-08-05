'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending message');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">Contact Us</h1>

        {status === 'success' && (
          <div className="bg-green-50 text-green-900 p-4 rounded-lg mb-8 border border-green-200">
            Thanks for your message. We'll get back to you soon.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 text-red-900 p-4 rounded-lg mb-8 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold text-black mb-2 text-sm">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-2 text-sm">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-2 text-sm">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-black mb-2 text-sm">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 h-32 resize-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary-oxblood w-full disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
