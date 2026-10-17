import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { PiX } from "react-icons/pi";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type AppDialogSize = "sm" | "md" | "lg" | "xl" | "full";
type AppDialogPosition = "center" | "top" | "bottom" | "left" | "right";
type AppDialogIconTone = "brand" | "inverse" | "neutral";

const sizeClassName: Record<AppDialogSize, string> = {
  sm: "sm:max-w-101.5",
  md: "sm:max-w-126.5",
  lg: "sm:max-w-152",
  xl: "sm:max-w-2xl",
  full: "h-[calc(100%-2rem)] sm:max-w-[calc(100%-2rem)]",
};

const positionClassName: Record<AppDialogPosition, string> = {
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  top: "top-4 left-1/2 -translate-x-1/2",
  bottom: "bottom-4 left-1/2 -translate-x-1/2",
  left: "top-1/2 left-4 -translate-y-1/2",
  right: "top-1/2 right-4 -translate-y-1/2",
};

const iconToneClassName: Record<AppDialogIconTone, string> = {
  brand: "bg-highlight-orange-25 text-btn-primary",
  inverse: "bg-btn-primary-inverse text-white",
  neutral: "bg-surface-level-00 text-icon-default",
};

type AppDialogProps = {
  // Trigger: pass `trigger` for a custom element, or `triggerText`/`triggerIcon`
  // for a default Button. Omit all to control the dialog with `open`.
  trigger?: React.ReactElement;
  triggerText?: React.ReactNode;
  triggerIcon?: React.ReactNode;
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  triggerDisabled?: boolean;
  triggerClassName?: string;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean | "trap-focus";
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  finalFocusRef?: React.RefObject<HTMLElement | null>;

  title?: React.ReactNode;
  // Rendered under the title (e.g. an address subtitle).
  description?: React.ReactNode;
  // Circular badge shown left of the title.
  icon?: React.ReactNode;
  iconTone?: AppDialogIconTone;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;

  size?: AppDialogSize;
  position?: AppDialogPosition;
  headerDivider?: boolean;
  footerDivider?: boolean;
  showCloseButton?: boolean;

  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
};

function AppDialog({
  trigger,
  triggerText,
  triggerIcon,
  triggerVariant = "default",
  triggerSize = "default",
  triggerDisabled = false,
  triggerClassName,
  open,
  defaultOpen,
  onOpenChange,
  modal = true,
  initialFocusRef,
  finalFocusRef,
  title,
  description,
  icon,
  iconTone = "brand",
  headerActions,
  children,
  footer,
  size = "md",
  position = "center",
  headerDivider = true,
  footerDivider = true,
  showCloseButton = true,
  overlayClassName,
  contentClassName,
  headerClassName,
  iconClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  footerClassName,
  closeButtonClassName,
}: AppDialogProps) {
  const hasTrigger = Boolean(trigger || triggerText || triggerIcon);
  const hasHeader = Boolean(title || icon || headerActions || showCloseButton);

  return (
    <Dialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      {hasTrigger && (
        <DialogTrigger
          className={triggerClassName}
          render={
            trigger ?? (
              <Button
                variant={triggerVariant}
                size={triggerSize}
                disabled={triggerDisabled}
              />
            )
          }
        >
          {trigger ? undefined : (
            <>
              {triggerIcon}
              {triggerText}
            </>
          )}
        </DialogTrigger>
      )}

      <DialogPortal>
        <DialogOverlay className={overlayClassName} />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          initialFocus={initialFocusRef}
          finalFocus={finalFocusRef}
          className={cn(
            "fixed z-50 flex max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] flex-col overflow-clip rounded-16 border border-border-00 bg-surface-base text-sm text-display-body duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            positionClassName[position],
            sizeClassName[size],
            contentClassName,
          )}
        >
          {hasHeader && (
            <DialogHeader
              className={cn(
                "shrink-0 flex-row items-center gap-2 px-4 py-3",
                !headerDivider && "border-none pb-0",
                headerClassName,
              )}
            >
              {icon && (
                <span
                  data-slot="dialog-icon"
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface-level-00 [&_svg:not([class*='size-'])]:size-5",
                    iconToneClassName[iconTone],
                    iconClassName,
                  )}
                >
                  {icon}
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0">
                {title &&
                  (typeof title === "string" ? (
                    <DialogTitle
                      className={cn(
                        "text-base font-semibold text-display-subtext-01",
                        titleClassName,
                      )}
                    >
                      {title}
                    </DialogTitle>
                  ) : (
                    title
                  ))}
                {description && (
                  <DialogDescription
                    className={cn(
                      "text-[0.625rem] text-display-subtle-01",
                      descriptionClassName,
                    )}
                  >
                    {description}
                  </DialogDescription>
                )}
              </div>
              {(headerActions || showCloseButton) && (
                <div className="flex shrink-0 items-center gap-2">
                  {headerActions}
                  {showCloseButton && (
                    <DialogClose
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={cn("text-icon-nav hover:bg-surface-level-00 rounded-full cursor-pointer", closeButtonClassName)}
                        />
                      }
                    >
                      <PiX className="size-4.5 text-icon-nav" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  )}
                </div>
              )}
            </DialogHeader>
          )}

          {children && (
            // The body is the only scroll region, so header and footer stay put.
            <div
              data-slot="dialog-body"
              className={cn(
                "min-h-0 flex-1 overflow-y-auto px-5 py-4",
                bodyClassName,
              )}
            >
              {children}
            </div>
          )}

          {footer && (
            <DialogFooter
              className={cn(
                "shrink-0 px-5 py-4",
                !footerDivider && "border-none pt-0",
                footerClassName,
              )}
            >
              {footer}
            </DialogFooter>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

export { AppDialog };
export type { AppDialogProps };
