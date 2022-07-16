<template>
  <v-row>
    <v-col cols="12">
      <v-dialog :value="isExporting" max-width="450px">
        <v-sheet
          height="200"
          class="d-flex align-center justify-center">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
        </v-sheet>
      </v-dialog>
      <div class="d-flex" style="gap: 8px">
        <div class="d-flex flex-column">
          <DragAndDropFile :multiple="true" :ruta="'bills'" :types="'text/xml'" @uploadedItem="uploadedItem($event)"/>
        </div>
        <div class="d-flex flex-column">
          <v-btn color="success"
            @click="exportTableToExcel()">
            <v-icon
              left
            >
              mdi-microsoft-excel
            </v-icon>
            Export to Excel
          </v-btn>
        </div>
      </div>
    </v-col>
    <v-col cols="12">
      <Table :items="items" :headers="headers" :search="search" @changeSearch="changeSearch($event)" @getFileByUrl="getFileByUrl($event)"></Table>
    </v-col>
  </v-row>
</template>

<script>
import * as XLSX from 'xlsx/xlsx.mjs';
import { firestore } from '~/plugins/firebase.js'
import Table from '@/components/Table.vue'
import { addDoc, collection, onSnapshot, query } from '@firebase/firestore'
import DragAndDropFile from '../components/DragAndDropFile.vue'
export default {
  name: 'IndexPage',
  components: {
    Table,
    DragAndDropFile
},
  data () {
    return {
      items: [],
      headers: [
        {
          text: 'Serial Number',
          sortable: true,
          value: 'serialNumber',
        },
        {
          text: 'Issue Date',
          sortable: true,
          value: 'issueDate',
        },
        {
          text: 'Expiration Date',
          sortable: true,
          value: 'expirationDate',
        },
        {
          text: 'IGV',
          sortable: true,
          value: 'igv',
        },
        {
          text: 'Tax Base',
          sortable: true,
          value: 'taxBase',
        },
        {
          text: 'Total',
          sortable: true,
          value: 'total',
        },
        {
          text: 'File URL',
          sortable: true,
          value: 'fileUrl',
        },
      ],
      search: '',
      numberBills: 0,
      rules: {
        numberBills: [
          v => !!v || 'Number of Bills is required',
          v => v > 0 || 'Dont must be zero'
        ]
      },
      isExporting: false,
      validForm: false
    }
  },
  computed: {
    numberBillsComputed: {
      get(){
        return this.numberBills
      },
      set(value){
        this.numberBills = Number(value)
      }
    }
  },
  methods: {
    changeSearch($event){
      this.search = $event
    },
    async getBills(){
      const billsQuery = query(
        collection(firestore, 'bills')
      )
      onSnapshot(billsQuery, (querySnapShot) => {
        this.items = querySnapShot.docs.map((e) => {
          return {
            ...e.data(),
            id: e.id
          }
        })
      })
    },
    async createBills(bill, fileUrl, fileName){
      const billsCollection = collection(firestore, 'bills')
      const newDoc = await addDoc(billsCollection, {
        serialNumber: bill.serialNumber,
        issueDate: bill.issueDate,
        expirationDate: bill.expirationDate,
        igv: bill.igv,
        taxBase: bill.taxBase,
        total: bill.total,
        fileName,
        fileUrl
      })
    },
    async uploadedItem($event){
      await this.createBills($event.result, $event.downloadUrl, $event.file.name)
    },
    async exportTableToExcel(){
      this.isExporting = true
      const worksheet = await XLSX.utils.json_to_sheet(this.items);
      const workbook = await XLSX.utils.book_new();
      await XLSX.utils.book_append_sheet(workbook, worksheet, "Bills");
      await XLSX.writeFile(workbook, "Bills.xlsx");
      this.isExporting = false
    }
  },
  created(){
    this.getBills()
  }
}
</script>
