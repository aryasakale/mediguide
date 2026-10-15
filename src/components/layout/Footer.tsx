import Link from 'next/link';
import BrandLogo from '../branding/BrandLogo';
const cols = [
  { t: 'Explore', l: [['Find Care', '/find-care'], ['Map', '/map'], ['AI Assistant', '/ai-assistant'], ['Emergency Help', '/emergency']] },
  { t: 'Account', l: [['Login', '/login'], ['Create account', '/register'], ['Forgot password', '/forgot-password'], ['Dashboard', '/dashboard']] },
];
export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div><BrandLogo size={36} /><p className="mt-4 max-w-xs text-sm text-muted">Helping travellers find suitable healthcare and understand their options, wherever they are.</p></div>
        {cols.map((c) => (
          <div key={c.t}><h2 className="text-sm font-bold text-deep">{c.t}</h2>
            <ul className="mt-3 space-y-2">{c.l.map(([n, h]) => <li key={h}><Link href={h} className="text-sm text-muted hover:text-primary">{n}</Link></li>)}</ul></div>
        ))}
      </div>
      <p className="border-t border-line px-5 py-4 text-center text-xs text-muted">© {new Date().getFullYear()} MediGuide. Informational guidance only - not a substitute for professional medical advice.</p>
    </footer>
  );
}
