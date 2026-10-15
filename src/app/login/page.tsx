import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
export default function Page() {
  return <AuthLayout title="Welcome back" subtitle="Log in to manage saved hospitals and your profile."><AuthForm mode="login" /></AuthLayout>;
}
