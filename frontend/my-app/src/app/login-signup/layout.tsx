"use client";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../utils/auth";
import { useRouter } from "next/navigation";
import Cookie from "js-cookie";
import Spinner from "../components/styles/loader";

export default function SigningLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!Cookie.get("access")) {
        Cookie.remove("access");
        Cookie.remove("refresh");
      }
      if (isAuthenticated) {
        router.push("/dashboard");
      }
    }
  }, [loading, isAuthenticated, router]);

  if (loading || isAuthenticated) {
    return (
      <div className="w-screen h-screen bg-transparent text-white">

        <Spinner />
      </div>
    );
    
  }

  return (
    <div className="w-screen h-screen bg-transparent text-white">
      {children}
    </div>
  );
}
