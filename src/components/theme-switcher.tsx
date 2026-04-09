import { Moon as MoonIcon, Sun as SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        aria-label="Theme switcher loading"
        className="text-default-500"
        size="icon"
        variant="ghost"
      >
        <SunIcon className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="text-default-500"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      {isDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </Button>
  );
};
