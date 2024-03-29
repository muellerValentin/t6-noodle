<template>
  <div class="q-pa-md row justify-center items-center">
    <div>
      <qrcode-vue :value="value" :size="size" level="H" render-as="canvas" />
    </div>
    <q-btn
      class="q-mt-sm"
      v-if="canShareFile"
      icon="share"
      color="primary"
      label="QR-Code teilen"
      @click="shareQrCode"
      style="width: 100%"
    />
  </div>
</template>

<script setup>
import QrcodeVue from "qrcode.vue";
import { onMounted, ref } from "vue";
const props = defineProps({
  qrCodeContent: String,
});
const value = ref(props.qrCodeContent);
const size = ref(200);
const canShareFile = ref(false);

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
</script>
