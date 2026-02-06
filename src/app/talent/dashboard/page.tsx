"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";
import { formatDate, isJobExpired } from "@/lib/utils";
import type { Job } from "@/types";

interface JobWithScore extends Job {
  aiScore: number;
}

export default function TalentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

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

    async function fetchJobs() {
      try {
        setLoading(true);
        const data = await clientApiCall(
          "/talent/job-feed",
          {},
          session!.accessToken
        );
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [session, status, router]);

  const handleApply = async (jobId: string) => {
    setApplying(jobId);

    try {
      await clientApiCall(
        `/jobs/${jobId}/apply`,
        { method: "POST" },
        session!.accessToken
      );

      // Update the job list to reflect the application
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      alert("Application submitted successfully!");
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setApplying(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Feed</h1>
          <Link href="/talent/invitations">
            <Button variant="outline">View Invitations</Button>
          </Link>
        </div>

        {error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600">Error: {error}</p>
            </CardContent>
          </Card>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">
                No recommended jobs
              </h2>
              <p className="text-muted-foreground mb-4">
                Check back later for new opportunities or browse all jobs
              </p>
              <Link href="/jobs">
                <Button>Browse All Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Jobs are ranked by AI based on your skills and preferences
            </p>

            {jobs
              .sort((a, b) => b.aiScore - a.aiScore)
              .map((job) => {
                const expired = isJobExpired(job.deadline);

                return (
                  <Card
                    key={job.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="hover:underline"
                            >
                              {job.title}
                            </Link>
                          </CardTitle>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-muted-foreground">
                              AI Score:
                            </span>
                            <span
                              className={`text-lg font-bold ${
                                job.aiScore >= 80
                                  ? "text-green-600"
                                  : job.aiScore >= 60
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {job.aiScore}%
                            </span>
                          </div>
                          {expired && (
                            <span className="text-sm text-red-600 font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Deadline: {formatDate(job.deadline)} •{" "}
                            {job.applicationCount} applications
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {job.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link href={`/jobs/${job.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleApply(job.id)}
                            disabled={expired || applying === job.id}
                            size="sm"
                          >
                            {applying === job.id
                              ? "Applying..."
                              : expired
                              ? "Expired"
                              : "Quick Apply"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}
