import {
  ChevronDown as ChevronDownIcon,
  Search as MagnifyingGlassIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PER_PAGE_OPTIONS,
  REPO_ACTIONS,
  REPO_TYPES,
} from "@/config/repo-config";
import { type Selection, type SelectionSet } from "@/hooks/use-repo-filters";

export interface RepoFiltersProps {
  onPerPageChange: (keys: Selection) => void;
  onRepoActionChange: (keys: Selection) => void;
  onRepoActionClick: () => void;
  onRepoTypesFilterChange: (keys: Selection) => void;
  onSearchChange: (value: string) => void;
  perPage: number;
  repoTypesFilter: SelectionSet;
  searchQuery: string;
  selectedRepoAction: SelectionSet;
  selectedRepoKeys: Selection;
}

export { type SelectionSet } from "@/hooks/use-repo-filters";

export default function RepoFilters({
  onPerPageChange,
  onRepoActionChange,
  onRepoActionClick,
  onRepoTypesFilterChange,
  onSearchChange,
  perPage,
  repoTypesFilter,
  searchQuery,
  selectedRepoAction,
  selectedRepoKeys,
}: RepoFiltersProps): JSX.Element {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isDisabled = selectedRepoKeys !== "all" && selectedRepoKeys.size === 0;

  const isDeleteAction = selectedRepoAction.has("delete");

  // Summarize selected repo types for the trigger button
  const selectedTypeLabels = REPO_TYPES.filter((t) =>
    repoTypesFilter.has(t.key),
  ).map((t) => t.label);
  const typesSummary =
    selectedTypeLabels.length === REPO_TYPES.length
      ? "All"
      : selectedTypeLabels.length === 0
        ? "None"
        : selectedTypeLabels.join(", ");

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
      {/* PER PAGE SELECTOR */}
      <div className="w-full md:w-20">
        <Select
          value={perPage}
          onValueChange={(value: number | null) => {
            if (value != null) onPerPageChange(new Set([value.toString()]));
          }}
        >
          <SelectTrigger
            className="w-full h-10 border-divider bg-content1 text-foreground hover:bg-content2"
            data-testid="per-page-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} align="start">
            {PER_PAGE_OPTIONS.map((option) => (
              <SelectItem
                key={option}
                value={option}
                data-testid={`per-page-option-${option}`}
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* REPO TYPE SELECTOR */}
      <div className="w-full md:w-44 md:flex-shrink-0">
        <Select
          multiple
          value={Array.from(repoTypesFilter)}
          onValueChange={(values: string[]) => {
            onRepoTypesFilterChange(new Set(values));
          }}
        >
          <SelectTrigger
            className="w-full h-10 border-divider bg-content1 text-foreground hover:bg-content2"
            data-testid="repo-type-select"
          >
            <SelectValue placeholder="Types">{() => typesSummary}</SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {REPO_TYPES.map((repoType) => (
              <SelectItem
                key={repoType.key}
                value={repoType.key}
                data-testid={`repo-type-select-item-${repoType.key}`}
              >
                {repoType.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SEARCH INPUT */}
      <div className="w-full md:flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-default-400" />
          </div>
          <Input
            aria-label="Search"
            className="h-10 pl-10 pr-16 bg-content1 text-foreground text-sm placeholder:text-default-400 border-divider"
            data-testid="repo-search-input"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or description"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-divider bg-content2 text-default-500 text-xs font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="w-full md:w-auto md:flex-shrink-0">
        <ButtonGroup className="w-full md:w-auto">
          <Button
            className="flex-1 md:flex-initial"
            data-testid={`repo-action-button-${isDeleteAction ? "delete" : "archive"}`}
            disabled={isDisabled}
            onClick={onRepoActionClick}
            variant={isDeleteAction ? "destructive" : "warning"}
          >
            {REPO_ACTIONS.find((action) => selectedRepoAction.has(action.key))
              ?.label ?? "Select Action"}
          </Button>
          <ButtonGroupSeparator className="bg-white/20" />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: isDeleteAction ? "destructive" : "warning",
                size: "icon",
              })}
              data-testid="repo-action-dropdown-trigger"
            >
              <ChevronDownIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-72"
              data-testid="repo-action-dropdown-menu"
            >
              <DropdownMenuRadioGroup
                value={Array.from(selectedRepoAction)[0] || "archive"}
                onValueChange={(value) => {
                  onRepoActionChange(new Set([value]));
                }}
              >
                {REPO_ACTIONS.map((action) => (
                  <DropdownMenuRadioItem
                    className="flex flex-col items-start gap-0 py-2"
                    data-testid={`repo-action-dropdown-item-${action.key}`}
                    key={action.key}
                    value={action.key}
                  >
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonGroup>
      </div>
    </div>
  );
}
