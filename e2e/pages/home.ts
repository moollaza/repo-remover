import { mockOctokitInit } from "@e2e/utils/github-api-mocks";
import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base-page";

export class HomePage extends BasePage {
  readonly rememberCheckbox: Locator;
  readonly tokenFormInput: Locator;
  readonly tokenFormSubmit: Locator;

  constructor(page: Page) {
    super(page);
    this.rememberCheckbox = page.getByTestId("github-token-remember");
    this.tokenFormInput = page.getByTestId("github-token-input");
    this.tokenFormSubmit = page.getByTestId("github-token-submit");
  }

  async clearToken() {
    await this.tokenFormInput.clear();
  }

  async expectErrorMessage(message: string) {
    // The inline form renders errors as a <p> with text-danger class
    await expect(this.page.getByText(message)).toBeVisible({ timeout: 5000 });
  }

  async expectHeading(text: string) {
    await expect(this.page.getByRole("heading", { level: 1 })).toContainText(
      text,
    );
  }

  async expectSubmitDisabled() {
    await expect(this.tokenFormSubmit).toBeDisabled();
  }

  async expectSubmitEnabled() {
    await expect(this.tokenFormSubmit).toBeEnabled();
  }

  async fillToken(token: string) {
    // Scroll to the form first since it's far down the page
    await this.waitForTokenForm();
    await this.tokenFormInput.fill(token);
  }

  /**
   * The PAT form is lazy-loaded — dispatching the preload event or scrolling
   * into view triggers hydration. We do both so the waiting is deterministic.
   */
  async waitForTokenForm() {
    await this.page.evaluate(() => {
      window.dispatchEvent(new Event("preload-get-started-form"));
    });
    await this.tokenFormInput.scrollIntoViewIfNeeded();
    await expect(this.tokenFormInput).toBeVisible({ timeout: 5000 });
  }

  // Override the base method to use the default path
  async goto(path = "/") {
    await this.page.goto(path);
  }

  async setupMocks() {
    await mockOctokitInit(this.page);
  }

  async submit() {
    await this.tokenFormSubmit.click();
  }

  async toggleRememberMe() {
    await this.rememberCheckbox.click();
  }
}
