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
import type { Job } from "@/types";

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
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

    async function fetchJobs() {
      try {
        setLoading(true);
        const data = await clientApiCall(
          "/employer/jobs",
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
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

  if (!session || session.user.role !== "EMPLOYER") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Employer Dashboard</h1>
          <Link href="/employer/jobs/new">
            <Button>Post New Job</Button>
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
              <h2 className="text-xl font-semibold mb-2">No jobs posted yet</h2>
              <p className="text-muted-foreground mb-4">
                Start by posting your first job to attract top talent
              </p>
              <Link href="/employer/jobs/new">
                <Button>Post Your First Job</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Link key={job.id} href={`/employer/jobs/${job.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {job.company}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>{job.applicationCount}</strong> applications
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Deadline: {formatDate(job.deadline)}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.techStack.slice(0, 2).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.techStack.length > 2 && (
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-xs">
                            +{job.techStack.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
