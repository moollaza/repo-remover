<script>
  export let items;
  export let columns;

  import { prettyDate } from "../util";

  import ArrowUp from "$lib/icons/arrowUp.svelte";
  import ArrowDown from "$lib/icons/arrowDown.svelte";

  let sortColumnId = 2;
  let sortDirection = "DESC";
  let filter = "";

  let displayItems = items;

  $: sortColumn = columns[sortColumnId];
  $: {
    displayItems = sortItems(
      filterItems(items, filter),
      sortColumn,
      sortDirection
    );
  }

  console.log(displayItems);

  function filterItems(_items, filter) {
    console.log("Filtering...", _items);
    return _items;
  }

  function sortItems(_items, sortColumn, sortDirection) {
    console.log("Sorting...", _items);
    if (!_items) {
      return [];
    }

    return _items.sort((a, b) => {
      if (sortDirection === "DESC") {
        return a[sortColumn] - b[sortColumn];
      } else {
        return b[sortColumn] - a[sortColumn];
      }
    });
  }
</script>

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
                  <div class="inline-flex items-center">
                    {column}
                    {#if i + 1 === sortColumnId}
                      <span class="ml-1">
                        {#if sortDirection === "DESC"}
                          <ArrowDown className="h-6 w-6" />
                        {:else}
                          <ArrowUp className="h-6 w-6" />
                        {/if}
                      </span>
                    {/if}
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each displayItems as item, i (item.id)}
              <tr
                class:bg-white="{i % 2 === 0}"
                class:bg-gray-50="{i % 2 !== 0}"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  <input type="checkbox" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.name}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span title="{new Date(item.updatedAt).toLocaleString()}"
                    >{prettyDate(item.updatedAt)}</span
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
