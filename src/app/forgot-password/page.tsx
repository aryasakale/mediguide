import AuthLayout from '@/components/auth/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
export default function Page() {
  return <AuthLayout title="Forgot your password?" subtitle="Enter your registered email and we will send you a link to reset it."><AuthForm mode="forgot" /></AuthLayout>;
}
