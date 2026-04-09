"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  variant?: "default" | "ghost" | "destructive" | "outline";
}

export default function LogoutButton({
  className,
  showIcon = true,
  variant = "ghost",
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      variant={variant}
      onClick={logout}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      Logout
    </Button>
  );
}
