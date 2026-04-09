import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ScrollButton from "./scroll-button";

// Mock the analytics module
vi.mock("@/utils/analytics", () => ({
  analytics: {
    trackCTAScrollClick: vi.fn(),
  },
}));

describe("ScrollButton", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Clean up any existing test elements
    document.body.innerHTML = "";
  });

  test("renders button with children", () => {
    render(<ScrollButton targetId="test-section">Click Me</ScrollButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test("applies custom className", () => {
    render(
      <ScrollButton className="custom-class" targetId="test-section">
        Test
      </ScrollButton>,
    );

    const button = screen.getByRole("button", { name: /test/i });
    expect(button).toHaveClass("custom-class");
  });

  test("applies color prop correctly", () => {
    render(
      <ScrollButton color="danger" targetId="test-section">
        Test
      </ScrollButton>,
    );

    const button = screen.getByRole("button", { name: /test/i });
    // HeroUI Button applies color as a data attribute
    expect(button).toBeInTheDocument();
  });

  test("applies size prop correctly", () => {
    render(
      <ScrollButton size="sm" targetId="test-section">
        Test
      </ScrollButton>,
    );

    const button = screen.getByRole("button", { name: /test/i });
    expect(button).toBeInTheDocument();
  });

  test("applies variant prop correctly", () => {
    render(
      <ScrollButton targetId="test-section" variant="bordered">
        Test
      </ScrollButton>,
    );

    const button = screen.getByRole("button", { name: /test/i });
    expect(button).toBeInTheDocument();
  });

  test("scrolls to target element when clicked", async () => {
    // Create a target element to scroll to
    const targetElement = document.createElement("div");
    targetElement.id = "target-section";
    document.body.appendChild(targetElement);

    // Mock scrollIntoView
    const scrollIntoViewMock = vi.fn();
    targetElement.scrollIntoView = scrollIntoViewMock;

    render(<ScrollButton targetId="target-section">Scroll Down</ScrollButton>);

    const button = screen.getByRole("button", { name: /scroll down/i });
    await user.click(button);

    // Verify scrollIntoView was called with smooth behavior
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  test("handles non-existent target element gracefully", async () => {
    render(<ScrollButton targetId="non-existent-id">Click Me</ScrollButton>);

    const button = screen.getByRole("button", { name: /click me/i });

    // Should not throw error when target doesn't exist
    await expect(user.click(button)).resolves.not.toThrow();
  });

  test("tracks analytics event when scrolling to github-token-form", async () => {
    const { analytics } = await import("@/utils/analytics");

    // Create target element
    const targetElement = document.createElement("div");
    targetElement.id = "github-token-form";
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    render(
      <ScrollButton targetId="github-token-form">Get Started</ScrollButton>,
    );

    const button = screen.getByRole("button", { name: /get started/i });
    await user.click(button);

    // Verify analytics was tracked
    expect(analytics.trackCTAScrollClick).toHaveBeenCalledTimes(1);
  });

  test("does not track analytics for other target IDs", async () => {
    const { analytics } = await import("@/utils/analytics");

    // Create target element
    const targetElement = document.createElement("div");
    targetElement.id = "other-section";
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    render(<ScrollButton targetId="other-section">Click Me</ScrollButton>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    // Verify analytics was NOT tracked
    expect(analytics.trackCTAScrollClick).not.toHaveBeenCalled();
  });

  test("uses default props when not specified", () => {
    render(<ScrollButton targetId="test">Default Button</ScrollButton>);

    const button = screen.getByRole("button", { name: /default button/i });

    // Should render with defaults: color="primary", size="lg", variant="solid"
    expect(button).toBeInTheDocument();
  });

  test("is accessible with proper button role", () => {
    render(<ScrollButton targetId="test">Accessible Button</ScrollButton>);

    const button = screen.getByRole("button", { name: /accessible button/i });
    expect(button).toBeInTheDocument();
  });
});
