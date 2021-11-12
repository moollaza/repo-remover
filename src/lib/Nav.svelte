<script>
  export let section;
</script>

<nav class="bg-white shadow ">
  <div class="container">
    <div class="flex justify-between h-16">
      <div class="flex">
        <div class="flex-shrink-0 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            ></path>
          </svg>
        </div>
        <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
          <a href="/" class:current="{section === ''}"> Home </a>
          <a href="/about" class:current="{section === 'about'}"> About </a>
        </div>
      </div>
    </div>
  </div>
</nav>

<style lang="postcss">
  a {
    @apply inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium;
    @apply border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700;
  }

  .current {
    @apply border-indigo-500 text-gray-900;
  }
</style>
