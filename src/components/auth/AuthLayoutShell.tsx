"use client";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";

type AuthLayoutShellProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
}>;

export default function AuthLayoutShell({
  children,
}: AuthLayoutShellProps) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white text-black">
      {/* Left Side: Hero Image and Text */}
      <div className="relative hidden md:block overflow-hidden">
        <Image
          src="/Container.png"
          alt="Auth Hero"
          priority
          fill
          className="object-cover"
        />
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-[500px] flex flex-col items-center text-center">
          {/* Logo Section */}
          <div className="mb-12">
            <Image
              src="/logo2.png"
              alt="4sightRX Logo"
              width={240}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          {/* Form Content */}
          <div className="w-full text-left text-black">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
