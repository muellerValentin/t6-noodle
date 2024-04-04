<!-- 
description: NFC scanner for scanning student IDs
author: @valentin.müller, @luca.breisch (design)
 -->
<template>
  <q-page class="flex flex-center flex-direction-column">
    <h2 class="text-h5">NFC-Scanner</h2>
    <p>Scannen Sie die Studierendenausweise per NFC ein:</p>

    <div class="q-select">
      <q-select
        class="q-mt-sm"
        filled
        v-model="year"
        :options="years"
        label="Jahrgang"
      />
    </div>

    <div class="card-container">
      <q-card class="bg-primary text-white text-center q-pa-md">
        <q-card-section class="row items-center justify-center">
          <div class="nfc-icon-container">
            <q-icon class="icon" name="nfc" size="40vw" />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="flex flex-center flex-direction-column nfc-scan">
      <q-btn
        label="NFC-Scan starten"
        :class="{ supported: nfcSupported, 'not-supported': !nfcSupported }"
        @click="openDialog"
        :disabled="!year"
      />
      <q-btn
        class="nfcActive q-mt-sm"
        v-if="nfcActive"
        color="red"
        label="NFC deaktivieren"
        @click="deactivateNfc"
      />

      <q-dialog v-model="dialogOpen">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="nfc" color="primary" text-color="white" />
            <span class="q-ml-sm">{{ dialogMessage }}</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Abbrechen" color="primary" v-close-popup />
            <q-btn
              flat
              label="NFC aktivieren"
              color="primary"
              v-if="nfcSupported"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="scanDialogOpen">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="nfc" color="primary" text-color="white" />
            <h5>Scan erfolgreich!</h5>
            <span class="q-ml-sm"
              >Der Studierendenausweis wurde erfolgreich gescannt.</span
            >
            <span class="q-ml-sm">{{ scanContent }}</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="OK" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
/**
 * IMPORTS
 */
import { ref, onMounted } from "vue";
import { recordAttendance } from "src/helpers/firebase/firebase.js";
import { getYears } from "src/helpers/util.js";

/**
 * VARIABLES
 */
const nfcSupported = ref(false);
const dialogMessage = ref("");
const dialogOpen = ref(false);
let abortController;
let reader;
const nfcActive = ref(false);
const scanContent = ref("");
const serialNumber = ref(localStorage.getItem("serialNumber"));
const scanDialogOpen = ref(false);
const year = ref("");
const years = getYears().map((year) => `ON${year}`);

/**
 * HOOKS
 */
onMounted(() => {
  if ("NDEFReader" in window) {
    nfcSupported.value = true;
    reader = new NDEFReader();
  }
});

/**
 * FUNCTIONS
 */

/**
 * Opens the dialog to start the NFC scan
 * @returns {Promise<void>}
 * @author valentin.müller
 */
async function openDialog() {
  dialogMessage.value = nfcSupported.value
    ? "NFC-Scan starten?"
    : "Dein Gerät unterstützt leider nicht den NFC-Scan!";
  dialogOpen.value = true;

  if (nfcSupported.value) {
    try {
      //needed for stopping the NFC scan
      abortController = new AbortController();
      // Start the NFC scan
      await reader.scan({ signal: abortController.signal });
      nfcActive.value = true;
      reader.onreading = async ({ serialNumber: readSerialNumber }) => {
        scanContent.value = `Seriennummer: ${readSerialNumber}`;
        serialNumber.value = `${readSerialNumber}`;
        scanDialogOpen.value = true;
        try {
          if (readSerialNumber) {
            await recordAttendance(readSerialNumber, year.value);
          }
        } catch (error) {
          console.log("Error: " + error);
        }
      };
    } catch (error) {
      console.log("Error: " + error);
    }
  }
}

/**
 * Deactivates the NFC scan
 * @returns {Promise<void>}
 * @author luca.breisch
 */
async function deactivateNfc() {
  abortController.abort();
  nfcActive.value = false;
}
</script>

<style scoped>
.q-select {
  padding-bottom: 1rem;
}
.card-container {
  width: 80%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  position: relative;
}

.card-container .q-card {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.supported {
  background-color: green;
  color: white;
}

.not-supported {
  background-color: red;
}
.flex-direction-column {
  flex-direction: column !important;
}

.nfc-scan {
  margin-top: 1rem;
}

label.q-field {
  width: 130px;
}
</style>
