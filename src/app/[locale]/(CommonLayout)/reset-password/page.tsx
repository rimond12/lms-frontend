import { ResetPassword } from "@/app/pages/ResetPassword/ResetPassword";

// Force dynamic rendering to avoid prerendering issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
