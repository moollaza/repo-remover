<script>
	export let onChange;

	let isOpen = false;

	function handleClick() {
		isOpen = true;
	}
</script>

<!-- This example requires Tailwind CSS v2.0+ -->
<div>
	<label id="listbox-label" class="sr-only"> Change published status </label>
	<div class="relative">
		<div class="inline-flex shadow-sm rounded-md divide-x divide-indigo-600">
			<div
				class="relative z-0 inline-flex shadow-sm rounded-md divide-x divide-indigo-600"
			>
				<div
					class="relative inline-flex items-center bg-indigo-500 py-2 pl-3 pr-4 border border-transparent rounded-l-md shadow-sm text-white"
				>
					<!-- Heroicon name: solid/check -->
					<svg
						class="h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					<p class="ml-2.5 text-sm font-medium">Published</p>
				</div>
				<button
					type="button"
					class="relative inline-flex items-center bg-indigo-500 p-2 rounded-l-none rounded-r-md text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus:z-10 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
					aria-haspopup="listbox"
					aria-expanded="true"
					aria-labelledby="listbox-label"
				>
					<span class="sr-only">Change published status</span>
					<!-- Heroicon name: solid/chevron-down -->
					<svg
						class="h-5 w-5 text-white"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!--
      Select popover, show/hide based on select state.

      Entering: ""
        From: ""
        To: ""
      Leaving: "transition ease-in duration-100"
        From: "opacity-100"
        To: "opacity-0"
    -->
		<ul
			class="origin-top-right absolute z-10 right-0 mt-2 w-72 rounded-md shadow-lg overflow-hidden bg-white divide-y divide-gray-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
			tabindex="-1"
			role="listbox"
			aria-labelledby="listbox-label"
			aria-activedescendant="listbox-option-0"
		>
			<!--
        Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

        Highlighted: "text-white bg-indigo-500", Not Highlighted: "text-gray-900"
      -->
			<li
				class="text-gray-900 cursor-default select-none relative p-4 text-sm"
				id="listbox-option-0"
				role="option"
			>
				<div class="flex flex-col">
					<div class="flex justify-between">
						<!-- Selected: "font-semibold", Not Selected: "font-normal" -->
						<p class="font-normal">Published</p>
						<!--
              Checkmark, only display for selected option.

              Highlighted: "text-white", Not Highlighted: "text-indigo-500"
            -->
						<span class="text-indigo-500">
							<!-- Heroicon name: solid/check -->
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</span>
					</div>
					<!-- Highlighted: "text-indigo-200", Not Highlighted: "text-gray-500" -->
					<p class="text-gray-500 mt-2">
						This job posting can be viewed by anyone who has the link.
					</p>
				</div>
			</li>

			<!-- More items... -->
		</ul>
	</div>
</div>
