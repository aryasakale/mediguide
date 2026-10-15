import Link from 'next/link';
import { cn } from '@/lib/utils';
type Variant = 'primary' | 'secondary' | 'emergency' | 'ghost';
const styles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-deep shadow-soft',
  secondary: 'border border-line bg-white text-deep hover:bg-softmint',
  emergency: 'border border-coral bg-coralbg text-[#C2453A] hover:bg-coral hover:text-white',
  ghost: 'text-primary hover:bg-softmint',
};
type Props = { variant?: Variant; href?: string; external?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>;
/** Covers PrimaryButton / SecondaryButton / EmergencyButton styles via `variant`. */
export default function Button({ variant = 'primary', href, external, className, children, ...rest }: Props) {
  const c = cn('inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50', styles[variant], className);
  if (href && external) return <a href={href} target="_blank" rel="noopener noreferrer" className={c}>{children}</a>;
  if (href) return <Link href={href} className={c}>{children}</Link>;
  return <button className={c} {...rest}>{children}</button>;
}
