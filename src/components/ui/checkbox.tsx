"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { cn } from "@/lib/utils";
import { HiCheck, HiMinus } from "react-icons/hi";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-6 border border-border-02 bg-surface-base transition-colors outline-none group-has-disabled/field:opacity-50 group-has-focus-visible/field-label:ring-0 group-has-focus-visible/field-label:not-data-checked:border-border-01 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-border-02 disabled:cursor-not-allowed disabled:border-border-03 disabled:bg-surface-level-02 aria-invalid:ring-1 aria-invalid:ring-highlight-red-75 aria-invalid:aria-checked:border-highlight-red-75  dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-display-01 data-checked:bg-display-01 data-checked:text-surface-base group-has-focus-visible/field-label:data-checked:border-spot-01 dark:data-checked:bg-spot-01 data-indeterminate:border-display-01 data-indeterminate:bg-display-01 data-indeterminate:text-surface-base dark:data-indeterminate:bg-spot-01",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <HiCheck className="group-data-indeterminate/indicator:hidden" />
        <HiMinus className="hidden group-data-indeterminate/indicator:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
