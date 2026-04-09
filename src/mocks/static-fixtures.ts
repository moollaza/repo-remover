import { type Repository } from "@octokit/graphql-schema";

// Extended Repository type with additional properties for testing
type MockRepository = {
  ownerType?: string;
  packages?: { totalCount: number }; // Add packages property to satisfy GraphQL schema
} & Repository;

// Helper function to create a mock repository with common defaults
function createMockRepository(config: {
  description: string;
  id: string;
  isArchived?: boolean;
  isFork?: boolean;
  isInOrganization?: boolean;
  isLocked?: boolean;
  isMirror?: boolean;
  isPrivate?: boolean;
  isTemplate?: boolean;
  name: string;
  ownerType: "current-user" | "organization";
  parent?: { name: string; owner: { login: string } } | null;
  updatedAt: string;
  viewerCanAdminister?: boolean;
}): MockRepository {
  const isUserOwned = config.ownerType === "current-user";
  const owner = isUserOwned
    ? {
        id: "user-123456",
        login: "testuser",
        url: "https://github.com/testuser",
      }
    : { id: "org-456789", login: "testorg", url: "https://github.com/testorg" };

  const ownerPrefix = isUserOwned ? "testuser" : "testorg";

  return {
    description: config.description,
    id: config.id,
    isArchived: config.isArchived ?? false,
    isFork: config.isFork ?? false,
    isInOrganization: config.isInOrganization ?? !isUserOwned,
    isLocked: config.isLocked ?? false,
    isMirror: config.isMirror ?? false,
    isPrivate: config.isPrivate ?? false,
    isTemplate: config.isTemplate ?? false,
    name: config.name,
    owner,
    ownerType: config.ownerType,
    packages: { totalCount: 0 },
    parent: config.parent ?? null,
    updatedAt: config.updatedAt,
    url: `https://github.com/${ownerPrefix}/${config.name}`,
    viewerCanAdminister: config.viewerCanAdminister ?? true,
  } as MockRepository;
}

// Static mock user data
export const MOCK_USER = {
  avatarUrl: "https://avatars.githubusercontent.com/u/123456?v=4",
  bioHTML: "<p>Test user bio for testing purposes</p>",
  id: "user-123456",
  login: "testuser",
  name: "Test User",
  url: "https://github.com/testuser",
};

// Static mock repositories covering core scenarios
export const MOCK_REPOS: MockRepository[] = [
  // User-owned repositories (will always be visible due to ownership)
  createMockRepository({
    description: "First test repo",
    id: "repo-1",
    name: "repo-1",
    ownerType: "current-user",
    updatedAt: "2023-12-01T10:00:00Z",
  }),
  createMockRepository({
    description: "Second test repo",
    id: "repo-2",
    isArchived: true,
    isPrivate: true,
    name: "repo-2",
    ownerType: "current-user",
    updatedAt: "2023-11-15T14:30:00Z",
  }),
  createMockRepository({
    description: "A forked repository",
    id: "repo-3",
    isFork: true,
    isInOrganization: false,
    name: "repo-3",
    ownerType: "current-user",
    parent: {
      name: "original-repo",
      owner: { login: "originalowner" },
    },
    updatedAt: "2023-10-20T08:15:00Z",
  }),

  // Organization repositories with admin access (visible on first page)
  createMockRepository({
    description: "Repository in organization",
    id: "repo-4",
    name: "repo-4",
    ownerType: "organization",
    updatedAt: "2023-09-05T16:45:00Z",
  }),
  createMockRepository({
    description: "Organization repo with admin access",
    id: "repo-5",
    isPrivate: true,
    name: "repo-5",
    ownerType: "organization",
    updatedAt: "2023-08-12T12:00:00Z",
  }),

  // Organization repositories without admin access (filtered out)
  createMockRepository({
    description: "Another test repository",
    id: "repo-6",
    isInOrganization: false, // Override default for testorg repos
    name: "repo-6",
    ownerType: "organization",
    updatedAt: "2023-07-01T09:00:00Z",
    viewerCanAdminister: false,
  }),

  // Additional organization repositories (visible on second page)
  createMockRepository({
    description: "Another organization repo",
    id: "repo-7",
    name: "repo-7",
    ownerType: "organization",
    updatedAt: "2023-06-01T08:00:00Z",
  }),
  createMockRepository({
    description: "Repository without admin access",
    id: "repo-8",
    isPrivate: true,
    name: "repo-8",
    ownerType: "organization",
    updatedAt: "2023-05-01T07:00:00Z",
    viewerCanAdminister: false,
  }),

  // Additional user repositories (visible on second page)
  createMockRepository({
    description: "Another personal repository",
    id: "repo-9",
    isInOrganization: false,
    name: "repo-9",
    ownerType: "current-user",
    updatedAt: "2023-04-01T06:00:00Z",
  }),
  createMockRepository({
    description: "Final test repository",
    id: "repo-10",
    isInOrganization: false,
    name: "repo-10",
    ownerType: "current-user",
    updatedAt: "2023-03-01T05:00:00Z",
  }),

  // Locked repository (e.g. DMCA takedown, admin lock)
  createMockRepository({
    description: "A locked repository",
    id: "repo-locked",
    isLocked: true,
    name: "repo-locked",
    ownerType: "current-user",
    updatedAt: "2023-02-15T04:00:00Z",
  }),

  // Template repository
  createMockRepository({
    description: "A template repository",
    id: "repo-template",
    isTemplate: true,
    name: "repo-template",
    ownerType: "current-user",
    updatedAt: "2023-02-01T03:00:00Z",
  }),

  // Mirror repository
  createMockRepository({
    description: "A mirrored repository",
    id: "repo-mirror",
    isMirror: true,
    name: "repo-mirror",
    ownerType: "organization",
    updatedAt: "2023-01-15T02:00:00Z",
  }),
];

// Helper function to create a mock repo with overrides
export function createMockRepo(
  overrides: Partial<MockRepository> = {},
): MockRepository {
  const baseRepo = MOCK_REPOS[0];
  const isOrgOwned = overrides.ownerType === "organization";
  const derivedOwner = isOrgOwned
    ? { id: "org-456789", login: "testorg", url: "https://github.com/testorg" }
    : baseRepo.owner;

  return {
    ...baseRepo,
    ...overrides,
    owner: {
      ...derivedOwner,
      ...overrides.owner,
    },
  } as MockRepository;
}

// Valid GitHub Personal Access Token for testing
export function getValidPersonalAccessToken(): string {
  return "ghp_abcdefghijklmnopqrstuvwxyz1234567890";
}

// Mock organizations
export const MOCK_ORGANIZATIONS = [
  {
    login: "testorg",
    url: "https://github.com/testorg",
  },
  {
    login: "anotherorg",
    url: "https://github.com/anotherorg",
  },
];

// Extended fixture set for pagination testing
export const manyMockRepos: MockRepository[] = [
  ...MOCK_REPOS,
  ...Array.from({ length: 10 }, (_, i) =>
    createMockRepository({
      description: `Generated repo ${i + 1}`,
      id: `repo-gen-${i + 1}`,
      isPrivate: i % 3 === 0,
      name: `repo-gen-${i + 1}`,
      ownerType: i % 2 === 0 ? "current-user" : "organization",
      updatedAt: `2022-${String(12 - i).padStart(2, "0")}-01T00:00:00Z`,
    }),
  ),
];
