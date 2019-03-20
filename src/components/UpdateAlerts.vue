<template v-if="isSuccess">
  <h4 class="alert-heading">
    Success!
  </h4>
  <p>{{ alerts.length | pluralize("repos were", "repo was") }} successfully {{ updateType }}.</p>
</template>
<template v-else>
  <h4 class="alert-heading">
    Error
  </h4>
  <p>{{ alerts.length | pluralize("repos were", "repo was") }} unable to be {{ updateType }}.</p>
  <ul
    v-for="alert in alerts"
    :key="alert.repo.name"
    class="unstyled"
  >
    <li>
      <h5>
        {{ alert.repo.name }}
      </h5>
      <p>
        Error Message: {{ alert.error.message }}
      </p>
    </li>
  </ul>
</template>
