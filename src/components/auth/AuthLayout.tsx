import Link from 'next/link';
import BrandLogo, { LogoArt } from '../branding/BrandLogo';
export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-soft md:grid-cols-2">
        <section className="hidden flex-col items-center justify-center bg-gradient-to-b from-softmint to-pale p-10 text-center md:flex">
          <LogoArt size={260} />
          <p className="mt-6 text-xl font-extrabold text-deep">MediGuide</p>
          <p className="mt-1 text-[11px] font-bold tracking-[0.18em] text-secondary">HEALTHCARE, WHEREVER YOU GO</p>
        </section>
        <section className="p-7 sm:p-10">
          <div className="mb-6 md:hidden"><BrandLogo /></div>
          <h1 className="text-2xl font-extrabold text-deep sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          <p className="mt-8 text-center text-xs text-muted"><Link href="/" className="hover:text-primary">← Back to MediGuide</Link></p>
        </section>
      </div>
    </main>
  );
}
