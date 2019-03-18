<template>
  <div>
    <h2 class="title">
      Select Repos to Modify
    </h2>

    <!-- Table Filter/Paging  -->
    <div class="columns">
      <div class="column">
        <b-field grouped>
          <!-- Per Page -->
          <b-select v-model="perPage">
            <option value="5">
              5 per page
            </option>
            <option value="10">
              10 per page
            </option>
            <option value="15">
              15 per page
            </option>
            <option value="20">
              20 per page
            </option>
          </b-select>

          <!-- Repo Show Filter -->
          <div class="control is-flex">
            <b-switch
              v-model="showPrivateRepos.state"
              native-value="isPrivate"
            >
              <b-icon icon="lock" />
              Private
            </b-switch>
          </div>
          <div class="control is-flex">
            <b-switch
              v-model="showArchivedRepos.state"
              native-value="isArchived"
            >
              <b-icon icon="archive" />
              Archived
            </b-switch>
          </div>
          <div class="control is-flex">
            <b-switch
              v-model="showForkedRepos.state"
              native-value="isFork"
            >
              <b-icon icon="code-branch" />
              Forked
            </b-switch>
          </div>


          <!-- Searchbox -->
          <b-input
            v-model="searchFilter"
            type="search"
            icon="search"
            placeholder="Enter keywords..."
            class="search-filter"
          />
        </b-field>
      </div>
    </div>

    <!-- Repo Table -->
    <b-table
      ref="table"
      paginated
      pagination-simple
      checkable
      :data="reposProvider"
      :checked-rows.sync="checkedRows"
      :current-page.sync="currentPage"
      :row-class="(row, index) => row.rowClass"
      :per-page="perPage"
      default-sort="updatedAt"
      default-sort-direction="desc"
      @check="onRepoChecked"
    >
      <!-- Name Col -->
      <template
        slot-scope="props"
      >
        <b-table-column
          sortable
          field="name"
          label="Name"
        >
          <div class="repo__header">
            <h5 class="repo__header__title has-text-weight-bold	is-size-5">
              <a :href="props.row.url">
                {{ props.row.name }}
              </a>
            </h5>
            <!-- Forked from... -->
            <small
              v-if="props.row.parent"
            >
              Forked from
              <a
                :href="props.row.parent.url"
                class="text-dark"
              >
                {{ props.row.parent.nameWithOwner }}
              </a>
            </small>

            <!-- Badges -->
            <b-taglist>
              <b-tag
                v-if="props.row.isFork"
                class="is-info"
              >
                Forked
              </b-tag>
              <b-tag
                v-if="props.row.isPrivate"
                class="is-dark"
              >
                Private
              </b-tag>
              <b-tag
                v-if="props.row.isArchived"
                class="is-dark"
              >
                Archived
              </b-tag>
            </b-taglist>
          </div>

          <p>
            {{ props.row.description }}
          </p>
        </b-table-column>

        <!-- Last Edited -->
        <b-table-column
          sortable
          label="Last Updated"
          field="updatedAt"
        >
          <small class="is-capitalized">
            {{ props.row.updatedAt | timeAgo }}
          </small>
        </b-table-column>
      </template>

      <!-- Delete/Archive Repo Button -->
      <template slot="bottom-left">
        <b-field>
          <p class="control">
            <button
              :class="['button',
                       'is-medium',
                       showDelete ? 'is-danger' : 'is-warning']"
              :disabled="!hasSelectedRepos()"
              @click="showConfirmModal = true"
            >
              <b-icon
                :icon="showDelete ? 'trash' : 'archive'"
              />
              <span class="has-text-weight-bold">
                {{ showDelete ? "Delete" : "Archive" }} Selected Repos
              </span>
            </button>
          </p>

          <p class="control">
            <b-dropdown
              right
            >
              <button
                slot="trigger"
                :class="['button',
                         'is-medium',
                         showDelete ? 'is-danger' : 'is-warning']"
              >
                <b-icon icon="caret-down" />
              </button>

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
          </p>
        </b-field>
      </template>
    </b-table>

    <b-modal
      :active.sync="showConfirmModal"
      has-modal-card
      class="dialog"
    >
      <TheConfirmActionModal :show-delete="showDelete" />
    </b-modal>
  </div>
</template>

<script>
import { distanceInWordsToNow } from "date-fns";
import { selectedRepos } from "@/mixins.js";
import TheConfirmActionModal from "@/components/TheConfirmActionModal.vue";

export default {
  components: {
    TheConfirmActionModal
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
      searchFilter: "",
      showDelete: true,
      showConfirmModal: false,
      showPrivateRepos: { value: "isPrivate", state: true },
      showArchivedRepos: { value: "isArchived", state: true },
      showForkedRepos: { value: "isFork", state: true },
      checkedRows: []
    };
  },
  computed: {
    repoActionButtonText() {
      return (this.showDelete ? "Delete" : "Archive") + " Repos";
    },

    reposProvider() {
      let repos = this.$root.$data.repos.filter(repo => {
        let show = true;
        [
          this.showForkedRepos,
          this.showPrivateRepos,
          this.showArchivedRepos
        ].forEach(prop => {
          if (prop.state === false && repo[prop.value]) show = false;
        });
        return show;
      });

      var filter_re = new RegExp(this.searchFilter, "i");

      let out = [];
      for (let i in repos) {
        if (repos[i].name.match(filter_re)) {
          out.push(repos[i]);
        }
      }
      return out;
    }
  },

  methods: {
    // Set checked state on all repos based on presence in
    // table's 'checkedRepos' array
    onRepoChecked(checkedRepos) {
      this.$root.$data.repos.forEach(function(repo) {
        repo.isSelected = checkedRepos.find(
          checkedRepo => checkedRepo.id === repo.id
        );
      });
    },

    toggleShowDelete() {
      this.showDelete = !this.showDelete;

      if (this.hasSelectedRepos()) {
        this.selectedRepos.forEach(repo => {
          if (repo.isSelected) {
            // repo.rowClass = this.getRowVariant();
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.search-filter {
  margin-left: auto;
}

table td {
  vertical-align: middle;
  font-size: 16px;
}

.repo__header {
  margin-bottom: 0.8em;

  &__title {
  }

  .tags {
    font-size: 1.2rem;
    margin-top: 0.2em;
    font-weight: bold;

    .is-dark {
      background-color: #666;
    }
  }
}

.tag {
  font-size: 60%;
}
</style>
