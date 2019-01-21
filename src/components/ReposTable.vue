<template>
  <div>
    <h1 class="mb-0">
      You Have {{ repoCount }} Repos:
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
      :items="repoProvider"
      :fields="fields"
      tbody-class="repos-table__body"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      no-provider-paging
      no-provider-sorting
      no-provider-filtering
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
          plain
          buttons
          class="mx-0"
          @click.native.stop="repoSelected(data)"
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
      fields: ["name", "details", { key: "selected", class: "text-center" }],
      currentPage: 1,
      perPage: 5,
      totalRows: this.$root.$data.repos.length,
      pageOptions: [5, 10, 15, 20, 25],
      filter: null
    };
  },
  computed: {
    repoCount() {
      return this.$root.$data.repos.length;
    }
  },
  methods: {
    onFiltered(filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    repoSelected(data) {
      console.log(data);
      data.item.selected = !data.item.selected;
      data.item._rowVariant = data.item.selected ? "danger" : "";
      this.$refs.table.refresh();
    },
    repoProvider() {
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
