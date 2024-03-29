<template>
  <q-page class="q-pa-md row justify-center items-center" style="height: 100vh">
    <div>
      <qrcode-vue :value="value" :size="size" level="H" render-as="canvas" />
    </div>
    <q-btn
      unelevated
      rounded
      v-if="canShareFile"
      icon="share"
      color="purple"
      label="QR-Code teilen"
      @click="shareQrCode"
      style="width: 100%"
    />
  </q-page>
</template>

<script setup>
import QrcodeVue from "qrcode.vue";
import { onMounted, ref } from "vue";
const value = ref(null);
const size = ref(300);
const canShareFile = ref(false);

setUsersInfoToQrCode("test");
onMounted(() => {
  canShareFile.value =
    navigator.canShare && navigator.canShare({ files: [new File([], "")] });
});

function canvasToJpegBlob(canvas, quality, callback) {
  canvas.toBlob(callback, "image/jpeg", quality);
}

async function shareQrCode() {
  canvasToJpegBlob(document.querySelector("canvas"), 0.75, async (blob) => {
    const file = new File([blob], "qrcode.jpg", { type: "image/jpeg" });
    try {
      await navigator.share({
        files: [file],
        title: "QR-Code",
        text: "Dein QR-Code zur Registrierung",
      });
      console.log("QR code shared successfully.");
    } catch (err) {
      console.error("Error sharing the file:", err);
      alert("Failed to share the file.");
    }
  });
}

function setUsersInfoToQrCode(usersInfoForQrCode) {
  value.value = usersInfoForQrCode;
}
</script>
