import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
export default function Page() {
  return <AuthLayout title="Create Account" subtitle="Join MediGuide to save providers and personalise your care search."><AuthForm mode="register" /></AuthLayout>;
}
