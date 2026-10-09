import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import {
  PiEyeFill,
  PiEyeSlashFill,
  PiMagnifyingGlassFill,
} from "react-icons/pi";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  iconClassName?: string;
  leftIcon?: React.ReactNode;
  leftIconClassName?: string;
};

function Input({
  className,
  iconClassName,
  leftIcon,
  leftIconClassName,
  type,
  placeholder,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";
  const isSearch = type === "search";
  const resolvedLeftIcon =
    leftIcon === undefined && isSearch ? <PiMagnifyingGlassFill /> : leftIcon;
  const hasLeftIcon = resolvedLeftIcon != null;

  const input = (
    <InputPrimitive
      type={isPassword && showPassword ? "text" : type}
      data-slot="input"
      placeholder={placeholder ?? (isSearch ? "Search" : undefined)}
      className={cn(
        "h-11.25 w-full min-w-0 rounded-14 border-0 bg-surface-level-00 px-l py-lg text-[0.8rem] text-display-body font-medium transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-surface-level-00 file:text-sm file:font-medium file:text-foreground placeholder:text-display-subtle-03 focus-visible:ring-highlight-grey-50 focus-visible:ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-level-00 disabled:opacity-50 disabled:text-display-subtle-02 aria-invalid:ring-1 aria-invalid:ring-highlight-red-75  aria-invalid:text-highlight-red-75",
        isPassword && "pr-10",
        hasLeftIcon && "pl-8",
        isSearch &&
          "rounded-full [&::-webkit-search-cancel-button]:appearance-none",
        className,
      )}
      {...props}
    />
  );

  if (!isPassword && !hasLeftIcon) return input;

  return (
    <div data-slot="input-wrapper" className="relative w-full">
      {hasLeftIcon && (
        <span
          data-slot="input-icon"
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-display-02 [&_svg]:size-4",
            props.disabled && "opacity-50",
            leftIconClassName,
          )}
        >
          {resolvedLeftIcon}
        </span>
      )}
      {input}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-display-subtle-03 transition-colors outline-none hover:text-display-body focus-visible:text-display-body disabled:pointer-events-none disabled:opacity-50"
        >
          {showPassword ? (
            <PiEyeFill className={cn("size-4 text-black", iconClassName)} />
          ) : (
            <PiEyeSlashFill
              className={cn("size-4 text-black", iconClassName)}
            />
          )}
        </button>
      )}
    </div>
  );
}

export { Input };
