"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-colors outline-none group-has-focus-visible/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 data-[size=default]:h-7 data-[size=default]:w-14 data-[size=sm]:h-5 data-[size=sm]:w-9.5 data-checked:bg-highlight-brown-75 data-unchecked:bg-surface-level-01 data-disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-surface-base ring-0 transition-all data-checked:bg-surface-level-00 data-disabled:bg-surface-level-02 group-data-[size=default]/switch:size-5 group-data-[size=default]/switch:translate-x-1.5 group-data-[size=default]/switch:data-checked:size-5 group-data-[size=default]/switch:data-checked:translate-x-7.5 group-data-[size=sm]/switch:size-3 group-data-[size=sm]/switch:translate-x-1 group-data-[size=sm]/switch:data-checked:size-3.5 group-data-[size=sm]/switch:data-checked:translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
