<template>
  <div>
    <h2 class="mb-0 mt-4">
      Select Repos to Modify
    </h2>

    <!-- Table Filter/Paging  -->
    <b-row class="mt-1 mt-md-5 mb-4">
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
      no-provider-paging
      no-provider-sorting
      no-provider-filtering
      caption-top
      show-empty
      tbody-class="repos-table__body"
      responsive="sm"
      empty-text="There are no repos to show"
      empty-filtered-text="There are no repos matching your keywords"
      :items="reposProvider"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      @filtered="onFiltered"
    >
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

          <!-- Badges -->
          <div>
            <b-badge
              v-if="data.item.isFork"
              variant="primary"
              class="mr-1"
              pill
            >
              Forked
            </b-badge>
            <b-badge
              v-if="data.item.isPrivate"
              class="mr-1"
              pill
            >
              Private
            </b-badge>
            <b-badge
              v-if="data.item.isArchived"
              class="mr-1"
              pill
            >
              Archived
            </b-badge>
          </div>
        </div>
        <p>
          {{ data.item.description }}
        </p>
        <small>Update {{ data.item.updatedAt | timeAgo }}</small>
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
          :disabled="data.item.isArchived && !showDelete"
          @change="onRepoSelected(data, $event)"
        />
      </template>
    </b-table>

    <div class="d-flex flex-wrap justify-content-center align-items-center flex-column flex-sm-row pt-3 pb-4">
      <!-- Invisible - Used to center and right align Pagination + Buttons -->
      <div class="col-2 mr-auto d-none d-lg-flex" />

      <!-- Pagination -->
      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        class="m-0 mx-lg-auto"
      />

      <b-button-group class="ml-auto">
        <!-- Delete Button -->
        <b-button
          v-if="showDelete"
          v-b-modal.confirmAction
          variant="danger"
          class="mt-4 mt-sm-0"
          :disabled="!hasSelectedRepos()"
        >
          Delete Repos
        </b-button>

        <!-- Archive Button -->
        <b-button
          v-if="!showDelete"
          v-b-modal.confirmAction
          variant="warning"
          class="mt-4 mt-sm-0"
          :disabled="!hasSelectedRepos()"
        >
          Archive repos
        </b-button>

        <b-dropdown
          :variant="showDelete ? 'danger' : 'warning'"
          right
        >
          <b-dropdown-item
            v-if="!showDelete"
            @click="toggleShowDelete"
          >
            Delete Repos
          </b-dropdown-item>
          <b-dropdown-item
            v-if="showDelete"
            @click="toggleShowDelete"
          >
            Archive Repos
          </b-dropdown-item>
        </b-dropdown>
      </b-button-group>
    </div>

    <ConfirmActionModal :show-delete="showDelete" />
  </div>
</template>

<script>
import { distanceInWordsToNow } from "date-fns";
import ConfirmActionModal from "@/components/ConfirmActionModal.vue";
import { selectedRepos } from "@/mixins.js";

export default {
  components: {
    ConfirmActionModal
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
        { key: "name", sortable: true },
        { key: "selected", class: "text-center" }
      ],
      currentPage: 1,
      perPage: 5,
      totalRows: this.$root.$data.repos.length,
      pageOptions: [5, 10, 15, 20, 25],
      filter: null,
      showDelete: true
    };
  },
  computed: {
    repoActionButtonText() {
      return (this.showDelete ? "Delete" : "Archive") + " Repos";
    }
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },

    // Set checked state and refresh table to ensure rowVariant takes effect
    onRepoSelected(data, isChecked) {
      data.item._rowVariant = isChecked ? this.getRowVariant() : null;
      this.refreshTable();
    },

    reposProvider() {
      return this.$root.$data.repos;
    },

    refreshTable() {
      if (!this.$refs.table) return;
      this.$refs.table.refresh();
    },

    toggleShowDelete() {
      this.showDelete = !this.showDelete;

      if (this.hasSelectedRepos()) {
        this.selectedRepos.forEach(repo => {
          if (repo.isSelected) {
            repo._rowVariant = this.getRowVariant();
          }
        });
      }
    },

    getRowVariant() {
      return this.showDelete ? "danger" : "warning";
    }
  }
};
</script>

<style>
.repos-table__body td {
  vertical-align: middle;
}

.badge {
  font-size: 60%;
  font-weight: normal;
}
</style>
