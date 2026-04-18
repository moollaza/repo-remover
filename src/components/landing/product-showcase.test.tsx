import { describe, expect, test } from "vitest";

import { render, screen } from "@/utils/test-utils";

import { ProductShowcase } from "./product-showcase";

describe("ProductShowcase", () => {
  test("desktop screenshot reserves intrinsic dimensions", () => {
    render(<ProductShowcase />);

    const desktopImg = screen.getByAltText(
      /repo remover dashboard showing repository management/i,
    );
    expect(desktopImg).toHaveAttribute("width", "1280");
    expect(desktopImg).toHaveAttribute("height", "732");
    expect(desktopImg).toHaveAttribute("loading", "lazy");
    expect(desktopImg).toHaveAttribute("decoding", "async");
  });

  test("mobile screenshot reserves intrinsic dimensions", () => {
    render(<ProductShowcase />);

    const mobileImg = screen.getByAltText(/repo remover dashboard on mobile/i);
    expect(mobileImg).toHaveAttribute("width", "390");
    expect(mobileImg).toHaveAttribute("height", "844");
    expect(mobileImg).toHaveAttribute("loading", "lazy");
    expect(mobileImg).toHaveAttribute("decoding", "async");
  });
});
