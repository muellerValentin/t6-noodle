<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" vertical color="primary" animated>
      <q-step
        :name="1"
        title="Basisinformationen"
        icon="settings"
        :done="step > 1"
      >
        Zunächst müssen Sie Ihre Basisinformationen angeben.
        <div class="q-mt-sm">
          <q-input
            filled
            v-model="forename"
            label="Vorname"
            lazy-rules
            :rules="nameRules"
          />
          <q-input
            class="q-mt-sm"
            filled
            v-model="lastname"
            label="Nachname"
            lazy-rules
            :rules="nameRules"
          />
          <q-input
            class="q-mt-sm"
            label="Passwort"
            v-model="password"
            filled
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>

        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="Weiter" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Rollenwahl" icon="groups" :done="step > 2">
        Wählen Sie Ihre Rolle aus.

        <q-option-group v-model="role" :options="options" color="primary" />

        <q-stepper-navigation>
          <q-btn
            v-if="role === 1"
            @click="step = 3"
            color="primary"
            label="Weiter"
          />
          <q-btn v-else @click="step = 4" color="primary" label="Weiter" />

          <q-btn
            flat
            @click="step = 1"
            color="primary"
            label="Zurück"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- v-if="role === 1 && nfcSupported" -->
      <q-step
        v-if="role === 1"
        :name="3"
        title="Studierendenausweis einscannen"
        icon="nfc"
        :done="step > 3"
      >
        <p>Scannen Sie ihren Studierendenausweis per NFC ein:</p>

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

        <q-stepper-navigation>
          <q-btn @click="step = 4" color="primary" label="Weiter" />
          <q-btn
            flat
            @click="step = 2"
            color="primary"
            label="Zurück"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="4"
        title="Spezifische Informationen"
        icon="assignment"
        :done="step > 4"
      >
        Bitte geben Sie hier die geforderten spezifischen Informationen an und
        übermitteln Sie Ihre Daten im Anschluss.
        <div v-if="role === 1">
          <q-select
            class="q-mt-sm"
            filled
            v-model="year"
            :options="years"
            label="Jahrgang"
          />
        </div>
        <div v-if="role === 2" class="q-gutter-sm q-mt-md">
          <q-checkbox
            v-for="(checkbox, index) in checkboxes"
            :key="index"
            v-model="checkbox.model"
            :label="checkbox.label"
          />
        </div>
        <div v-if="role === 3" class="q-gutter-sm q-mt-md">
          <q-input
            class="q-mt-sm"
            label="Master-Passwort"
            v-model="masterPassword"
            filled
            :type="isPwd ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>

        <q-stepper-navigation>
          <q-btn
            @click="getDataFromClient"
            color="primary"
            label="Übermitteln"
          />
          <q-btn
            flat
            @click="step = 2"
            color="primary"
            label="Zurück"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        v-if="role !== 3"
        :name="5"
        title="QR-Code"
        icon="qr_code"
        :done="step > 5"
      >
        Diesen QR-Code müssen Sie zum Abschluss der Registrierung im Sekretariat
        vorzeigen.

        <div v-if="dataPassedToFirebase">
          <QrGenerator :qr-code-content="dataForQrCode" />
        </div>

        <q-stepper-navigation>
          <q-btn color="primary" label="Finish" />
          <q-btn
            flat
            @click="step = 4"
            color="primary"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
      <q-step
        :name="6"
        title="Registrierung abgeschlossen"
        icon="sentiment_very_satisfied"
      >
        Sie wurden erfolgreich authenifiziert.
        <q-stepper-navigation>
          <q-btn color="green" label="Finish" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>
<script setup>
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { ref, onMounted } from "vue";
import { addUser, firebaseInit } from "src/helpers/firebase/firebase.js";
import hashString from "src/helpers/hashing/hashing.js";
import QrGenerator from "../qr/QrGenerator.vue";
import { getYears } from "src/helpers/util.js";
const dataPassedToFirebase = ref(localStorage.getItem("dataPassedToFirebase"));
const step = ref(+localStorage.getItem("step") || 1);
const forename = ref(localStorage.getItem("forname"));
const lastname = ref(localStorage.getItem("lastname"));
const password = ref(localStorage.getItem("password"));
const masterPassword = ref();
const isPwd = ref(true);
const role = ref(+localStorage.getItem("role"));
const year = ref(localStorage.getItem("year"));
const dataForQrCode = ref(localStorage.getItem("dataForQrCode"));
const years = getYears().map((year) => `ON${year}`);
const checkboxes = ref(
  getYears().map((year) => ({ label: `ON${year}`, model: ref(false) }))
);

let id = hashString(
  localStorage.getItem("forname") +
    localStorage.getItem("lastname") +
    localStorage.getItem("password")
);

let unsub;
onMounted(() => {
  if (id) {
    unsub = onSnapshot(
      doc(getFirestore(firebaseInit()), "users", id),
      (doc) => {
        console.log(doc.data().verified);
        if (doc.data().verified) {
          step.value = 6;
          localStorage.setItem("step", step.value);
        }
      }
    );
  }
});

const options = [
  {
    label: "Studierender",
    value: 1,
  },
  {
    label: "Dozierender",
    value: 2,
  },
  {
    label: "Sekretariat",
    value: 3,
  },
];

// NFC
const nfcSupported = ref(false);
const dialogOpen = ref(false);
const dialogMessage = ref("");
const scanDialogOpen = ref(false);
const scanContent = ref("");

const serialNumber = ref(localStorage.getItem("serialNumber"));

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
      reader.onreading = ({ serialNumber: readSerialNumber }) => {
        scanContent.value = `Seriennummer: ${readSerialNumber}`;
        serialNumber.value = `${readSerialNumber}`;
        scanDialogOpen.value = true;
      };
    } catch (error) {
      console.log("Error: " + error);
    }
  }
}

// Jahrgangsauswahl / Spezifische Informationen
console.log(getYears());

/**
 * Function for getting possible course-years, e.g. ON21, ON22, ON23
 * @author daniel
 */

function getDataFromClient() {
  if (role.value === 3) {
    //Sekretariat
  } else {
  }
  localStorage.setItem("forname", forename.value);
  localStorage.setItem("lastname", lastname.value);
  localStorage.setItem("password", password.value);
  localStorage.setItem("role", role.value);
  localStorage.setItem("serialNumber", serialNumber.value);
  localStorage.setItem("year", year.value);
  id = hashString(forename.value + lastname.value + password.value);
  addUser(id, hashString(password.value), role.value.toString());
  dataPassedToFirebase.value = true;
  dataForQrCode.value = `{
  "forename": "${forename.value}",
  "lastname": "${lastname.value}",
  "role": ${role.value},
  "course": "${year.value}",
  "serialNumber": "${serialNumber.value}",
  "id": "${id}"
}`;
  unsub = onSnapshot(doc(getFirestore(firebaseInit()), "users", id), (doc) => {
    console.log(doc.data().verified);
    if (doc.data().verified) {
      step.value = 6;
      localStorage.setItem("step", step.value);
    }
  });
  localStorage.setItem("dataPassedToFirebase", dataPassedToFirebase.value);
  localStorage.setItem("dataForQrCode", dataForQrCode.value);
  step.value = 5;
  localStorage.setItem("step", step.value);
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
