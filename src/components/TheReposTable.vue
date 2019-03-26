<template>
  <div class="container">
    <h2 class="title">
      Select Repos to Modify
    </h2>

    <!-- Table Filter/Paging  -->
    <div class="columns">
      <!-- Per Page Select -->
      <div class="column is-narrow-tablet">
        <b-field>
          <b-select
            v-model="perPage"
            expanded
          >
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
        </b-field>
      </div>

      <!-- Repo Show/Hide Filters -->
      <div class="column is-flex">
        <b-field grouped>
          <div class="control is-flex">
            <b-switch
              v-model="showPrivateRepos.state"
              native-value="isPrivate"
              type="is-info"
            >
              <b-icon
                icon="lock"
                class="is-hidden-mobile has-text-grey"
                size="is-small"
              />
              Private
            </b-switch>
          </div>
          <div class="control is-flex">
            <b-switch
              v-model="showArchivedRepos.state"
              native-value="isArchived"
              type="is-info"
            >
              <b-icon
                icon="archive"
                class="is-hidden-mobile has-text-grey"
                size="is-small"
              />
              Archived
            </b-switch>
          </div>
          <div class="control is-flex">
            <b-switch
              v-model="showForkedRepos.state"
              native-value="isFork"
              type="is-info"
            >
              <b-icon
                icon="code-branch"
                class="is-hidden-mobile has-text-grey"
                size="is-small"
              />
              Forked
            </b-switch>
          </div>
        </b-field>
      </div>

      <!-- Searchbox -->
      <div class="column is-narrow-tablet">
        <b-field>
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
      <!-- Empty Table Content -->
      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon
                pack="far"
                icon="frown"
                size="is-large"
              />
            </p>
            <p>Hmm. It looks like you have no repos.</p>
          </div>
        </section>
      </template>

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
        <b-field has-addons>
          <p class="control is-expanded">
            <button
              :class="['button',
                       'is-medium',
                       'is-fullwidth',
                       showDelete ? 'is-danger' : 'is-warning']"
              :disabled="!hasSelectedRepos()"
              @click="showConfirmModal()"
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
      showPrivateRepos: { value: "isPrivate", isEnabled: true },
      showArchivedRepos: { value: "isArchived", isEnabled: true },
      showForkedRepos: { value: "isFork", isEnabled: true },
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
          // Hide if repo matches disabled filter
          if (prop.isEnabled === false && repo[prop.value]) show = false;
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

    isRowCheckable(row) {
      if (row.isArchived && !this.showDelete) return false;
      return true;
    },

    toggleShowDelete() {
      this.showDelete = !this.showDelete;
    },

    showConfirmModal() {
      // if archiving, filter out any repos that are already archived
      const selectedRepos = this.checkedRows.filter(row => {
        if (row.isArchived && !this.showDelete) {
          return false;
          }
        return true;
        });

      this.$modal.open({
        parent: this,
        hasModalCard: true,
        component: TheConfirmActionModalVue,
        props: {
          repos: selectedRepos,
          showDelete: this.showDelete
      }
      });
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
