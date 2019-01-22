<template>
  <div>
    <h1 class="mb-0">
      Your Repos:
    </h1>

    <!-- Table Filter/Paging  -->
    <b-row>
      <b-col
        md="6"
        class="my-3"
      >
        <b-form-group
          horizontal
          label="Filter"
          class="mb-0"
        >
          <b-input-group>
            <b-form-input
              v-model="filter"
              placeholder="Type to Search"
            />
            <b-input-group-append>
              <b-btn
                :disabled="!filter"
                @click="filter = ''"
              >
                Clear
              </b-btn>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col
        md="6"
        class="my-3"
      >
        <b-form-group
          horizontal
          label="Per page"
          class="mb-0"
        >
          <b-form-select
            v-model="perPage"
            :options="pageOptions"
          />
        </b-form-group>
      </b-col>
    </b-row>


    <!-- Repo Table -->
    <b-table
      ref="table"
      hover
      tbody-class="repos-table__body"
      no-provider-paging
      no-provider-sorting
      no-provider-filtering
      caption-top
      :items="repoProvider"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      @filtered="onFiltered"
      @refreshed="onRefreshed"
    >
      <!-- Table Caption -->
      <template slot="table-caption">
        <span>Number of Repos: {{ repos.length }}</span>
        <span class="mx-2">
          |
        </span>
        <span>Selected: {{ selected.length }}</span>
      </template>

      <!-- Name Col -->
      <template
        slot="name"
        slot-scope="data"
      >
        <div class="mb-2">
          <h5 class="m-0">
            <b-link
              :href="data.item.url"
            >
              {{ data.value }}
            </b-link>
          </h5>
          <!-- Forked from... -->
          <small
            v-if="data.item.parent"
          >
            Forked from
            <a
              :href="data.item.parent.url"
              class="text-dark"
            >
              {{ data.item.parent.nameWithOwner }}
            </a>
          </small>
        </div>
        <p>
          {{ data.item.description }}
        </p>
        <small>Update {{ data.item.updatedAt | timeAgo }}</small>
      </template>

      <!-- Details Col -->
      <template
        slot="details"
        slot-scope="data"
      >
        <ul class="list-unstyled m-0">
          <li v-if="data.item.isFork">
            <b-badge variant="primary">
              Forked
            </b-badge>
          </li>
          <li v-if="data.item.isPrivate">
            <b-badge variant="secondary">
              Private
            </b-badge>
          </li>
          <li v-if="data.item.isArchived">
            <b-badge variant="secondary">
              Archived
            </b-badge>
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
          button-variant="primary"
          class="mx-0"
          @change="onRepoSelected(data)"
        />
      </template>
    </b-table>

    <b-row class="justify-content-md-center">
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        class="my-1"
      />
    </b-row>
  </div>
</template>

<script>
import { distanceInWordsToNow } from "date-fns";

export default {
  filters: {
    timeAgo: function(value) {
      return distanceInWordsToNow(new Date(value), {
        addSuffix: true,
        includeSeconds: true
      });
    }
  },
  data() {
    return {
      fields: [
        "name",
        "details",
        { key: "selected", class: "text-center", sortable: true }
      ],
      currentPage: 1,
      perPage: 5,
      repos: this.$root.$data.repos,
      totalRows: this.$root.$data.repos.length,
      pageOptions: [5, 10, 15, 20, 25],
      filter: null,
      selected: []
    };
  },
  computed: {},
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    onRepoSelected(data) {
      data.item.selected = !data.item.selected;
      data.item._rowVariant = data.item.selected ? "danger" : "";
      this.$refs.table.refresh();
    },
    repoProvider() {
      return this.$root.$data.repos;
    },
    onRefreshed() {
      // computed and watchers wouldn't work...
      this.selected = this.repos.filter(function(repo) {
        return repo.selected;
      });
    }
  }
};
</script>

<style>
.repos-table__body td {
  vertical-align: middle;
}
</style>
