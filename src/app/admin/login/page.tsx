'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import AuthLayout from '@/components/auth/AuthLayout';
import Input from '@/components/ui/Input';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import { adminSignIn } from '@/lib/adminAuth';
import { validateEmail } from '@/lib/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [errs, setErrs] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const v = { email: validateEmail(email) || undefined, password: password ? undefined : 'Enter your password.' };
    setErrs(v); if (v.email || v.password) return;
    setBusy(true);
    const err = await adminSignIn(email, password);
    if (err) { setBusy(false); setError(err); return; }
    // Full page load so the admin layout re-checks the new session (a client-side push keeps its stale signed-out state and bounces back to login).
    window.location.assign('/admin/dashboard');
  }
  return (
    <AuthLayout title="Admin sign in" subtitle="For authorized MediGuide administrators only.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <Input label="Admin email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={errs.email} />
        <PasswordInput label="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errs.password} />
        {error && <p role="alert" className="rounded-xl bg-coralbg px-4 py-3 text-sm text-[#C2453A]">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />}Sign in to admin</Button>
      </form>
    </AuthLayout>
  );
}
