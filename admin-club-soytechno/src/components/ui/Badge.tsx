import { cn } from "@/lib/utils";
import { NivelFidelizacion, NIVELES_INFO } from "@/types";

interface BadgeProps {
  nivel: NivelFidelizacion;
  className?: string;
}

export function NivelBadge({ nivel, className }: BadgeProps) {
  const info = NIVELES_INFO[nivel];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        info.bgColor,
        info.color,
        className
      )}
    >
      {nivel}
    </span>
  );
}

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusStyles = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
