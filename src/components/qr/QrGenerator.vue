<template>
  <q-page class="q-pa-md row justify-center items-center" style="height: 100vh">
    <div>
      <qrcode-vue
        ref="test"
        :value="value"
        :size="size"
        level="H"
        render-as="canvas"
      />
      <br />
      <button @click="downloadQrCodeAsJpeg">Test</button>
    </div>
  </q-page>
</template>

<script setup>
import QrcodeVue from "qrcode.vue";
import { onMounted, ref } from "vue";
const value = ref("test");
const size = ref(300);
setUsersInfoToQrCode("test");
const test = ref();
let blob;
onMounted(() => {});

function canvasToJpegBlob(canvas, quality, callback) {
  canvas.toBlob(callback, "image/jpeg", quality);
}

async function downloadQrCodeAsJpeg() {
  canvasToJpegBlob(document.querySelector("canvas"), 0.75, async (blob) => {
    try {
      const fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: "JPEG Image",
            accept: { "image/jpeg": [".jpg"] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      alert("QR code saved successfully as JPEG.");
    } catch (err) {
      console.error("Error saving the file:", err);
      alert("Failed to save the file.");
    }
  });
}

function setUsersInfoToQrCode(usersInfoForQrCode) {
  value.value = usersInfoForQrCode;
}
</script>
