"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";
import { formatDate, isJobExpired } from "@/lib/utils";
import type { Job } from "@/types";

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${params.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job");
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [params.id]);

  const handleApply = async () => {
    if (!session) {
      // Store the current URL to return after login
      sessionStorage.setItem("returnUrl", `/jobs/${params.id}`);
      router.push("/login");
      return;
    }

    if (session.user.role !== "TALENT") {
      alert("Only talent can apply for jobs");
      return;
    }

    try {
      setApplying(true);
      await clientApiCall(
        `/jobs/${params.id}/apply`,
        { method: "POST" },
        session.accessToken
      );
      alert("Application submitted successfully!");
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="text-center py-8">
              <p className="text-red-600">{error || "Job not found"}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const expired = isJobExpired(job.deadline);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <p className="text-lg text-muted-foreground">{job.company}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Deadline: {formatDate(job.deadline)}</span>
              <span>{job.applicationCount} applications</span>
              {expired && (
                <span className="text-red-600 font-medium">Expired</span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {job.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Job Description</h3>
              <div className="prose prose-sm max-w-none">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleApply}
                disabled={expired || applying}
                className="w-full md:w-auto"
              >
                {applying
                  ? "Applying..."
                  : expired
                  ? "Application Closed"
                  : "Apply Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
