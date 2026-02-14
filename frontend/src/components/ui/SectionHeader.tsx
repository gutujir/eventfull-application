interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

const SectionHeader = ({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: SectionHeaderProps) => {
  const alignment = align === "center" ? "text-center" : "text-left";

  return (
    <div className={alignment}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-sm text-[var(--color-text-muted)] sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export default SectionHeader;
