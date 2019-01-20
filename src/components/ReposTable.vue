<template>
  <div>
    <h2>Repositories</h2>
    <b-table
      striped
      hover
      :items="$root.$data.repos"
      :fields="fields"
    >
      <template
        slot="name"
        slot-scope="data"
      >
        <b-link
          :href="data.item.url"
          class="text-dark"
        >
          {{ data.value }}
        </b-link>
      </template>

      <template
        slot="selected"
        slot-scope="data"
      >
        <b-form-checkbox
          :id="`selected-${data.item.name}`"
          v-model="selected"
          class="mx-0"
        />
      </template>
    </b-table>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        fields: [
          {
            key: 'name',
            sortable: true
          },
          {
            key: 'description',
            sortable: false
          },
          {
            key: 'selected',
            class: "text-center"
          }
        ],
      }
    }
  }
</script>

<style scoped>

</style>
