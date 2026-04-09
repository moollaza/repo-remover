import clsx from "clsx";

import { analytics } from "@/utils/analytics";

interface ScrollButtonProps {
  children: React.ReactNode;
  className?: string;
  color?:
    | "danger"
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
  size?: "lg" | "md" | "sm";
  targetId: string;
  variant?:
    | "bordered"
    | "faded"
    | "flat"
    | "ghost"
    | "light"
    | "shadow"
    | "solid";
}

const scrollToID = (id: string) => {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: "smooth" });
};

const colorMap: Record<string, string> = {
  danger: "bg-danger text-white hover:bg-danger/90",
  default: "bg-default text-foreground hover:bg-default/90",
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  success: "bg-success text-white hover:bg-success/90",
  warning: "bg-warning text-foreground hover:bg-warning/90",
};

const variantMap: Record<string, Record<string, string>> = {
  bordered: {
    danger:
      "bg-transparent border-2 border-danger text-danger hover:bg-danger/10",
    default:
      "bg-transparent border-2 border-default text-default hover:bg-default/10",
    primary:
      "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
    secondary:
      "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary/10",
    success:
      "bg-transparent border-2 border-success text-success hover:bg-success/10",
    warning:
      "bg-transparent border-2 border-warning text-warning hover:bg-warning/10",
  },
  flat: {
    danger: "bg-danger/20 text-danger hover:bg-danger/30",
    default: "bg-default/20 text-default hover:bg-default/30",
    primary: "bg-primary/20 text-primary hover:bg-primary/30",
    secondary: "bg-secondary/20 text-secondary hover:bg-secondary/30",
    success: "bg-success/20 text-success hover:bg-success/30",
    warning: "bg-warning/20 text-warning hover:bg-warning/30",
  },
  ghost: {
    danger:
      "bg-transparent border-2 border-danger text-danger hover:bg-danger hover:text-white",
    default:
      "bg-transparent border-2 border-default text-default hover:bg-default hover:text-white",
    primary:
      "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white",
    secondary:
      "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary hover:text-white",
    success:
      "bg-transparent border-2 border-success text-success hover:bg-success hover:text-white",
    warning:
      "bg-transparent border-2 border-warning text-warning hover:bg-warning hover:text-white",
  },
  light: {
    danger: "bg-transparent text-danger hover:bg-danger/10",
    default: "bg-transparent text-default hover:bg-default/10",
    primary: "bg-transparent text-primary hover:bg-primary/10",
    secondary: "bg-transparent text-secondary hover:bg-secondary/10",
    success: "bg-transparent text-success hover:bg-success/10",
    warning: "bg-transparent text-warning hover:bg-warning/10",
  },
  shadow: {
    danger:
      "bg-danger text-white shadow-lg shadow-danger/40 hover:bg-danger/90",
    default:
      "bg-default text-white shadow-lg shadow-default/40 hover:bg-default/90",
    primary:
      "bg-primary text-white shadow-lg shadow-primary/40 hover:bg-primary/90",
    secondary:
      "bg-secondary text-white shadow-lg shadow-secondary/40 hover:bg-secondary/90",
    success:
      "bg-success text-white shadow-lg shadow-success/40 hover:bg-success/90",
    warning:
      "bg-warning text-white shadow-lg shadow-warning/40 hover:bg-warning/90",
  },
};

const sizeMap: Record<string, string> = {
  lg: "px-6 py-3 text-base",
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export default function ScrollButton({
  children,
  className,
  color = "primary",
  size = "lg",
  targetId,
  variant = "solid",
}: ScrollButtonProps) {
  const handleClick = () => {
    // Track "Get Started" clicks when scrolling to the token form
    if (targetId === "github-token-form") {
      analytics.trackGetStartedClick();
    }

    scrollToID(targetId);
  };

  // Build classes based on variant and color
  let variantClass: string;
  if (variant === "solid" || !variantMap[variant]) {
    variantClass = colorMap[color] ?? colorMap.primary;
  } else {
    variantClass = variantMap[variant][color];
  }

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        sizeMap[size],
        variantClass,
        className,
      )}
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  );
}
