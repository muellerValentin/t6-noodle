<template>
  <q-card class="q-ma-lg q-mt-xl">
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
    <q-card>
      <div></div>
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
          <!-- <div>ID: {{ qrContent.id }}</div> -->
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Abbrechen"
            color="primary"
            v-close-popup
            @click="videoPlaying === 'qrCodeNotValidated'"
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
import readQrCode from "src/helpers/qr/qr";
import { confirmRegistration } from "src/helpers/firebase/firebase.js";
import { onMounted, ref } from "vue";
import { get, set } from "https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js";

const seamless = ref(true);
const videoStream = ref(null);
const videoPlaying = ref(false);
const dialogOpen = ref(false);
const qrContent = ref(null);
let intervalId = null;

async function detectCode() {
  const test = await readQrCode(videoStream.value, true);
  console.log(test);
  if (test) {
    videoStream.value.pause();
    videoPlaying.value = "qrCodeDetected";
    qrContent.value = test;
    console.log("qrContent:" + qrContent.value);
    dialogOpen.value = true;
    clearInterval(intervalId);
  }
}

async function toggleVideo() {
  if (videoPlaying.value === true) {
    console.log("test");
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
      videoStream.value.srcObject = stream;
      videoStream.value.play();
      intervalId = setInterval(detectCode, 1000);
    }
  }
  //videoPlaying.value = !videoPlaying.value;
}

/*
function toggleRegistration() {
  console.log("Registrierung bestätigt");

} */

async function accessFile() {
  // Get the root directory handle
  const rootDirectory = await navigator.storage.getDirectory();

  // Create or get a file named "example.txt"
  const fileHandle = await rootDirectory.getFileHandle("example.txt", {
    create: true,
  });

  // Write to the file
  const writableStream = await fileHandle.createWritable();
  await writableStream.write("Hello, OPFS!");
  await writableStream.close();

  // Read from the file
  const file = await fileHandle.getFile();
  const contents = await file.text();
  console.log(contents); // Outputs the content of "example.txt"
}

async function toggleRegistration() {
  const id = qrContent.value.id;
  try {
    await confirmRegistration(id);
    //accessFile().catch(console.error);
    try {
      const fileHandleOrUndefined = await get("file");
      if (fileHandleOrUndefined) {
        saveOrUpdateFile(fileHandleOrUndefined);
        return;
      }
      const [fileHandle] = await window.showOpenFilePicker();
      await set("file", fileHandle);
      saveOrUpdateFile(fileHandle);
      console.log(`Stored file handle for "${fileHandle.name}" in IndexedDB.`);
    } catch (error) {
      alert(error.name, error.message);
    }

    saveOrUpdateFile();
    console.log("Registrierung bestätigt");
  } catch (error) {
    videoPlaying.value = "qrCodeNotValidated";
    console.error("Fehler bei der Bestätigung der Registrierung:", error);
  }
}

async function readFile(handle) {
  const file = await handle.getFile();
  const text = await file.text();
  return text;
}

async function writeFile(handle, text) {
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

async function saveOrUpdateFile(fileHandle) {
  try {
    const handle = fileHandle;
    let existingData = {};
    try {
      const text = await readFile(handle);
      existingData = JSON.parse(text);
      console.log(existingData);
    } catch (error) {
      console.log(
        "Die ausgewählte Datei konnte nicht gelesen werden oder ist leer. Ein neuer Inhalt wird erstellt."
      );
    }
    let updatedData = [];
    if (existingData) {
      for (let entry of existingData) {
        updatedData.push(entry);
      }
    }
    updatedData.push(qrContent.value);
    console.log(updatedData);
    await writeFile(handle, JSON.stringify(updatedData, null, 2));
    console.log("Datei erfolgreich aktualisiert.");
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Datei:", error);
  }
}
</script>

<style scoped>
.camera-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #d1d1d1;
  border-radius: 2px;
}
</style>
