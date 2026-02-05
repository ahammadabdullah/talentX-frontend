"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navigation } from "@/components/navigation";
import type { Job } from "@/types";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`);
        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            Find Your Next Opportunity
          </h1>
          <Input
            placeholder="Search jobs by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-7 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-5 bg-slate-200 rounded-lg w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-slate-200 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-200 rounded-lg w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <p className="text-red-600 text-lg font-medium">Error: {error}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="group cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold group-hover:text-slate-700 transition-colors">
                      {job.title}
                    </CardTitle>
                    <p className="text-slate-600 font-medium">{job.company}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {job.applicationCount} applications
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.techStack?.slice(0, 3).map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1.5 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-full text-xs font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.techStack?.length > 3 && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-full text-xs font-medium">
                            +{job.techStack.length - 3} more
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

        {!loading && !error && filteredJobs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No jobs found matching your search."
                : "No jobs available."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
