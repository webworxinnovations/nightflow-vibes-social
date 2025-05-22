
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowEffect?: boolean;
}

export function GlassmorphicCard({
  children,
  className,
  hoverEffect = false,
  glowEffect = false,
  ...props
}: GlassmorphicCardProps) {
  return (
    <div
      className={cn(
        "glassmorphism rounded-xl p-4 transition-all duration-300",
        hoverEffect && "hover:-translate-y-1 hover:shadow-lg",
        glowEffect && "animate-pulse-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
