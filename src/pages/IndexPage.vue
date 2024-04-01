<template>
  <q-page class="flex flex-center">
    <div class="flex flex-center flex-direction-column">
      <img
        alt="Quasar logo"
        src="~assets/quasar-logo-vertical.svg"
        style="width: 200px; height: 200px"
      />

      <q-btn
        label="NFC-Scan"
        :class="{ supported: nfcSupported, 'not-supported': !nfcSupported }"
        @click="openDialog"
      />

      <q-dialog v-model="dialogOpen">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="nfc" color="primary" text-color="white" />
            <span class="q-ml-sm">{{ dialogMessage }}</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="primary" v-close-popup />
            <q-btn
              flat
              label="Turn on NFC"
              color="primary"
              v-if="nfcSupported"
              v-close-popup
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="scanDialogOpen">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="nfc" color="primary" text-color="white" />
            <span class="q-ml-sm">{{ scanContent }}</span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Close" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";

defineOptions({
  name: "IndexPage",
});

const nfcSupported = ref(false);
const dialogOpen = ref(false);
const dialogMessage = ref("");
const scanDialogOpen = ref(false);
const scanContent = ref("");

let reader;

onMounted(() => {
  if ("NDEFReader" in window) {
    nfcSupported.value = true;
    reader = new NDEFReader();
  }
});

async function openDialog() {
  dialogMessage.value = nfcSupported.value
    ? "Start NFC-Scan"
    : "Your device does not support a NFC-Scan!";
  dialogOpen.value = true;

  if (nfcSupported.value) {
    try {
      await reader.scan();
      reader.onreading = ({ serialNumber }) => {
        scanCoscanContent.value = `Seriennummer: ${serialNumber}`;
        scanDialogOpen.value = true;
      };
    } catch (error) {
      console.log("Error: " + error);
    }
  }
}
</script>

<style scoped>
.supported {
  background-color: green;
}

.not-supported {
  background-color: red;
}
</style>
