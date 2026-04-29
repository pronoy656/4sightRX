import VerifyCodeForm from "@/components/auth/VerifyCodeForm";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyCodeForm />
    </Suspense>
  );
}
