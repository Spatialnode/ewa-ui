"use client";

import { Loader2Icon, XIcon } from "lucide-react";
import * as React from "react";
import { BiSolidErrorAlt } from "react-icons/bi";
import {
  PiCheckCircleFill,
  PiWarningCircleFill,
  PiWarningFill,
} from "react-icons/pi";
import { Toaster as Sonner, toast, type ToasterProps } from "sonner";

type Theme = NonNullable<ToasterProps["theme"]>;

function getDocumentTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  return "system";
}

function useDocumentTheme(): Theme {
  const [theme, setTheme] = React.useState<Theme>(getDocumentTheme);

  React.useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getDocumentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function Toaster({ theme: themeProp, ...props }: ToasterProps) {
  const documentTheme = useDocumentTheme();

  return (
    <Sonner
      theme={themeProp ?? documentTheme}
      icons={{
        success: (
          <PiCheckCircleFill className="size-6 fill-highlight-green-75" />
        ),
        info: (
          <PiWarningCircleFill className="size-6 fill-highlight-orange-75" />
        ),
        warning: <PiWarningFill className="size-6 fill-highlight-orange-75" />,
        error: <BiSolidErrorAlt className="size-6 fill-btn-danger" />,
        loading: <Loader2Icon className="size-6 animate-spin" />,
        close: <XIcon className="size-4" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface-base)",
          "--normal-text": "var(--display-02)",
          "--normal-border": "var(--border-01)",
          "--border-radius": "var(--radius-18)",
          "--width": "22.43rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "shadow-popover !gap-3 !py-3 !px-2 !pl-3",
          icon: "!m-0 !size-5.5",
          title: "!text-sm !font-semibold",
          content: "flex-1",
          description: "!text-display-subtle-01",
          actionButton:
            "!h-6.5 !rounded-8 !bg-btn-tertiary !px-3 !text-sm !font-medium !text-btn-primary-text-inverse transition-colors hover:!opacity-80",
          closeButton:
            "!static !order-last !size-6 !shrink-0 !transform-none !rounded-full !border-0 !bg-transparent !text-inherit transition-opacity hover:!opacity-80",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
export type { ToasterProps };
