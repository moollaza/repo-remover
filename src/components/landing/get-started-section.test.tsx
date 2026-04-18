import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { render, screen, waitFor } from "@/utils/test-utils";

import {
  GetStartedSection,
  PRELOAD_GET_STARTED_FORM_EVENT,
} from "./get-started-section";

describe("GetStartedSection", () => {
  const user = userEvent.setup();

  test("renders the section heading", () => {
    render(<GetStartedSection />);

    expect(
      screen.getByRole("heading", { name: /get started/i }),
    ).toBeInTheDocument();
  });

  test("renders a stable-height fallback before the form loads", () => {
    render(<GetStartedSection />);

    expect(screen.getByTestId("get-started-form-fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("github-token-input")).not.toBeInTheDocument();
  });

  test("loads the form when the preload event fires", async () => {
    render(<GetStartedSection />);

    window.dispatchEvent(new Event(PRELOAD_GET_STARTED_FORM_EVENT));

    const input = await screen.findByTestId("github-token-input");
    expect(input).toHaveAttribute("type", "password");
  });

  test("shows visibility toggle after typing a token", async () => {
    render(<GetStartedSection />);

    window.dispatchEvent(new Event(PRELOAD_GET_STARTED_FORM_EVENT));

    const input = await screen.findByTestId("github-token-input");

    expect(
      screen.queryByRole("button", { name: /show token/i }),
    ).not.toBeInTheDocument();

    await user.type(input, "ghp_test");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /show token/i }),
      ).toBeInTheDocument(),
    );
  });

  test("toggles token visibility when eye button is clicked", async () => {
    render(<GetStartedSection />);

    window.dispatchEvent(new Event(PRELOAD_GET_STARTED_FORM_EVENT));

    const input = await screen.findByTestId("github-token-input");
    await user.type(input, "ghp_test");

    expect(input).toHaveAttribute("type", "password");

    await user.click(
      await screen.findByRole("button", { name: /show token/i }),
    );
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /hide token/i }));
    expect(input).toHaveAttribute("type", "password");
  });
});
