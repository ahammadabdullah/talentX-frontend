"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Job, Application, TalentScore } from "@/types";

interface EmployerJobPageProps {
  params: {
    id: string;
  };
}

export default function EmployerJobPage({ params }: EmployerJobPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [talentScores, setTalentScores] = useState<TalentScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "EMPLOYER") {
      router.push("/talent/dashboard");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        // Fetch job details and applications in parallel
        const [jobData, applicationsData, talentData] = await Promise.all([
          clientApiCall(
            `/employer/jobs/${params.id}`,
            {},
            session!.accessToken
          ),
          clientApiCall(
            `/employer/jobs/${params.id}/applications`,
            {},
            session!.accessToken
          ),
          clientApiCall(
            `/employer/jobs/${params.id}/talent-matching`,
            {},
            session!.accessToken
          ),
        ]);

        setJob(jobData);
        setApplications(applicationsData);
        setTalentScores(talentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, status, router, params.id]);

  const handleInviteTalent = async (talentId: string) => {
    try {
      await clientApiCall(
        `/employer/jobs/${params.id}/invite`,
        {
          method: "POST",
          body: JSON.stringify({ talentId }),
        },
        session!.accessToken
      );
      alert("Invitation sent successfully!");
    } catch (err) {
      alert("Failed to send invitation. Please try again.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!session || session.user.role !== "EMPLOYER") {
    return null;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">{error || "Job not found"}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-muted-foreground">{job.company}</p>
          <p className="text-sm text-muted-foreground">
            Posted • Deadline: {formatDate(job.deadline)}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Applications ({applications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No applications yet
                </p>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{application.talentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied {formatDate(application.createdAt)} •{" "}
                          {application.source}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Talent Matching */}
          <Card>
            <CardHeader>
              <CardTitle>AI Talent Matching</CardTitle>
            </CardHeader>
            <CardContent>
              {talentScores.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No talent matches available
                </p>
              ) : (
                <div className="space-y-3">
                  {talentScores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((talent) => (
                      <div
                        key={talent.talentId}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{talent.talentName}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Match Score:
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                talent.score >= 80
                                  ? "text-green-600"
                                  : talent.score >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {talent.score}%
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInviteTalent(talent.talentId)}
                        >
                          Invite
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Job Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {job.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="prose prose-sm max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
