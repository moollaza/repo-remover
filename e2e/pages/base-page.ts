import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
  readonly footer: Locator;
  readonly footerLinks: Locator;
  readonly navbar: Locator;
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
    this.navbar = page.getByTestId("navbar");
    this.footer = page.getByTestId("footer");
    this.footerLinks = this.footer.getByRole("link");
  }

  // Header assertions
  async expectBrandVisible() {
    await expect(
      this.navbar.getByRole("link", { name: "Repo Remover" }),
    ).toBeVisible();
  }

  async expectDashboardButtonNotVisible() {
    await expect(this.page.getByText("Go to Dashboard")).not.toBeVisible();
  }

  async expectDashboardButtonVisible() {
    await expect(this.page.getByText("Go to Dashboard")).toBeVisible();
  }

  async expectFooterCopyright() {
    await expect(
      this.page.getByText(/© 2019-2026 Repo Remover/).first(),
    ).toBeVisible();
  }

  // Footer assertions
  async expectFooterLink(text: string, href: string) {
    const link = this.footer.getByRole("link", { exact: true, name: text });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }

  async expectFooterSectionHeading(text: string) {
    await expect(this.footer.getByText(text)).toBeVisible();
  }

  async expectNavLinkNotVisible(name: string) {
    await expect(this.navbar.getByRole("link", { name })).not.toBeVisible();
  }

  async expectNavLinkVisible(name: string) {
    await expect(this.navbar.getByRole("link", { name })).toBeVisible();
  }

  async expectUserProfileNotVisible(name: string, login: string) {
    await expect(this.page.getByText(name)).not.toBeVisible();
    await expect(this.page.getByText(login)).not.toBeVisible();
  }

  async expectUserProfileVisible(name: string, login: string) {
    // Scope to navbar to avoid matching owner column in table
    await expect(this.navbar.getByText(name)).toBeVisible();
    await expect(this.navbar.getByText(login)).toBeVisible();
  }

  // Navigation methods
  async goto(path = "/") {
    await this.page.goto(path);
  }

  async logout() {
    // Open user dropdown and click logout
    await this.page.getByText("Test User").click();
    await this.page.getByText("Log Out").click();
    await expect(this.page).toHaveURL("/");
  }

  async verifyCommonFooterElements() {
    // Brand — scoped to footer, use first() since it appears in brand section
    await expect(this.footer.getByText("Repo Remover").first()).toBeVisible();

    // Author link
    await this.expectFooterLink("Zaahir Moolla", "https://zaahir.ca");

    // Copyright (desktop + mobile versions exist, use first visible)
    await expect(
      this.page.getByText(/© 2019-2026 Repo Remover/).first(),
    ).toBeVisible();

    // GitHub link
    await this.expectFooterLink(
      "GitHub",
      "https://github.com/moollaza/repo-remover",
    );

    // Section headings
    await this.expectFooterSectionHeading("Product");
    await this.expectFooterSectionHeading("Resources");

    // Product links
    await this.expectFooterLink("Features", "#features");
    await this.expectFooterLink("How It Works", "#how-it-works");
    await this.expectFooterLink("Get Started", "#get-started");

    // Resources links
    await this.expectFooterLink(
      "Bluesky",
      "https://bsky.app/profile/reporemover.xyz",
    );
    await this.expectFooterLink(
      "Feedback",
      "mailto:hello@reporemover.xyz?subject=Repo%20Remover%20Feedback",
    );
  }
}
