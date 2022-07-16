<template>
    <v-card>
        <v-card-title>
            <v-text-field v-model="searchComputed" append-icon="mdi-magnify" label="Search" single-line hide-details>
            </v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="items" :search="search">
            <template v-slot:item.fileUrl="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-chip @click="getFile(item.fileUrl, item.fileName)"
                            color="primary"
                            v-bind="attrs"
                            v-on="on">
                                <v-icon left>
                                    mdi-download
                                </v-icon>
                                {{item.fileName}}
                            </v-chip>
                    </template>
                    <span>Clic para Descargar</span>
                </v-tooltip>                
            </template>
        </v-data-table>
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
  },
  methods: {
    getFile(url, fileName){
        try {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function () {
                const blob = xhr.response;
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
                URL.revokeObjectURL(link.href);
            };
            xhr.open('GET', url);
            xhr.send();
        } catch (error) {
            console.log("error",error)
        }
    }
  }
}
</script>