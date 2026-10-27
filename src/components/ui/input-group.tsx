"use client";

import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// The group carries the Input surface, ring and invalid states; its controls stay transparent.
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex h-11.25 w-full min-w-0 items-center rounded-14 bg-surface-level-00 text-[0.8rem] font-medium text-display-body transition-colors outline-none",
        "has-[[data-slot=input-group-control]:focus-visible]:ring has-[[data-slot=input-group-control]:focus-visible]:ring-highlight-grey-50",
        "has-[[data-slot][aria-invalid=true]]:ring-1 has-[[data-slot][aria-invalid=true]]:ring-highlight-red-75",
        "has-disabled:opacity-50",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto",
        "has-[>[data-align=inline-start]]:[&>input]:pl-1.5 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=block-end]]:[&>input]:pt-3",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-[0.8rem] font-medium text-display-02 select-none group-has-disabled/input-group:opacity-50 [&>kbd]:rounded-6 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2.5 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-2.5 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-l pt-2.5 [.border-b]:pb-2.5",
        "block-end":
          "order-last w-full justify-start px-l pb-2.5 [.border-t]:pt-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        e.currentTarget.parentElement
          ?.querySelector<HTMLElement>("[data-slot=input-group-control]")
          ?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-[0.8rem] text-display-subtle-03 shadow-none hover:bg-surface-level-01 hover:text-display-body disabled:bg-transparent",
  {
    variants: {
      size: {
        xs: "h-7 gap-1 rounded-10 px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-10 px-2.5",
        "icon-xs":
          "size-7 rounded-10 p-0 has-[>svg]:p-0 [&>svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-8 rounded-10 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset";
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-[0.8rem] text-display-subtle-03 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupControlClassName =
  "w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-l text-[0.8rem] font-medium text-display-body outline-none placeholder:text-display-subtle-03 disabled:cursor-not-allowed disabled:text-display-subtle-02 aria-invalid:text-highlight-red-75";

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      data-slot="input-group-control"
      className={cn(
        inputGroupControlClassName,
        "h-full py-lg",
        "autofill:[transition:background-color_9999s_ease-in-out_0s,color_150ms] autofill:[-webkit-text-fill-color:currentColor]",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-control"
      className={cn(
        inputGroupControlClassName,
        "field-sizing-content min-h-16 resize-none py-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
