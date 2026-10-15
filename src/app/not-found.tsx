import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
export default function NotFound() {
  return <main className="mx-auto max-w-lg px-5 py-24"><EmptyState title="Page not found" text="The page you are looking for does not exist or has moved." action={<Button href="/">Back to home</Button>} /></main>;
}
