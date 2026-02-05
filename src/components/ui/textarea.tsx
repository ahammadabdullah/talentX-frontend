import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm transition-all duration-200 placeholder:text-slate-500 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-200/50 disabled:cursor-not-allowed disabled:opacity-50 hover:border-slate-300 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
