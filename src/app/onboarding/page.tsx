"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";
import type { UserRole } from "@/types";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: UserRole) => {
    if (!session) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await clientApiCall(
        "/user/role",
        {
          method: "PUT",
          body: JSON.stringify({ role }),
        },
        session.accessToken
      );

      // Update the session with the new role
      await update({ role });

      // Redirect to appropriate dashboard
      const dashboardUrl =
        role === "EMPLOYER" ? "/employer/dashboard" : "/talent/dashboard";
      router.push(dashboardUrl);
    } catch (err) {
      setError("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Welcome to TalentX</h1>
            <p className="text-muted-foreground">
              Choose your role to get started with AI-powered talent matching
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === "TALENT" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRole("TALENT")}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  🎯 Talent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Discover jobs matched to your skills</li>
                  <li>• Get AI-powered job recommendations</li>
                  <li>• Apply to positions and manage invitations</li>
                  <li>• View your match scores</li>
                </ul>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRole === "EMPLOYER" ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRole("EMPLOYER")}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-center text-2xl">
                  🏢 Employer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Post jobs and generate descriptions</li>
                  <li>• Review applications and candidates</li>
                  <li>• Get AI-powered talent matching</li>
                  <li>• Send invitations to top candidates</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {error && <p className="text-red-600 text-center mt-4">{error}</p>}

          <div className="text-center mt-8">
            <Button
              onClick={() => selectedRole && handleRoleSelect(selectedRole)}
              disabled={!selectedRole || isLoading}
              size="lg"
            >
              {isLoading ? "Setting up..." : "Continue"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
