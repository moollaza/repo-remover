import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { act, render, screen, waitFor } from "@/utils/test-utils";

import {
  GetStartedSection,
  PRELOAD_GET_STARTED_FORM_EVENT,
} from "./get-started-section";

describe("GetStartedSection", () => {
  async function renderAndPreloadForm() {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(<GetStartedSection />);

    try {
      await waitFor(() => {
        expect(
          addEventListenerSpy.mock.calls.some(
            ([eventName]) => eventName === PRELOAD_GET_STARTED_FORM_EVENT,
          ),
        ).toBe(true);
      });

      await act(async () => {
        window.dispatchEvent(new Event(PRELOAD_GET_STARTED_FORM_EVENT));
      });
    } finally {
      addEventListenerSpy.mockRestore();
    }
  }

  async function findTokenInput() {
    return screen.findByTestId("github-token-input", undefined, {
      timeout: 6000,
    });
  }

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
    await renderAndPreloadForm();

    const input = await findTokenInput();
    expect(input).toHaveAttribute("type", "password");
  });

  test("shows visibility toggle after typing a token", async () => {
    const user = userEvent.setup();

    await renderAndPreloadForm();

    const input = await findTokenInput();

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
    const user = userEvent.setup();

    await renderAndPreloadForm();

    const input = await findTokenInput();
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
