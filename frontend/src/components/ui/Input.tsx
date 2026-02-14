import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={`w-full rounded-[var(--radius-md)] border bg-white px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-slate-400 focus-visible:outline-none ${error ? "border-red-300" : "border-[var(--color-border)]"} ${className}`}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </>
    );
  },
);

Input.displayName = "Input";

export default Input;
