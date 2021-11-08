<script>
	import { onMount } from 'svelte';

	import { accessToken, ghRepos, ghViewer } from '../state.js';
	import { buildRepoQuery } from '../graphql.js';

	const API = 'https://api.github.com/graphql';
	let loading = true;
	let hasError = false;

	async function getRepos() {
		console.log('GETTING REPOS');

		const options = {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${$accessToken}`
			},
			body: buildRepoQuery({ login: $ghViewer?.login || 'moollaza' })
		};

		let res = await fetch(API, options);
		let data = await res.json();

		console.log('GH REPOS', data);

		if (data?.data?.message) {
			loading = false;
			hasError = true;
		}

		if (data?.data?.user) {
			loading = false;
			hasError = false;

			$ghViewer = data?.data?.user;
			$ghRepos = data?.data?.user?.repositories;
		}
	}

	onMount(function () {
		getRepos();
	});
</script>

<section class="py-12">
	<header>
		<h1>Welcome to RepoRemover</h1>
	</header>

	<section class="pt-12">
		{#if loading}
			<p>Loading...</p>
		{:else if $ghRepos}
			<section>
				<h2>Repos</h2>

				<p>
					Repo Count: {$ghRepos?.totalCount}
				</p>

				<table class="mt-8 border-collapse border border-gray-800">
					<thead>
						<tr>
							<th class="border border-gray-600">Name</th>
							<th class="border border-gray-600">Description</th>
						</tr>
					</thead>
					<tbody>
						{#each $ghRepos.nodes as repo}
							<tr>
								<td class="border border-gray-600">{repo.name}</td>
								<td class="border border-gray-600">{repo.description || ''}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		{/if}
	</section>
</section>

<style>
	th,
	td {
		@apply py-2 px-4;
	}
</style>
