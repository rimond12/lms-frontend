import { LoginClient } from "@/app/pages/LoginClient/LoginClient";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
    <LoginClient />
  </Suspense>
  );
}