import { Loader2 } from 'lucide-react';
export default function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><Loader2 className="animate-spin" size={18} />{label}</div>;
}
