<script>
	import { onMount } from "svelte";

	import { accessToken, ghRepos, ghViewer } from "$lib/state";
	import { buildRepoQuery } from "$lib/graphql";

	import DataTable from "$lib/DataTable.svelte";

	const API = "https://api.github.com/graphql";
	let loading = true;
	let hasError = false;

	async function getRepos() {
		console.log("GETTING REPOS");

		const options = {
			method: "post",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${$accessToken}`,
			},
			body: buildRepoQuery({ login: $ghViewer?.login || "moollaza" }),
		};

		let res = await fetch(API, options);
		let data = await res.json();

		console.log("GH REPOS", data?.data);

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
				<DataTable
					items={$ghRepos.nodes}
					columns={[
						{ label: "Name", field: "name" },
						{ label: "Last Updated", field: "updatedAt" },
					]}
				/>
			</section>
		{/if}
	</section>
</section>

<style>
</style>
