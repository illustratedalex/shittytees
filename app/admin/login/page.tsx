import { redirect } from 'next/navigation';
import { getAdminLandingPath, hasAdminSession } from '@/lib/admin/auth';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminLoginPage() {
  if (await hasAdminSession()) {
    redirect(getAdminLandingPath());
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090807] text-[#f2ecde]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(179,78,78,0.14),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(71,67,61,0.35),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,13,11,0.6),rgba(9,8,7,0.92))]" />

      <div className="relative flex min-h-screen items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-[0.72rem] uppercase tracking-[0.34em] text-[#a89986]">ShittyTees</p>
            <h1 className="mt-3 text-[2.1rem] sm:text-[2.6rem] uppercase tracking-[0.26em] leading-none text-[#f2ecde]">Admin</h1>
          </div>

          <section className="panel-soft border border-[#f2ecde1f] bg-[#12110fe6] px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.55)] sm:px-8">
            <AdminLoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}