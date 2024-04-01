<template>
  <video ref="videoStream" width="100%" height="40%" autoplay></video>
</template>

<script setup>
import readQrCode from "src/helpers/qr/qr";
import { onMounted, ref } from "vue";
const videoStream = ref(null);
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
});

async function detectCode() {
  const test = await readQrCode(videoStream.value, true);
  console.log(test);
}
setInterval(detectCode, 1000);
</script>
