<template>
    <v-card>
        <v-card-title>
            <v-text-field v-model="searchComputed" append-icon="mdi-magnify" label="Search" single-line hide-details>
            </v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="items" :search="search"></v-data-table>
    </v-card>
</template>
<script>
export default {
  name: 'Table',
  props: {
    items: {
        type: Array,
        default: () => []
    },
    headers: {
        type: Array,
        default: () => []
    },
    search: {
        type: String,
        default: ''
    }
  },
  computed: {
    searchComputed: {
        get() {
            return this.search
        },
        set(value) {
            this.$emit('changeSearch', value)
        }
    }
  }
}
</script>