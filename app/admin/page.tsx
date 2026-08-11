import { redirect } from 'next/navigation';
import { hasAdminSession, getAdminLandingPath } from '@/lib/admin/auth';

export default async function AdminIndexPage() {
  if (await hasAdminSession()) {
    redirect(getAdminLandingPath());
  }

  redirect('/admin/login');
}