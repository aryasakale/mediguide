import { Bot, MapPin, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { LogoArt } from '../branding/BrandLogo';

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <p className="text-xs font-bold tracking-[0.2em] text-secondary">YOUR PERSONAL TRAVEL HEALTH COMPANION</p>
        <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] text-deep sm:text-6xl">Your health.<br />Your journey.<br /><span className="text-bright">Our guidance.</span></h1>
        <p className="mt-6 max-w-lg text-lg text-muted">Feeling unwell in an unfamiliar place? Find suitable healthcare providers, understand your options, and get help navigating local medical services.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button href="/find-care">Find Healthcare</Button><Button href="#how-it-works" variant="secondary">Explore MediGuide</Button></div>
        <div className="mt-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-primary"><Sparkles size={20} aria-hidden /></span>
          <div><p className="text-sm font-bold text-deep">Healthcare made simpler</p><p className="text-sm text-muted">Discover care with greater confidence.</p></div>
        </div>
      </div>
      <div className="relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--mint)_0%,transparent_68%)] opacity-80" aria-hidden />
        <div className="absolute inset-5 rounded-full border border-mint" aria-hidden />
        <div className="absolute inset-14 rounded-full border border-dashed border-mint" aria-hidden />
        <div className="relative w-[58%]"><LogoArt size={300} /></div>
        <div className="card absolute left-0 top-[14%] flex items-center gap-3 px-4 py-3 sm:-left-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-softmint text-primary"><MapPin size={18} aria-hidden /></span><div><p className="text-sm font-bold text-deep">Care near you</p><p className="text-xs text-muted">Hospitals, clinics, pharmacies</p></div></div>
        <div className="card absolute bottom-[14%] right-0 flex items-center gap-3 px-4 py-3 sm:-right-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-softmint text-primary"><Bot size={18} aria-hidden /></span><div><p className="text-[11px] font-bold tracking-wider text-secondary">MEDIGUIDE AI</p><p className="text-xs text-muted">Here to guide you</p></div></div>
        <p className="absolute -bottom-2 w-full text-center text-xs text-muted">Healthcare guidance for every journey</p>
      </div>
    </section>
  );
}
