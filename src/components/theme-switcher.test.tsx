import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let mockTheme = "light";
const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: mockSetTheme, theme: mockTheme }),
}));

vi.mock("lucide-react", () => ({
  Moon: () => <span data-testid="moon-icon" />,
  Sun: () => <span data-testid="sun-icon" />,
}));

import { ThemeSwitcher } from "./theme-switcher";

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    mockTheme = "light";
    mockSetTheme.mockClear();
  });

  it("renders button with 'Switch to dark theme' label in light mode", () => {
    render(<ThemeSwitcher />);
    expect(
      screen.getByRole("button", { name: /switch to dark theme/i }),
    ).toBeInTheDocument();
  });

  it("shows moon icon in light mode", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("renders button with 'Switch to light theme' label in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeSwitcher />);
    expect(
      screen.getByRole("button", { name: /switch to light theme/i }),
    ).toBeInTheDocument();
  });

  it("shows sun icon in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeSwitcher />);
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
  });

  it("calls setTheme with 'dark' when clicked in light mode", () => {
    render(<ThemeSwitcher />);
    fireEvent.click(
      screen.getByRole("button", { name: /switch to dark theme/i }),
    );
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme with 'light' when clicked in dark mode", () => {
    mockTheme = "dark";
    render(<ThemeSwitcher />);
    fireEvent.click(
      screen.getByRole("button", { name: /switch to light theme/i }),
    );
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
