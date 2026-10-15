'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import { getSupabase, demoAllowed } from '@/lib/supabase/client';
import { DEMO_EMAIL, DEMO_FLAG, DEMO_PASSWORD, NOT_CONFIGURED, validateEmail, validatePassword } from '@/lib/auth';

type Mode = 'login' | 'register' | 'forgot' | 'reset';
type Errs = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'terms', string>>;
const label: Record<Mode, string> = { login: 'Login', register: 'Create Account', forgot: 'Send Reset Link', reset: 'Reset Password' };

/** One accessible form for login / register / forgot / reset - all real Supabase calls, never simulated. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '', remember: true, terms: false });
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [recovery, setRecovery] = useState<'checking' | 'ok' | 'invalid'>('checking');
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  // Reset page: only allow a password change when a valid recovery session exists.
  useEffect(() => {
    if (mode !== 'reset') return;
    const sb = getSupabase();
    if (!sb) { setRecovery('invalid'); return; }
    const { data: sub } = sb.auth.onAuthStateChange((ev, s) => { if (ev === 'PASSWORD_RECOVERY' || (ev === 'SIGNED_IN' && s)) setRecovery('ok'); });
    const t = setTimeout(() => sb.auth.getSession().then(({ data }) => setRecovery(data.session ? 'ok' : 'invalid')), 1200);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, [mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const v: Errs = {};
    if (mode === 'register' && f.name.trim().length < 2) v.name = 'Enter your full name.';
    if (mode !== 'reset') { const m = validateEmail(f.email); if (m) v.email = m; }
    if (mode === 'login' && !f.password) v.password = 'Enter your password.';
    if (mode === 'register' || mode === 'reset') { const m = validatePassword(f.password); if (m) v.password = m; if (f.confirm !== f.password) v.confirm = 'Passwords do not match.'; }
    if (mode === 'register' && !f.terms) v.terms = 'Please accept the Terms and Privacy Policy.';
    setErrs(v); if (Object.keys(v).length) return;

    const sb = getSupabase();
    if (!sb) {
      if (mode === 'login' && demoAllowed) {
        if (f.email.trim().toLowerCase() !== DEMO_EMAIL || f.password !== DEMO_PASSWORD) { setError('Incorrect email or password.'); return; }
        localStorage.setItem(DEMO_FLAG, '1');
        const next = new URLSearchParams(window.location.search).get('next');
        router.push(next && next.startsWith('/') ? next : '/dashboard'); return;
      }
      setError(NOT_CONFIGURED); return;
    }
    setBusy(true);
    const origin = window.location.origin;
    try {
      if (mode === 'login') {
        const { error: err } = await sb.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
        if (err) { setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password.' : err.message); return; }
        const next = new URLSearchParams(window.location.search).get('next');
        router.push(next && next.startsWith('/') ? next : '/dashboard'); router.refresh();
      } else if (mode === 'register') {
        const { data, error: err } = await sb.auth.signUp({ email: f.email.trim(), password: f.password, options: { data: { full_name: f.name.trim() }, emailRedirectTo: `${origin}/login` } });
        if (err) { setError(err.message); return; }
        if (data.user && data.user.identities?.length === 0) { setError('An account with this email already exists. Try logging in instead.'); return; }
        if (data.session) { router.push('/dashboard'); router.refresh(); }
        else setDone('Account created. Check your inbox and verify your email address, then log in.');
      } else if (mode === 'forgot') {
        await sb.auth.resetPasswordForEmail(f.email.trim(), { redirectTo: `${origin}/reset-password` });
        // Same message whether or not the email exists, so accounts cannot be probed.
        setDone('If an account exists for that email, a reset link is on its way. The link expires, so use it soon.');
      } else {
        const { error: err } = await sb.auth.updateUser({ password: f.password });
        if (err) { setError(err.message); return; }
        await sb.auth.signOut(); setDone('Your password has been updated. You can now log in with it.');
      }
    } catch { setError('Something went wrong. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div role="status" className="rounded-2xl border border-line bg-softmint p-6 text-center">
      <CheckCircle2 className="mx-auto mb-3 text-success" size={36} />
      <p className="text-sm text-ink">{done}</p>
      <Button href="/login" className="mt-5">Go to Login</Button>
    </div>
  );
  if (mode === 'reset' && recovery !== 'ok') return recovery === 'checking'
    ? <p role="status" className="flex items-center gap-2 text-sm text-muted"><Loader2 className="animate-spin" size={16} />Checking your reset link…</p>
    : (
      <div role="alert" className="rounded-2xl border border-coral bg-coralbg p-5 text-sm text-[#8F3027]">
        This reset link is invalid or has expired. <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {mode === 'login' && !getSupabase() && demoAllowed && (
        <div className="rounded-xl border border-line bg-softmint px-4 py-3 text-sm text-ink">
          <p className="font-semibold text-deep">Demo account (UI preview)</p>
          <p className="mt-1">Email: <code className="font-semibold">{DEMO_EMAIL}</code></p>
          <p>Password: <code className="font-semibold">{DEMO_PASSWORD}</code></p>
          <button type="button" onClick={() => setF((p) => ({ ...p, email: DEMO_EMAIL, password: DEMO_PASSWORD }))} className="mt-2 text-xs font-semibold text-primary underline">Fill demo details</button>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl border border-coral bg-coralbg px-4 py-3 text-sm text-[#8F3027]">{error}</p>}
      {mode === 'register' && <Input label="Full name" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} error={errs.name} />}
      {mode !== 'reset' && <Input label={mode === 'forgot' ? 'Registered email' : 'Email address'} type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} error={errs.email} />}
      {mode !== 'forgot' && <PasswordInput label={mode === 'reset' ? 'New password' : 'Password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={f.password} onChange={(e) => set('password', e.target.value)} error={errs.password} hint={mode === 'login' ? undefined : 'At least 8 characters with a letter and a number.'} />}
      {(mode === 'register' || mode === 'reset') && <PasswordInput label="Confirm password" autoComplete="new-password" value={f.confirm} onChange={(e) => set('confirm', e.target.value)} error={errs.confirm} />}
      {mode === 'login' && (
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={f.remember} onChange={(e) => set('remember', e.target.checked)} className="h-4 w-4 accent-[#126B63]" />Remember me</label>
          <Link href="/forgot-password" className="font-semibold text-primary hover:underline">Forgot password?</Link>
        </div>
      )}
      {mode === 'register' && (
        <div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={f.terms} onChange={(e) => set('terms', e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#126B63]" />
            <span>I agree to the Terms of Service and Privacy Policy.</span></label>
          {errs.terms && <p role="alert" className="mt-1 text-xs text-[#C2453A]">{errs.terms}</p>}
        </div>
      )}
      <Button type="submit" disabled={busy} className="w-full">{busy && <Loader2 className="animate-spin" size={16} />}{busy ? 'Please wait…' : label[mode]}</Button>
      <p className="text-center text-sm text-muted">
        {mode === 'login' && <>New to MediGuide? <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link></>}
        {mode === 'register' && <>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Login</Link></>}
        {mode === 'forgot' && <Link href="/login" className="font-semibold text-primary hover:underline">Return to Login</Link>}
      </p>
    </form>
  );
}
