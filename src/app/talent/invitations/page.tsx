"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Invitation } from "@/types";

export default function InvitationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "TALENT") {
      router.push("/employer/dashboard");
      return;
    }

    async function fetchInvitations() {
      try {
        setLoading(true);
        const data = await clientApiCall(
          "/talent/invitations",
          {},
          session!.accessToken
        );
        setInvitations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchInvitations();
  }, [session, status, router]);

  const handleInvitationResponse = async (
    invitationId: string,
    action: "accept" | "decline"
  ) => {
    setProcessing(invitationId);

    try {
      await clientApiCall(
        `/talent/invitations/${invitationId}/${action}`,
        { method: "PUT" },
        session!.accessToken
      );

      // Update the invitation status
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId
            ? {
                ...inv,
                status: action.toUpperCase() as "ACCEPTED" | "DECLINED",
              }
            : inv
        )
      );

      alert(`Invitation ${action}ed successfully!`);
    } catch (err) {
      alert(`Failed to ${action} invitation. Please try again.`);
    } finally {
      setProcessing(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session || session.user.role !== "TALENT") {
    return null;
  }

  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "PENDING"
  );
  const respondedInvitations = invitations.filter(
    (inv) => inv.status !== "PENDING"
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Invitations</h1>
          <Link href="/talent/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No invitations yet</h2>
              <p className="text-muted-foreground mb-4">
                Employers will send you invitations for jobs that match your
                skills
              </p>
              <Link href="/talent/dashboard">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Pending Invitations ({pendingInvitations.length})
                </h2>
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {invitation.jobTitle}
                            </CardTitle>
                            <p className="text-muted-foreground">
                              {invitation.companyName}
                            </p>
                          </div>
                          {invitation.aiScore && (
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">
                                Match Score:{" "}
                              </span>
                              <span
                                className={`font-semibold ${
                                  invitation.aiScore >= 80
                                    ? "text-green-600"
                                    : invitation.aiScore >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              >
                                {invitation.aiScore}%
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Deadline: {formatDate(invitation.deadline)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleInvitationResponse(invitation.id, "accept")
                            }
                            disabled={processing === invitation.id}
                            size="sm"
                          >
                            {processing === invitation.id
                              ? "Processing..."
                              : "Accept"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleInvitationResponse(invitation.id, "decline")
                            }
                            disabled={processing === invitation.id}
                            size="sm"
                          >
                            Decline
                          </Button>
                          <Link href={`/jobs/${invitation.jobId}`}>
                            <Button variant="ghost" size="sm">
                              View Job
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Invitations */}
            {respondedInvitations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Previous Invitations ({respondedInvitations.length})
                </h2>
                <div className="space-y-4">
                  {respondedInvitations.map((invitation) => (
                    <Card key={invitation.id} className="opacity-75">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {invitation.jobTitle}
                            </CardTitle>
                            <p className="text-muted-foreground">
                              {invitation.companyName}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded ${
                                invitation.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {invitation.status}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          Deadline: {formatDate(invitation.deadline)}
                        </p>
                        <Link href={`/jobs/${invitation.jobId}`}>
                          <Button variant="ghost" size="sm">
                            View Job
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
