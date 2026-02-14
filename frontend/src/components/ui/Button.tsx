import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-(--color-brand) text-white border border-(--color-brand) hover:bg-(--color-brand-hover)",
  secondary:
    "bg-white text-(--color-text) border border-(--color-border) hover:border-(--color-brand) hover:text-(--color-brand)",
  danger: "bg-red-600 text-white border border-red-600 hover:bg-red-700",
  ghost:
    "bg-transparent text-(--color-text-muted) border border-transparent hover:bg-slate-100 hover:text-(--color-text)",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-sm",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-11 px-5 text-base rounded-md",
};

const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`motion-press inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {!loading && leftIcon ? leftIcon : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
