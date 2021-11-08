const repoQuery = `
query($login: String!, $after: String) {
  user(login: $login) {
    id
    name
    login
    avatarUrl
    bioHTML
    repositories(
      first: 100
      after: $after
      ownerAffiliations: [OWNER, ORGANIZATION_MEMBER, COLLABORATOR]
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        viewerCanAdminister
        name
        description
        isFork
        isPrivate
        isArchived
        updatedAt
        url
        parent {
          nameWithOwner
          url
        }
        owner {
          login
          url
        }
      }
    }
  }
}
`;

const viewerQuery = `
query {
  viewer {
    id
    name
    login
  }
}`;

export function buildUserQuery() {
	return JSON.stringify({
		query: viewerQuery
	});
}

export function buildRepoQuery({ login, after }) {
	if (!login) {
		throw new Error('Login name required for API call');
	}

	const variables = {};

	if (login) {
		variables.login = login;
	}

	if (after) {
		variables.after = after;
	}

	return JSON.stringify({
		query: repoQuery,
		variables: variables
	});
}
