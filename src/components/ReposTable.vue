<template>
  <div>
    <h2>Your Repositories</h2>
    <b-table
      hover
      :items="reposProvider"
      :fields="fields"
      tbody-class="repos-table__body"
    >
      <!-- Name Col -->
      <template
        slot="name"
        slot-scope="data"
      >
        <h5>
          <b-link
            :href="data.item.url"
            class="text-dark"
          >
            {{ data.value }}
          </b-link>
        </h5>
        <p>{{ data.item.description }}</p>
        <small>Update {{ data.item.updatedAt | timeAgo }}</small>
      </template>

      <!-- Details Col -->
      <template
        slot="details"
        slot-scope="data"
      >
        <ul class="list-unstyled">
          <li v-if="data.item.isFork">
            Forked
          </li>
          <li v-if="data.item.isPrivate">
            Private
          </li>
          <li v-if="data.item.isArchived">
            Archived
          </li>
        </ul>
      </template>

      <!-- Selected Col -->
      <template
        slot="selected"
        slot-scope="data"
      >
        <b-form-checkbox
          v-model="data.item.selected"
          class="mx-0"
        />
      </template>
    </b-table>
  </div>
</template>

<script>
  import { distanceInWordsToNow } from "date-fns";
  export default {
    filters: {
      timeAgo: function(value) {
        return distanceInWordsToNow(new Date(value), { addSuffix: true, includeSeconds: true });
      }
    },
    data() {
      return {
        fields: [
          'name',
          'details',
          { key: 'selected', class: 'text-center'}
        ],
      }
    },
    methods: {
      reposProvider() {
        return this.$root.$data.repos.map(repo => {
          repo.selected = false;
          return repo;
        });
      },
    },
  }
</script>

<style>
.repos-table__body td {
  vertical-align: middle;
}
</style>
