<script>
	import AccessTokenForm from "$lib/AccessTokenForm.svelte";
</script>

<section class="py-12">
	<header>
		<h1 class="text-2xl leading-5 font-semibold text-gray-900">
			Welcome to RepoRemover
		</h1>
	</header>

	<section class="py-6">
		<ul role="list" class="divide-y divide-gray-200">
			<li class="py-4">
				<h2 class="text-md leading-6 font-semibold text-gray-900 mb-3">
					Step 1: Get Access Token
				</h2>

				<a
					href="https://github.com/settings/tokens/new?scopes=delete_repo,repo&description=Repo%20Remover%20Token"
					target="_blank"
					class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
					Get my token</a
				>
			</li>
			<li class="py-4">
				<h2 class="text-md leading-6 font-semibold text-gray-900 mb-3">
					Step 2: Select Repos
				</h2>
				<AccessTokenForm />
			</li>
		</ul>
	</section>
</section>
