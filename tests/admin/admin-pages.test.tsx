import { describe, expect, it, vi, beforeEach } from 'vitest';

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));

const hasAdminSessionMock = vi.hoisted(() => vi.fn());
const getAdminLandingPathMock = vi.hoisted(() => vi.fn(() => '/admin/printful'));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

vi.mock('@/lib/admin/auth', () => ({
  hasAdminSession: hasAdminSessionMock,
  getAdminLandingPath: getAdminLandingPathMock,
}));

import AdminLoginPage from '@/app/admin/login/page';
import AdminIndexPage from '@/app/admin/page';

describe('admin pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects authenticated visitors away from the login page', async () => {
    hasAdminSessionMock.mockResolvedValueOnce(true);

    await expect(AdminLoginPage()).rejects.toThrow('REDIRECT:/admin/printful');
  });

  it('routes the admin root to the authenticated landing page or login page', async () => {
    hasAdminSessionMock.mockResolvedValueOnce(true);
    await expect(AdminIndexPage()).rejects.toThrow('REDIRECT:/admin/printful');

    hasAdminSessionMock.mockResolvedValueOnce(false);
    await expect(AdminIndexPage()).rejects.toThrow('REDIRECT:/admin/login');
  });
});