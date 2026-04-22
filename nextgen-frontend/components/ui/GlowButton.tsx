import { cn } from "@/lib/cn";

type GlowButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asLink?: boolean;
};

export function GlowButton({ className, children, ...props }: GlowButtonProps) {
  return (
    <button
      className={cn(
        "rounded-full border border-cyan-300/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-textPrimary transition duration-300 hover:scale-[1.02] hover:shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
