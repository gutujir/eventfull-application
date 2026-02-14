import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
}

const Card = ({
  children,
  className = "",
  elevated = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={`rounded-lg border border-(--color-border) bg-white ${elevated ? "shadow-(--shadow-elevated)" : "shadow-(--shadow-soft)"} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
