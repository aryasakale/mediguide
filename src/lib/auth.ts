export const validateEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.');
export const validatePassword = (v: string) =>
  v.length < 8 ? 'Use at least 8 characters.' : !/[A-Za-z]/.test(v) || !/\d/.test(v) ? 'Include at least one letter and one number.' : '';
// Demo-only credentials, active ONLY when Supabase is not configured.
export const DEMO_EMAIL = 'demo@mediguide.com';
export const DEMO_PASSWORD = 'Demo@1234';
export const DEMO_FLAG = 'mg_demo_session';
export const NOT_CONFIGURED = 'Authentication is not configured yet. Add your Supabase keys to .env.local (see .env.example).';
