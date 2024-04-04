<!-- 
description: QR code generator for doing the registration via QR code
author: @daniel.vollmer, @valentin.müller, @luca.breisch (design)
 -->
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
/**
 * IMPORTS
 */
import QrcodeVue from "qrcode.vue";
import { onMounted, ref } from "vue";
const props = defineProps({
  qrCodeContent: String,
});

/**
 * VARIABLES
 */
const value = ref(props.qrCodeContent);
const size = ref(200);
const canShareFile = ref(false);

/**
 * HOOKS
 */
onMounted(() => {
  canShareFile.value =
    navigator.canShare && navigator.canShare({ files: [new File([], "")] });
});

/**
 * FUNCTIONS
 */

/**
 * Converts the html-canvas to a jpeg blob, because the share api needs a file
 * @param {*} canvas
 * @param {*} quality
 * @param {*} callback
 * @author luca.breisch
 */
function canvasToJpegBlob(canvas, quality, callback) {
  canvas.toBlob(callback, "image/jpeg", quality);
}

/**
 * Shares the QR code as a jpeg file
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
 * @returns {Promise<void>}
 * @author daniel.vollmer
 */
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
    }
  });
}
</script>
