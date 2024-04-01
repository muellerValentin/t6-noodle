<template>
  <div class="video-container">
    <video ref="videoStream" autoplay></video>
  </div>

  <div class="flex flex-center q-mt-md">
    <q-btn color="blue" label="QR-Code scannen" @click="toggleVideo" />
  </div>
</template>

<script setup>
import readQrCode from "src/helpers/qr/qr";
import { onMounted, ref } from "vue";

const videoStream = ref(null);
const videoPlaying = ref(false);
let intervalId = null;

onMounted(() => {
  console.log(videoStream.value.name);
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const constraints = {
      video: true,
      audio: false,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => (videoStream.value.srcObject = stream));
  }

  intervalId = setInterval(detectCode, 1000);
});

async function detectCode() {
  const test = await readQrCode(videoStream.value, true);
  console.log(test);
}

function toggleVideo() {
  if (videoPlaying.value) {
    videoStream.value.pause();
    clearInterval(intervalId);
  } else {
    videoStream.value.play();
    intervalId = setInterval(detectCode, 1000);
  }
  videoPlaying.value = !videoPlaying.value;
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
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
