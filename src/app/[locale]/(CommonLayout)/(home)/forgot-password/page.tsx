import { ForgotPassword } from "@/app/pages/ForgotPassword/ForgotPassword";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
