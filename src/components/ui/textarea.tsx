import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full min-w-0 rounded-14 border-0 bg-surface-level-00 px-l py-lg text-[0.8rem] text-display-body font-medium transition-colors outline-none placeholder:text-display-subtle-03 focus-visible:ring-highlight-grey-50 focus-visible:ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-level-00 disabled:opacity-50 disabled:text-display-subtle-02 aria-invalid:ring-1 aria-invalid:ring-highlight-red-75 aria-invalid:text-highlight-red-75",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
