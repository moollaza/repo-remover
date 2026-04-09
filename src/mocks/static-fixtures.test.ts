import { describe, expect, it } from "vitest";

import { createMockRepo } from "./static-fixtures";

describe("createMockRepo", () => {
  it("should derive owner from ownerType when set to organization", () => {
    const repo = createMockRepo({ ownerType: "organization" });

    expect(repo.ownerType).toBe("organization");
    expect(repo.owner.id).toBe("org-456789");
    expect(repo.owner.login).toBe("testorg");
    expect(repo.owner.url).toBe("https://github.com/testorg");
  });

  it("should use personal owner for current-user ownerType", () => {
    const repo = createMockRepo({ ownerType: "current-user" });

    expect(repo.ownerType).toBe("current-user");
    expect(repo.owner.id).toBe("user-123456");
    expect(repo.owner.login).toBe("testuser");
    expect(repo.owner.url).toBe("https://github.com/testuser");
  });

  it("should default to personal owner when no ownerType specified", () => {
    const repo = createMockRepo();

    expect(repo.owner.id).toBe("user-123456");
    expect(repo.owner.login).toBe("testuser");
  });

  it("should allow explicit owner override to take precedence", () => {
    const repo = createMockRepo({
      owner: {
        id: "custom-id",
        login: "custom",
        url: "https://github.com/custom",
      },
    });

    expect(repo.owner.id).toBe("custom-id");
    expect(repo.owner.login).toBe("custom");
  });
});
