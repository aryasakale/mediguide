import { AlertTriangle } from 'lucide-react';
export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-coral bg-coralbg px-6 py-10 text-center">
      <AlertTriangle className="mb-2 text-coral" />
      <p className="text-sm text-[#8F3027]">{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 rounded-full border border-coral px-5 py-2 text-sm font-semibold text-[#C2453A] hover:bg-white">Try again</button>}
    </div>
  );
}
