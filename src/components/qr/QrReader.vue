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
          @click="confirmRegistration"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import readQrCode from "src/helpers/qr/qr";
import { onMounted, ref } from "vue";

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
    //console.log("qrContent:" + qrContent.value);
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

function confirmRegistration() {
  console.log("Registrierung bestätigt");
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
