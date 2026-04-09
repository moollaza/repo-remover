/**
 * GraphQL query strings and response types for the GitHub API.
 * Operation names (getRepositories, getCurrentUser, etc.) must match the MSW handlers in mocks/handlers.ts.
 */
import { type Repository } from "@octokit/graphql-schema";

export const GET_REPOS = `
  query getRepositories($login: String!, $cursor: String) {
    user(login: $login) {
      id
      login
      url
      name
      avatarUrl
      bioHTML
      repositories(first: 100, after: $cursor) {
        nodes {
          id
          name
          description
          isPrivate
          isArchived
          isFork
          isTemplate
          isMirror
          isLocked
          isInOrganization
          viewerCanAdminister
          owner {
            id
            login
            url
          }
          parent {
            name
            owner {
              login
            }
          }
          updatedAt
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_CURRENT_USER = `
  query getCurrentUser {
    viewer {
      id
      login
      name
      avatarUrl
      bioHTML
    }
  }
`;

export const GET_ORGS = `
  query getOrganizations($login: String!, $cursor: String) {
    user(login: $login) {
      organizations(first: 100, after: $cursor) {
        nodes {
          login
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export const GET_ORG_REPOS = `
  query getOrgRepositories($org: String!, $cursor: String) {
    organization(login: $org) {
      login
      url
      repositories(first: 100, after: $cursor) {
        nodes {
          id
          name
          description
          isPrivate
          isArchived
          isFork
          isTemplate
          isMirror
          isLocked
          isInOrganization
          viewerCanAdminister
          viewerPermission
          owner {
            id
            login
            url
          }
          updatedAt
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface CurrentUserResponse {
  viewer: {
    avatarUrl: string;
    bioHTML: string;
    id: string;
    login: string;
    name: string;
  };
}

export interface OrganizationsResponse {
  user: {
    organizations: {
      nodes: { login: string; url: string }[];
      pageInfo: {
        endCursor: null | string;
        hasNextPage: boolean;
      };
    };
  };
}

export interface OrgRepositoriesResponse {
  organization: {
    login: string;
    repositories: {
      nodes: Repository[];
      pageInfo: {
        endCursor: null | string;
        hasNextPage: boolean;
      };
    };
    url: string;
  };
}

export interface UserRepositoriesResponse {
  user: {
    avatarUrl: string;
    bioHTML: string;
    id: string;
    login: string;
    name: string;
    repositories: {
      nodes: Repository[];
      pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
      };
    };
  };
}
