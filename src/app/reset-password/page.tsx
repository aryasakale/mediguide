import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
export default function Page() {
  return <AuthLayout title="Reset your password" subtitle="Choose a new password for your account."><AuthForm mode="reset" /></AuthLayout>;
}
