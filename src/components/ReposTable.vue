<template>
  <div>
    <h2 class="mb-0 mt-4">
      Select Repos to Delete
    </h2>

    <!-- Table Filter/Paging  -->
    <b-row class="mt-5 mb-4">
      <!-- Per Page -->
      <b-col
        md="3"
        class="my-3 my-md-0"
      >
        <b-form-group
          horizontal
          label="Per page"
          class="mb-0"
          label-cols="6"
        >
          <b-form-select
            v-model="perPage"
            :options="pageOptions"
          />
        </b-form-group>
      </b-col>

      <!-- Searchbox -->
      <b-col
        md="6"
        class="my-3 my-md-0 ml-auto"
      >
        <b-form-group
          horizontal
          class="mb-0"
        >
          <b-input-group>
            <b-form-input
              v-model="filter"
              placeholder="Enter keywords"
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
    </b-row>


    <!-- Repo Table -->
    <b-table
      ref="table"
      hover
      outlined
      tbody-class="repos-table__body"
      responsive="sm"
      no-provider-paging
      no-provider-sorting
      no-provider-filtering
      caption-top
      show-empty
      :items="reposProvider"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      @filtered="onFiltered"
    >
      <!-- Table Caption -->
      <!-- <template slot="table-caption">
        <span>Number of Repos: {{ repos.length }}</span>
        <span class="mx-2">
          |
        </span>
        <span>Selected: {{ selected.length }}</span>
      </template> -->

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
          v-model="data.item.isSelected"
          button-variant="primary"
          class="mx-0"
          @change="onRepoSelected(data, $event)"
        />
      </template>
    </b-table>

    <div class="d-flex flex-wrap justify-content-center align-items-center flex-column flex-sm-row pt-3 pb-4">
      <!-- Invisible -->
      <div class="col-2 mr-auto d-none d-lg-flex" />

      <!-- Pagination -->
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        class="m-0 mx-lg-auto"
      />

      <!-- Delete Button -->
      <b-button
        v-b-modal.confirmDelete
        variant="danger"
        class="ml-sm-auto mt-4 mt-sm-0 col-6 col-sm-5 col-md-3 col-lg-2"
        :disabled="!hasSelectedRepos()"
      >
        Delete Repos
      </b-button>
    </div>
    <ConfirmDeleteModal />
  </div>
</template>

<script>
import { distanceInWordsToNow } from "date-fns";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal.vue";
import { selectedRepos } from "@/mixins.js";

export default {
  components: {
    ConfirmDeleteModal
  },
  filters: {
    timeAgo: function(value) {
      return distanceInWordsToNow(new Date(value), {
        addSuffix: true,
        includeSeconds: true
      });
    }
  },
  mixins: [selectedRepos],
  data() {
    return {
      fields: [
        "name",
        "details",
        { key: "selected", class: "text-center", sortable: true }
      ],
      currentPage: 1,
      perPage: 5,
      totalRows: this.$root.$data.repos.length,
      pageOptions: [5, 10, 15, 20, 25],
      filter: null
    };
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    onRepoSelected(data, isChecked) {
      data.item._rowVariant = isChecked ? "danger" : null;
      this.$refs.table.refresh();
    },
    reposProvider() {
      return this.$root.$data.repos;
    }
  }
};
</script>

<style>
.repos-table__body td {
  vertical-align: middle;
}
</style>
