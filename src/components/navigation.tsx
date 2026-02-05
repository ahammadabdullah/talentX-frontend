"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/jobs" className="text-xl font-bold">
          TalentX
        </Link>

        <nav className="flex items-center space-x-4">
          <Link href="/jobs" className="text-sm font-medium hover:underline">
            Jobs
          </Link>

          {status === "loading" ? (
            <div className="h-10 w-20 animate-pulse rounded-lg bg-slate-200/50" />
          ) : session ? (
            <div className="flex items-center space-x-4">
              <Link
                href={
                  session.user.role === "EMPLOYER"
                    ? "/employer/dashboard"
                    : "/talent/dashboard"
                }
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut()}
                size="sm"
                className="btn-secondary"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="btn-primary">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
