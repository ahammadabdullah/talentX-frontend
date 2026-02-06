"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/navigation";
import { clientApiCall } from "@/lib/api";

interface JobFormData {
  title: string;
  company: string;
  techStack: string[];
  deadline: string;
}

export default function NewJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    company: "",
    techStack: [],
    deadline: "",
  });
  const [techStackInput, setTechStackInput] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  }, [session, status, router]);

  const handleTechStackAdd = () => {
    if (techStackInput.trim()) {
      const newTechs = techStackInput
        .split(",")
        .map((tech) => tech.trim())
        .filter((tech) => tech && !formData.techStack.includes(tech));

      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, ...newTechs],
      }));
      setTechStackInput("");
    }
  };

  const removeTech = (techToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((tech) => tech !== techToRemove),
    }));
  };

  const generateDescription = async () => {
    if (
      !formData.title ||
      !formData.company ||
      formData.techStack.length === 0
    ) {
      setError("Please fill in title, company, and tech stack first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await clientApiCall(
        "/jobs/generate-description",
        {
          method: "POST",
          body: JSON.stringify({
            title: formData.title,
            company: formData.company,
            techStack: formData.techStack,
          }),
        },
        session!.accessToken
      );
      setGeneratedDescription(data.description);
    } catch (err) {
      setError("Failed to generate description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!generatedDescription) {
      setError("Please generate a job description first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const jobData = await clientApiCall(
        "/jobs",
        {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            description: generatedDescription,
          }),
        },
        session!.accessToken
      );

      router.push(`/employer/jobs/${jobData.id}`);
    } catch (err) {
      setError("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8" />
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Post New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior React Developer"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Tech Corp"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack</Label>
                <div className="flex gap-2">
                  <Input
                    id="techStack"
                    placeholder="Enter technologies separated by commas"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleTechStackAdd())
                    }
                  />
                  <Button type="button" onClick={handleTechStackAdd}>
                    Add
                  </Button>
                </div>
                {formData.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-sm text-sm"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Job Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateDescription}
                    disabled={isLoading}
                  >
                    {isLoading ? "Generating..." : "Generate Description"}
                  </Button>
                </div>
                {generatedDescription && (
                  <Textarea
                    value={generatedDescription}
                    onChange={(e) => setGeneratedDescription(e.target.value)}
                    rows={10}
                    className="mt-2"
                  />
                )}
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !generatedDescription}
                >
                  {isSubmitting ? "Creating Job..." : "Create Job"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
