"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { PiX } from "react-icons/pi";
import { cn } from "@/lib/utils";

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />;
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverContent({
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  collisionPadding = 16,
  className,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "collisionPadding"
  >) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "flex max-h-[calc(100vh-2rem)] w-72.5 flex-col overflow-hidden rounded-12 border border-border-01 bg-surface-base text-display-body shadow-popover outline-none transition-[opacity,transform] duration-150 ease-out data-starting-style:-translate-y-1 data-starting-style:opacity-0 data-ending-style:-translate-y-1 data-ending-style:opacity-0",
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPortal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn(
        "flex items-center justify-between border-b border-border-00 px-2.5 py-2",
        className,
      )}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-xs font-medium text-display-02", className)}
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-xs text-display-body", className)}
      {...props}
    />
  );
}

// Icon-only close control for the header. Pass a translated `aria-label` where needed.
function PopoverCloseButton({
  className,
  children,
  "aria-label": ariaLabel = "Close",
  ...props
}: PopoverPrimitive.Close.Props) {
  return (
    <PopoverPrimitive.Close
      data-slot="popover-close-button"
      aria-label={ariaLabel}
      className={cn(
        "cursor-pointer rounded-full p-0.5 text-icon-default outline-none hover:bg-surface-level-00 focus-visible:ring-2 focus-visible:ring-border-01",
        className,
      )}
      {...props}
    >
      {children ?? <PiX className="size-4" />}
    </PopoverPrimitive.Close>
  );
}

function PopoverBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-body"
      className={cn(
        "flex min-h-0 flex-col gap-5 overflow-y-auto p-3",
        className,
      )}
      {...props}
    />
  );
}

function PopoverFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-footer"
      className={cn(
        "flex items-center justify-between border-t border-border-00 p-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverCloseButton,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPortal,
  PopoverTitle,
  PopoverTrigger,
};
