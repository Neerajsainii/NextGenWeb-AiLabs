type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <h2 className="font-heading text-3xl font-bold tracking-tight text-textPrimary sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-base text-textSecondary sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
