"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-300 border-t-slate-600",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingCardProps {
  count?: number;
  className?: string;
}

export function LoadingCard({ count = 1, className }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border border-slate-200/60 bg-white/90 animate-pulse",
            className
          )}
        >
          <div className="p-8 pb-4">
            <div className="h-6 bg-slate-200 rounded-lg mb-3" />
            <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
          </div>
          <div className="p-8 pt-0">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded-lg" />
              <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-6">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}
