import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about the design system's numeric radius scale
// (`rounded-8`, `rounded-14`, …, see `--radius-*` in styles.css) so a
// `rounded-*` passed via `className` replaces the component's default instead
// of both classes landing in the DOM and fighting on CSS order.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: [(value: string) => /^\d+$/.test(value)],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
