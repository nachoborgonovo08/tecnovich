"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LoginCardSection from "@/components/ui/login-signup";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const params = useSearchParams();
  const motivo = params.get("motivo") ?? undefined;
  return <LoginCardSection motivo={motivo} />;
}
