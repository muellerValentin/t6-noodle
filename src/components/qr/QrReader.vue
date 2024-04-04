<!-- 
description: QR code reader for the registration of the users. Used in the registration process.
author: @daniel.vollmer, @valentin.müller, @luca.breisch (design)
 -->
<template>
  <q-ajax-bar ref="bar" position="bottom" color="accent" size="10px" />
  <q-banner v-if="!inMosbach" class="text-white bg-red">
    Es wird gerade geprüft, ob Sie sich in Mosbach befinden. Ist dies nicht der
    Fall, wird der Inhalt der Seite nicht laden.
  </q-banner>
  <q-card v-else class="card_outer q-ma-lg q-mt-xl">
    <q-btn
      class="q-mt-md"
      to="/overview"
      flat
      bg-color="standard"
      color="primary"
      size="sm"
      icon="arrow_back"
      label="zurück"
    />
    <q-card class="card_inner">
      <q-skeleton
        v-if="!videoPlaying"
        @click="toggleVideo"
        class="camera-icon-container"
        height="200px"
        square
        ><q-icon @click="toggleVideo" name="photo_camera" size="15vw"
      /></q-skeleton>
      <q-skeleton
        v-else-if="videoPlaying === 'qrCodeDetected'"
        class="camera-icon-container"
        height="200px"
        @click="toggleVideo"
        square
        ><q-icon @click="toggleVideo" color="green" name="check" size="10vw"
      /></q-skeleton>
      <q-skeleton
        v-else-if="videoPlaying === 'qrCodeNotValidated'"
        class="camera-icon-container"
        height="200px"
        @click="toggleVideo"
        square
        ><q-icon @click="toggleVideo" color="red" name="close" size="10vw"
      /></q-skeleton>

      <video v-else style="width: 100%" ref="videoStream" autoplay></video>
    </q-card>

    <q-dialog v-model="dialogOpen">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="qr_code" color="primary" text-color="white" />
          <span class="q-ml-sm">QR-Code erkannt!</span>
        </q-card-section>

        <q-card-section v-if="qrContent">
          <div>Vorname: {{ qrContent.forename }}</div>
          <div>Nachname: {{ qrContent.lastname }}</div>
          <div>Rolle: {{ qrContent.role }}</div>
          <div>Seriennummer: {{ qrContent.serialNumber }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="primary"
            v-close-popup
            @click="videoPlaying = 'qrCodeNotValidated'"
          />
          <q-btn
            flat
            label="Registrierung bestätigen"
            color="primary"
            v-close-popup
            @click="toggleRegistration"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="seamless" seamless position="bottom">
      <q-card style="width: 350px">
        <q-linear-progress :value="1" color="primary" />

        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-weight-bold">Hinweis</div>
            <div class="text-grey">
              Zum Scannen vom QR-Code auf das obige Icon klicken.
            </div>
          </div>

          <q-space />

          <q-btn flat round icon="photo_camera" />

          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
/**
 * IMPORTS
 */
import readQrCode from "src/helpers/qr/qr";
import { confirmRegistration } from "src/helpers/firebase/firebase.js";
import { readFile, writeFile } from "src/helpers/util.js";
import { onMounted, ref } from "vue";
import { checkPosition } from "src/helpers/geolocation/geolocation.js";
import { get, set } from "https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js";

/**
 * VARIABLES
 */
const bar = ref();
const inMosbach = ref(false);
const videoStream = ref(null);
const videoPlaying = ref(false);
const qrContent = ref(null);
const dialogOpen = ref(false);
let intervalId = null;
const alert = ref(false);
const seamless = ref(true);
const videoStreamForAborting = ref();

/**
 * HOOKS
 */
onMounted(() => {
  (async () => {
    bar.value.start();
    const result = await checkPosition();
    bar.value.stop();
    inMosbach.value = result;
  })();
});

/**
 * FUNCTIONS
 */

/**
 * Detects the QR code from the video stream and stops the video stream if a QR code is detected.
 * @author daniel.vollmer
 */
async function detectCode() {
  const canReadQrCode = await readQrCode(videoStream.value, true);
  if (canReadQrCode) {
    // Stop the video stream because a qr code was detected
    videoStreamForAborting.value.getTracks().forEach((track) => {
      track.stop();
    });
    videoPlaying.value = "qrCodeDetected";
    qrContent.value = canReadQrCode;
    dialogOpen.value = true;
    // Stop the interval for scanning qr code because a qr code was detected
    clearInterval(intervalId);
  }
}

/**
 * Toggles the video stream and starts the interval for detecting the qr code.
 * @author valentin.müller
 */
async function toggleVideo() {
  if (videoPlaying.value === true) {
    clearInterval(intervalId);
  } else {
    videoPlaying.value = true;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = {
        video: {
          facingMode: "environment",
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoStreamForAborting.value = stream;
      videoStream.value.srcObject = stream;
      videoStream.value.play();
      intervalId = setInterval(detectCode, 1000);
    }
  }
}

/**
 * Function for toggling the registration of the user.
 * The function confirms the registration of the user and triggers the writing of the mapping file.
 * @author daniel.vollmer, valentin.müller
 */
async function toggleRegistration() {
  const id = qrContent.value.id;
  try {
    await confirmRegistration(id);
    try {
      const fileHandleOrUndefined = await get("file");
      if (fileHandleOrUndefined) {
        saveOrUpdateFile(fileHandleOrUndefined);
        return;
      }
      const [fileHandle] = await window.showOpenFilePicker();
      await set("file", fileHandle);
      // used for the mapping file
      saveOrUpdateFile(fileHandle);
      console.log(`Stored file handle for "${fileHandle.name}" in IndexedDB.`);
    } catch (error) {
      alert(error.name, error.message);
    }
    console.log("Registrierung bestätigt");
  } catch (error) {
    videoPlaying.value = "qrCodeNotValidated";
    console.error("Fehler bei der Bestätigung der Registrierung:", error);
  }
}

/**
 * Saves or updates the mapping file with the qr code content.
 * @param fileHandle
 * @author daniel.vollmer
 */
async function saveOrUpdateFile(fileHandle) {
  try {
    const handle = fileHandle;
    let existingData = [];
    try {
      const text = await readFile(handle);
      existingData = JSON.parse(text);
    } catch (error) {
      console.log(
        "Die ausgewählte Datei konnte nicht gelesen werden oder ist leer. Ein neuer Inhalt wird erstellt."
      );
    }
    let updatedData = [];
    if (existingData.length > 0) {
      // Add existing data to the updated data
      for (let entry of existingData) {
        updatedData.push(entry);
      }
    }
    updatedData.push(qrContent.value);
    await writeFile(handle, JSON.stringify(updatedData, null, 2));
    console.log("Datei erfolgreich aktualisiert.");
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Datei:", error);
  }
}
</script>

<style scoped>
.card_outer {
  max-width: 500px;
  aspect-ratio: 1/1;
  margin: 0 auto;
}
.card_inner {
  width: 100%;
  height: 100%;
}
.camera-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100% !important;
  background-color: #d1d1d1;
  border-radius: 2px;
}
</style>
