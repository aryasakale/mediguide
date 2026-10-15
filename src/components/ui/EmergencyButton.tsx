import { Siren } from 'lucide-react';
import Button from './Button';
export default function EmergencyButton({ className, label = 'Emergency Help' }: { className?: string; label?: string }) {
  return <Button href="/emergency" variant="emergency" className={className}><Siren size={16} aria-hidden />{label}</Button>;
}
