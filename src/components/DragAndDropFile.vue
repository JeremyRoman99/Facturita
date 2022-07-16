<template>
    <div>
        <div cols="12">
            <v-btn @click="dialog = true"
              color="primary">Upload Files</v-btn>
        </div>
        <div cols="12">
            <v-dialog @click:outside="closeDialog" :value="dialog" max-width="450px">
                <v-card v-if="!isLoading"
                  @drop.prevent="onDrop($event)"
                  @dragover.prevent="dragover = true"
                  @dragenter.prevent="dragover = true"
                  @dragleave.prevent="dragover = false"
                  :class="{ 'grey lighten-2': dragover }"
                  >
                  <v-card-text>
                      <v-row class="d-flex flex-column" dense align="center" justify="center">
                      <v-icon :class="[dragover ? 'mt-2, mb-6' : 'mt-5']" size="60">
                          mdi-cloud-upload
                      </v-icon>
                      <p>
                          Drop your file(s) here, or click to select them.
                      </p>
                      </v-row>
                      <v-virtual-scroll
                      v-if="uploadedFiles.length > 0"
                      :items="uploadedFiles"
                      height="150"
                      item-height="50"
                      >
                      <template v-slot:default="{ item }">
                          <v-list-item :key="item.name">
                          <v-list-item-content>
                              <v-list-item-title>
                              {{ item.name }}
                              <span class="ml-3 text--secondary">
                                  {{ item.size }} bytes</span
                              >
                              </v-list-item-title>
                          </v-list-item-content>

                          <v-list-item-action>
                              <v-btn @click.stop="removeFile(item.name)" icon>
                              <v-icon> mdi-close-circle </v-icon>
                              </v-btn>
                          </v-list-item-action>
                          </v-list-item>

                          <v-divider></v-divider>
                      </template>
                      </v-virtual-scroll>
                  </v-card-text>
                  <v-card-actions>
                      <v-spacer></v-spacer>

                      <v-btn @click="closeDialog" icon>
                        <v-icon id="close-button">mdi-close</v-icon>
                      </v-btn>

                      <v-btn @click="uploadAllFiles" icon>
                        <v-icon id="upload-button">mdi-upload</v-icon>
                      </v-btn>
                  </v-card-actions>
                </v-card>
                <v-sheet
                  v-else
                  height="200"
                  class="d-flex align-center justify-center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                    ></v-progress-circular>
                </v-sheet>
            </v-dialog>
        </div>
    </div>
</template>

<script>
import { storage } from '~/plugins/firebase.js'
import { ref, uploadString, getDownloadURL, getMetadata } from '@firebase/storage'
export default {
  name: "Upload",
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    ruta: {
        type: String,
        default: ''
    },
    types: {
        type: String,
    }
  },
  data() {
    return {
        dialog: false,
        dragover: false,
        isLoading: false,
        uploadedFiles: []
    };
  },
  methods: {
    closeDialog() {
      this.uploadedFiles = [];
      this.dialog = false
    },    
    removeFile(fileName) {
      const index = this.uploadedFiles.findIndex(
        file => file.name === fileName
      );
      // If file is in uploaded files remove it
      if (index > -1) this.uploadedFiles.splice(index, 1);
    },
    async onDrop(e) {
      this.dragover = false;
      // Check if there are already uploaded files
      if (!this.multiple && e.dataTransfer.files.length > 1) {
        this.$store.dispatch("addNotification", {
          message: "Only one file can be uploaded at a time..",
          colour: "error"
        });
      } else{
        for (const file of e.dataTransfer.files) {
            if(file.type == this.types){
                this.uploadedFiles.push(file)
            }
        }
      }
    },
    async uploadFile(file){
      return await new Promise( (resolve, reject) =>{
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const result = reader.result
          const { snapshot, downloadUrl, metadata } = await this.saveFile(`${this.ruta}/${file.name}`, result)
          if(snapshot){
            resolve({ snapshot, downloadUrl, metadata })
          }else{
            reject()
          }
        }
      })
    },
    async saveFile(fullPath, file){
      const storageRef = ref(storage, fullPath)
      const snapshot = await uploadString(storageRef, file, 'data_url')

      if(snapshot){
        const downloadUrl = await getDownloadURL(snapshot.ref)
        const metadata = await getMetadata(storageRef)
        return { snapshot, downloadUrl, metadata }
      }
    },
    async uploadAllFiles() {
      this.isLoading = true
        for (const file of this.uploadedFiles) {
            const { snapshot, downloadUrl, metadata } = await this.uploadFile(file)
            const result = await this.readFile(file)
            let detailUpload = {
                snapshot,
                downloadUrl,
                metadata,
                file,
                result
            }
            await this.$emit('uploadedItem', detailUpload)
        }
        this.dialog = false
        this.isLoading = false
    },
    async readFile(file){
        return await new Promise( (resolve, reject) => {
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onloadend = async () => {
                /* console.log(reader.result); */
                let XMLData = reader.result;
                let parser = new DOMParser();
                let xmlDOM = parser.parseFromString(XMLData, 'application/xml');
                let data = await this.loadXML(xmlDOM);
                if(!!data.reference){
                    resolve(data)
                }else{
                    reject()
                }
            }
        })
    },
    loadXML(xml){
        let serialNumber = xml.getElementsByTagName("cbc:ID")[2].childNodes[0].nodeValue;
        let issueDate = xml.getElementsByTagName("cbc:IssueDate")[0].childNodes[0].nodeValue;
        let reference = xml.getElementsByTagName("cbc:ID")[0].childNodes[0].nodeValue;
        let taxBase = parseFloat(xml.getElementsByTagName("cbc:Amount")[0].childNodes[0].nodeValue).toFixed(2);
        let total = parseFloat(taxBase / 1.18).toFixed(2);
        let igv = parseFloat(total * 0.18).toFixed(2);
        let concept = xml.getElementsByTagName("cbc:Description")[0].childNodes[0].nodeValue;
        let expirationDate = xml.getElementsByTagName("cbc:PaymentDueDate")[0].childNodes[0].nodeValue;
        return {
            serialNumber,
            issueDate,
            reference,
            taxBase,
            total,
            igv,
            concept,
            expirationDate
        }
    }
  }
};
</script>