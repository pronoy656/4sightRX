"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import axiosSecure from "@/components/hook/axiosSecure";

export default function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState(["", "", "", "", ""]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const oneTimeCode = Number(code.join(""));
    
    if (!email) {
      setError("Email is missing. Please start the process again.");
      return;
    }
    
    if (isNaN(oneTimeCode) || code.join("").length !== 5) {
      // Assuming 5 digit based on the state initialized
      setError("Please enter a valid verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosSecure.post("/auth/verify-email", { email, oneTimeCode });
      router.push(`/new-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const message = err.response?.data?.message || "Verification failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Verify Reset Password</h1>
        <p className="text-slate-500">
          Enter the code sent to your email to reset your password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between gap-2">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-14 h-16 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="brand"
          className="w-full h-12 text-base"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>
    </div>
  );
}

