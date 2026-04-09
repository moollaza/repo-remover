import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
      </div>
      <span className="text-base sm:text-lg font-bold text-foreground whitespace-nowrap">
        Repo Remover
      </span>
    </div>
  );
}
