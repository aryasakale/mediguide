import { Star } from 'lucide-react';
export default function RatingDisplay({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-xs text-muted">No ratings yet</span>;
  return <span className="inline-flex items-center gap-1 text-sm font-semibold text-deep"><Star size={14} className="fill-[#F5B83D] text-[#F5B83D]" aria-hidden />{rating.toFixed(1)}<span className="sr-only"> out of 5</span></span>;
}
