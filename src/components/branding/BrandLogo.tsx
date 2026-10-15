import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Official MediGuide logo (derived from the uploaded artwork: /images/mediguide-logo.png). */
export function LogoArt({ size = 320, className }: { size?: number; className?: string }) {
  return <Image src="/images/mediguide-mark.png" alt="MediGuide logo" width={size} height={size} priority
    className={cn('h-auto w-full rounded-[22%] shadow-soft', className)} style={{ maxWidth: size }} />;
}

export default function BrandLogo({ size = 40, tagline = true, href = '/', className }: { size?: number; tagline?: boolean; href?: string; className?: string }) {
  return (
    <Link href={href} aria-label="MediGuide home" className={cn('flex items-center gap-3', className)}>
      <Image src="/images/mediguide-mark.png" alt="MediGuide logo" width={size} height={size} style={{ width: size, height: size }} className="rounded-xl" />
      <span>
        <span className="block text-lg font-extrabold leading-none text-deep">MediGuide</span>
        {tagline && <span className="mt-1 hidden text-[9px] font-bold tracking-[0.18em] text-secondary sm:block">HEALTHCARE, WHEREVER YOU GO</span>}
      </span>
    </Link>
  );
}
