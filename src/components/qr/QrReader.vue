<template>
  <div class="video-container">
    <div v-if="!videoPlaying.value" class="camera-icon-container">
      <q-icon name="photo_camera" size="30vw" />
    </div>

    <video ref="videoStream" autoplay></video>
  </div>

  <div class="flex flex-center q-mt-md">
    <q-btn color="blue" label="QR-Code scannen" @click="toggleVideo" />
  </div>

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
        <q-btn flat label="Abbrechen" color="primary" v-close-popup />
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
</template>

<script setup>
import readQrCode from "src/helpers/qr/qr";
import { confirmRegistration } from "src/helpers/firebase/firebase.js";
import { onMounted, ref } from "vue";
import { get, set } from "https://unpkg.com/idb-keyval@5.0.2/dist/esm/index.js";

const videoStream = ref(null);
const videoPlaying = ref(false);
const dialogOpen = ref(false);
const qrContent = ref(null);
let intervalId = null;

async function detectCode() {
  const test = await readQrCode(videoStream.value, true);
  console.log(test);
  if (test) {
    qrContent.value = test;
    console.log("qrContent:" + qrContent.value);
    dialogOpen.value = true;
    clearInterval(intervalId);
  }
}

async function toggleVideo() {
  if (videoPlaying.value) {
    videoStream.value.pause();
    clearInterval(intervalId);
  } else {
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
  videoPlaying.value = !videoPlaying.value;
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
.video-container {
  width: 100%;
  max-width: 1000px;
  height: calc(100vw - 20px); /* 20px to account for potential scrollbars */
  max-height: 1000px;
  position: relative;
  margin: auto;
  border: 2px solid var(--q-primary);
  border-radius: 5px;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

.camera-icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #d1d1d1;
  border-radius: 5px;
}
</style>
