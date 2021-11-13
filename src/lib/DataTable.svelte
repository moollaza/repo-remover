<script>
	import { onMount } from "svelte";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import ArrowUp from "$lib/icons/arrowUp.svelte";
	import ArrowDown from "$lib/icons/arrowDown.svelte";

	export let items;
	export let columns;

	const repoTypes = [
		{ label: "Public", field: "isPublic" },
		{ label: "Private", field: "isPrivate" },
		{ label: "Archived", field: "isArchived" },
		{ label: "Forked", field: "isForked" },
	];

	let sortColumnId = 1;
	let sortDirection = "DESC";
	let searchFilter = "";
	let repoTypeFilter = repoTypes.map((repoType) =>
		repoType.label.toLowerCase()
	);
	let perPage = "5";

	$: sortColumn = columns[sortColumnId];
	$: displayItems = sortItems(
		filterItems(items, searchFilter),
		sortColumn,
		sortDirection
	);

	onMount(() => {});

	function filterItems(_items, filter) {
		if (!_items) {
			return [];
		}

		if (!filter) return _items;

		return _items.filter((item) => {
			let regex = new RegExp(filter, "i");
			return regex.test(item.name) || regex.test(item.description);
		});
	}

	function sortItems(_items, sortColumn, sortDirection) {
		if (!_items) {
			return [];
		}

		if (!sortColumn || !sortDirection) {
			return _items;
		}

		let ret = _items.slice().sort((a, b) => {
			if (sortDirection === "ASC") {
				return a[sortColumn.field] > b[sortColumn.field] ? 1 : -1;
			} else {
				return a[sortColumn.field] > b[sortColumn.field] ? -1 : 1;
			}
		});

		return ret;
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
</script>

<div class="grid md:grid-cols-3 gap-4 pb-4">
	<!-- PER PAGE -->
	<div>
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

	<!-- TABLE FILTERS -->
	<fieldset>
		<legend class="block mb-1 text-sm font-medium text-gray-700"
			>Repo Type Filters</legend
		>
		<div class="grid grid-cols-2 gap-x-5 gap-y-3">
			{#each repoTypes as filter}
				<div class="inline-flex items-start">
					<div class="flex items-center h-5">
						<input
							type="checkbox"
							id="repo-type-{filter.label.toLowerCase()}"
							aria-describedby="repo-type-{filter.label.toLowerCase()}-description"
							name="repo-type-{filter.label.toLowerCase()}"
							class="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
							value={filter.label.toLowerCase()}
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

	<!-- SEARCH FILTER -->
	<div>
		<label for="searchFilter" class="block text-sm font-medium text-gray-700"
			>Search Term</label
		>
		<div class="mt-1 relative rounded-md shadow-sm ">
			<div
				class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clip-rule="evenodd"
					/>
				</svg>
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
</div>

<!-- TABLE -->
<div class="flex flex-col">
	<div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
			<div class="overflow-hidden ">
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="">
						<tr>
							<th scope="col" class="text-left px-6 py-3 w-4">
								<span class="sr-only">Select All</span>
								<input type="checkbox" />
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
												{#if sortDirection === "DESC"}
													<ArrowDown className="h-6 w-6" />
												{:else}
													<ArrowUp className="h-6 w-6" />
												{/if}
											{/if}
										</span>
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200">
						{#each displayItems as item, i (item.id)}
							<tr class:bg-white={i % 2 !== 0}>
								<td class="px-6 py-4 w-5">
									<input type="checkbox" />
								</td>
								<td class="px-6 py-4  text-sm text-gray-500">
									<div class="space-y-2">
										<a
											href={item.url}
											target="_blank"
											class="text-blue-600 font-bold text-md"
										>
											{item.name}
										</a>
										<p class="">
											{item.description || ""}
										</p>
									</div>
								</td>
								<td
									class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-44"
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
