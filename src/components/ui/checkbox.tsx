import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-default-300 bg-background transition-colors outline-none",
        "hover:border-default-400",
        "focus-visible:border-[var(--brand-blue)] focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-checked:border-[var(--brand-blue)] data-checked:bg-[var(--brand-blue)] data-checked:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3"
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
