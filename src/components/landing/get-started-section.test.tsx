import { render, screen } from "@/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { GetStartedSection } from "./get-started-section";

describe("GetStartedSection", () => {
  const user = userEvent.setup();

  test("renders the section heading", () => {
    render(<GetStartedSection />);

    expect(
      screen.getByRole("heading", { name: /get started/i }),
    ).toBeInTheDocument();
  });

  test("renders token input as password type by default", () => {
    render(<GetStartedSection />);

    const input = screen.getByTestId("github-token-input");
    expect(input).toHaveAttribute("type", "password");
  });

  test("shows visibility toggle after typing a token", async () => {
    render(<GetStartedSection />);

    const input = screen.getByTestId("github-token-input");

    // No toggle before typing
    expect(
      screen.queryByRole("button", { name: /show token/i }),
    ).not.toBeInTheDocument();

    // Type something
    await user.type(input, "ghp_test");

    // Toggle should appear
    expect(
      screen.getByRole("button", { name: /show token/i }),
    ).toBeInTheDocument();
  });

  test("toggles token visibility when eye button is clicked", async () => {
    render(<GetStartedSection />);

    const input = screen.getByTestId("github-token-input");
    await user.type(input, "ghp_test");

    // Default: password
    expect(input).toHaveAttribute("type", "password");

    // Click show
    await user.click(screen.getByRole("button", { name: /show token/i }));
    expect(input).toHaveAttribute("type", "text");

    // Click hide
    await user.click(screen.getByRole("button", { name: /hide token/i }));
    expect(input).toHaveAttribute("type", "password");
  });
});
