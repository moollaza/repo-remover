<script>
	import { onMount } from "svelte";
	import dayjs from "dayjs";
	import relativeTime from "dayjs/plugin/relativeTime";
	dayjs.extend(relativeTime);

	import ArrowUp from "$lib/icons/arrowUp.svelte";
	import ArrowDown from "$lib/icons/arrowDown.svelte";

	export let items;
	export let columns;

	const filters = [
		{ label: "Public", field: "isPublic" },
		{ label: "Private", field: "isPrivate" },
		{ label: "Archived", field: "isArchived" },
		{ label: "Forked", field: "isForked" },
	];

	let sortColumnId = 1;
	let sortDirection = "DESC";
	let filter = "";

	$: sortColumn = columns[sortColumnId];
	$: displayItems = sortItems(
		filterItems(items, filter),
		sortColumn,
		sortDirection
	);

	onMount(() => {});

	function filterItems(_items, filter) {
		console.log("Filtering...");
		return _items;
	}

	function sortItems(_items, sortColumn, sortDirection) {
		console.log("Sorting...");
		console.log("Column:", sortColumn);
		console.log("Direction:", sortDirection);

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

<!-- TABLE FILTERS -->
<div class="px-6 pb-4">
	<fieldset class="space-y-2">
		<legend class="sr-only">Repo Type Filters</legend>
		{#each filters as filter}
			<div class="relative flex items-start">
				<div class="flex items-center h-5">
					<input
						id="repo-filter-{filter.label.toLowerCase()}"
						aria-describedby="{filter.label.toLowerCase()}-description"
						name="repo-filter-{filter.label.toLowerCase()}"
						type="checkbox"
						class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
					/>
				</div>
				<div class="ml-3 text-sm">
					<label
						for="repo-filter-{filter.label.toLowerCase()}"
						class="font-medium text-gray-700">{filter.label}</label
					>
				</div>
			</div>
		{/each}
	</fieldset>
</div>

<!-- TABLE -->
<div class="flex flex-col">
	<div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
			<div
				class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
			>
				<table class="min-w-full divide-y divide-gray-200">
					<thead class="bg-gray-50">
						<tr>
							<th scope="col" class="text-left px-6 py-3">
								<span class="sr-only">Select All</span>
								<input type="checkbox" />
							</th>
							{#each columns as column, i}
								<th
									scope="col"
									class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									<div
										class="inline-flex items-center cursor-pointer"
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
					<tbody>
						{#each displayItems as item, i (item.id)}
							<tr class:bg-white={i % 2 === 0} class:bg-gray-50={i % 2 !== 0}>
								<td
									class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
								>
									<input type="checkbox" />
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{item.name}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
