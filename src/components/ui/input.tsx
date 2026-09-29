import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { PiEyeFill, PiEyeSlashFill } from "react-icons/pi";
import { cn } from "@/lib/utils";

function Input({
  className,
  iconClassName,
  type,
  ...props
}: React.ComponentProps<"input"> & { iconClassName?: string }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";

  const input = (
    <InputPrimitive
      type={isPassword && showPassword ? "text" : type}
      data-slot="input"
      className={cn(
        "h-11.25 w-full min-w-0 rounded-14 border-0 bg-surface-level-00 px-l py-lg text-[0.8rem] text-display-body font-medium transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-surface-level-00 file:text-sm file:font-medium file:text-foreground placeholder:text-display-subtle-03 focus-visible:ring-highlight-grey-50 focus-visible:ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-level-00 disabled:opacity-50 disabled:text-display-subtle-02 aria-invalid:ring-1 aria-invalid:ring-highlight-red-75  aria-invalid:text-highlight-red-75",
        isPassword && "pr-10",
        className,
      )}
      {...props}
    />
  );

  if (!isPassword) return input;

  return (
    <div data-slot="input-wrapper" className="relative w-full">
      {input}
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
          <PiEyeSlashFill className={cn("size-4 text-black", iconClassName)} />
        )}
      </button>
    </div>
  );
}

export { Input };
