<script>
	import { onMount } from "svelte";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import { ghViewer } from "$lib/state";

	import {
		ArrowUp,
		ArrowDown,
		SadFace,
		Search,
		Archive,
		Trash,
	} from "$lib/assets";

	export let items;
	export let columns;

	const repoTypes = [
		{ label: "Personal", field: "isPersonal" },
		{ label: "Organization", field: "isInOrganization" },
		{ label: "Private", field: "isPrivate" },
		{ label: "Archived", field: "isArchived" },
		{ label: "Forked", field: "isFork" },
		{ label: "Template", field: "isTemplate" },
	];

	const actions = ["Archive", "Delete"];

	let sortColumnId = 1;
	let sortDirection = "DESC";
	let perPage = "5";
	let repoAction = "archive";
	let allRepoTypeFilters = repoTypes.map((repoType) => repoType.field);
	let repoTypeFilter = allRepoTypeFilters;
	let searchFilter = "";
	let selectAll = false;
	let selected = [];

	$: disabledFilters = allRepoTypeFilters.filter(
		(x) => !repoTypeFilter.includes(x)
	);
	$: sortColumn = columns[sortColumnId];
	$: displayItems = sortItems(
		filterItems(items, searchFilter, repoTypeFilter, selected),
		sortColumn,
		sortDirection
	);

	onMount(() => {});

	function filterItems(_items, searchFilter) {
		if (!_items) {
			return [];
		}

		return _items.filter((item) => {
			// If any unchecked filters match, hide repo
			let hideRepo = disabledFilters.some((filter) => item[filter] === true);

			if (
				disabledFilters.includes("isPersonal") &&
				item["isInOrganization"] !== true
			) {
				hideRepo = true;
			}

			if (hideRepo) {
				return false;
			}

			if (searchFilter) {
				const regex = new RegExp(searchFilter.trim(), "i");
				return regex.test(item.name) || regex.test(item.description);
			}

			return true;
		});
	}

	function sortItems(_items, sortColumn, sortDirection) {
		if (!_items) {
			return [];
		}

		if (!sortColumn || !sortDirection) {
			return _items;
		}

		return _items.slice().sort((a, b) => {
			if (sortDirection === "ASC") {
				return a[sortColumn.field] > b[sortColumn.field] ? 1 : -1;
			} else {
				return a[sortColumn.field] > b[sortColumn.field] ? -1 : 1;
			}
		});
	}

	function handleSortColumn(id) {
		if (sortColumnId === id) {
			if (sortDirection === "DESC") {
				sortDirection = "ASC";
			} else {
				sortDirection = "DESC";
			}
		} else {
			sortDirection = "ASC";
			sortColumnId = id;
		}
	}

	function getBadges(repo) {
		let badges = [];

		if (repo.isPrivate === true) {
			badges.push({ label: "Private", icon: "" });
		}
		if (repo.isFork === true) {
			badges.push({ label: "Forked", icon: "" });
		}
		if (repo.isArchived === true) {
			badges.push({ label: "Archived", icon: "" });
		}
		if (repo.isTemplate === true) {
			badges.push({ label: "Template", icon: "" });
		}
		if (repo.isInOrganization === true) {
			badges.push({ label: "Organization Owned", icon: "" });
		}

		return badges;
	}

	function selectAllRepos() {
		if (selectAll) {
			selected = [];
		} else {
			items.forEach((item) => {
				selected.push(item.id);
			});
		}

		// Force redraw
		selected = selected;
	}
</script>

<div class="grid md:grid-cols-6 grid-rows-2 gap-4 pb-4">
	<!-- TABLE FILTERS -->
	<fieldset class="col-span-full">
		<legend class="block mb-1 text-sm font-medium text-gray-700"
			>Repo Type</legend
		>
		<div class="flex gap-x-6 gap-y-3">
			{#each repoTypes as filter}
				<div class="inline-flex items-start">
					<div class="flex items-center h-5">
						<input
							type="checkbox"
							id="repo-type-{filter.label.toLowerCase()}"
							aria-describedby="repo-type-{filter.label.toLowerCase()}-description"
							name="repo-type-{filter.label.toLowerCase()}"
							class="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded "
							value={filter.field}
							bind:group={repoTypeFilter}
						/>
					</div>
					<div class="ml-2 text-sm">
						<label
							for="repo-type-{filter.label.toLowerCase()}"
							class="font-medium text-gray-700">{filter.label}</label
						>
					</div>
				</div>
			{/each}
		</div>
	</fieldset>

	<!-- PER PAGE -->
	<div class="col-span-2">
		<label for="perPage" class="block text-sm font-medium text-gray-700"
			>Repos Per Page</label
		>
		<select
			id="perPage"
			name="perPage"
			class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			bind:value={perPage}
		>
			<option value="5" selected>5 Per Page</option>
			<option value="10">10 Per Page</option>
			<option value="15">15 Per Page</option>
			<option value="20">20 Per Page</option>
			<option value={false}>Show All</option>
		</select>
	</div>

	<!-- SEARCH FILTER -->
	<div class="col-span-2">
		<label for="searchFilter" class="block text-sm font-medium text-gray-700"
			>Search Term</label
		>
		<div class="mt-1 relative rounded-md shadow-sm ">
			<div
				class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
			>
				<span class="h-5 w-5">
					<Search />
				</span>
			</div>
			<input
				type="text"
				name="searchFilter"
				id="searchFilter"
				class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
				placeholder="Enter search term"
				bind:value={searchFilter}
			/>
		</div>
	</div>

	<!-- EDIT TYPE -->
	<div class="col-span-2">
		<label for="perPage" class="block text-sm font-medium text-gray-700"
			>Repo Action</label
		>
		<select
			id="perPage"
			name="perPage"
			class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
			bind:value={repoAction}
		>
			<option value="archive" selected>Archive</option>
			<option value="delete">Delete</option>
		</select>
	</div>
</div>

<div class="grid md:grid-cols-3 gap-4 pb-4 justify-end">
	<div class="col-span-1 col-start-3">
		<button
			type="button"
			class="flex w-full items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
			class:isArchive={repoAction === "archive"}
			class:isDelete={repoAction === "delete"}
			disabled={!selected.length}
		>
			<span class="h-6 w-6 mr-2">
				<svelte:component this={repoAction === "archive" ? Archive : Trash} />
			</span>
			<span class="capitalize">{repoAction} {selected.length || ""} Repos</span>
		</button>
	</div>
</div>

<!-- TABLE -->
<div class="flex flex-col">
	<div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
			<div class="overflow-hidden ">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="text-left px-6 py-3 w-4">
								<span class="sr-only">Select All</span>
								<input
									type="checkbox"
									class="cursor-pointer"
									bind:checked={selectAll}
									on:click={selectAllRepos}
								/>
							</th>
							{#each columns as column, i}
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
									class:active={i === sortColumnId}
								>
									<div
										class="inline-flex h-100 items-center cursor-pointer"
										on:click={() => {
											handleSortColumn(i);
										}}
									>
										{column.label}
										<span class="h-6 w-6 ml-1">
											{#if i === sortColumnId}
												<svelte:component
													this={sortDirection === "DESC" ? ArrowDown : ArrowUp}
												/>
											{/if}
										</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#if !displayItems.length}
							<tr>
								<td colspan="99" class="text-center">
									<p class="inline-flex items-center py-6 text-gray-700">
										No results!
										<span class="ml-2 h-5 w-5">
											<SadFace />
										</span>
									</p>
								</td>
							</tr>
						{/if}
						{#each displayItems as item, i (item.id)}
							<tr
								class:cursor-not-allowed={item.isArchived &&
									repoAction === "archive"}
								class:opacity-50={item.isArchived && repoAction === "archive"}
							>
								<td class="px-6 py-4 w-5">
									<input
										type="checkbox"
										class="cursor-pointer disabled:cursor-not-allowed"
										bind:group={selected}
										value={item.id}
										disabled={repoAction === "archive" && item.isArchived}
									/>
								</td>
								<td class="px-6 py-4 text-sm text-gray-500">
									<div class="space-y-2">
										<!-- REPO NAME -->
										<a
											href={item.url}
											target="_blank"
											class="text-blue-600 font-bold text-md"
										>
											{item.name}
										</a>

										<!-- REPO OWNER -->
										<p class="-mt-4 mb-3 text-italic">
											Owned by <a href={item.owner.url} class="text-blue-500"
												>{item.owner.login}</a
											>
										</p>

										<!-- BADGES -->
										<div class="flex space-x-3">
											{#each getBadges(item) as badge}
												<span
													class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
													class:bg-yellow-300={badge.label === "Archived"}
												>
													{badge.label}
												</span>
											{/each}
										</div>

										<!-- REPO DESCRIPTION -->
										<p class="">
											{item.description || ""}
										</p>
									</div>
								</td>
								<td
									class="w-44 px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
								>
									<span
										title={dayjs(item.updatedAt).format("MMMM D, YYYY h:mm A")}
										>{dayjs().to(item.updatedAt)}</span
									>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.isArchive {
		@apply text-gray-800 bg-yellow-300  focus:ring-yellow-500 focus:border-yellow-500;
	}

	.isDelete {
		@apply text-white bg-red-500  focus:ring-red-500 focus:border-red-500;
	}
</style>
