<!-- 
description: Registration view for the user with role-based content
author: @daniel.vollmer, @valentin.müller, @marius.möldner , @lorenz.lederer (design)
 -->
<template>
  <div class="q-ma-lg q-mt-xl">
    <q-stepper v-model="step" vertical color="primary" animated>
      <q-btn
        to="/login"
        flat
        bg-color="standard"
        color="primary"
        size="sm"
        icon="arrow_back"
        label="zurück"
      />

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

      <!-- only devices which support nfc show this step (for project evaluation every device show this step) -->
      <!-- v-if="role === 1 && nfcSupported" -->
      <q-step
        v-if="role === 1"
        :name="3"
        title="Studierendenausweis einscannen"
        icon="nfc"
        :done="step > 3"
      >
        <p>
          Scannen Sie ihren Studierendenausweis per NFC ein: (auf das Textfeld
          klicken und Tag an das Endgerät halten)
        </p>

        <q-input
          @click="scanNFC"
          color="primary"
          filled
          v-model="serialNo"
          label="Seriennummer"
        >
          <template v-slot:append>
            <q-icon name="sensors" />
          </template>
        </q-input>
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
      </q-step>
      <q-step
        :name="6"
        title="Registrierung abgeschlossen"
        icon="sentiment_very_satisfied"
      >
        Sie wurden erfolgreich authenifiziert.
        <q-stepper-navigation>
          <q-btn to="/login" color="green" label="Fertig" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>
<script setup>
/**
 * IMPORTS
 */
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { ref, onMounted } from "vue";
import {
  addUser,
  firebaseInit,
  checkMasterPassword,
} from "src/helpers/firebase/firebase.js";
import hashString from "src/helpers/hashing/hashing.js";
import QrGenerator from "../qr/QrGenerator.vue";
import { getYears } from "src/helpers/util.js";

/**
 * VARIABLES
 */
const dataPassedToFirebase = ref(localStorage.getItem("dataPassedToFirebase"));
const step = ref(+localStorage.getItem("step") || 1);
const forename = ref(localStorage.getItem("forname"));
const lastname = ref(localStorage.getItem("lastname"));
const password = ref(localStorage.getItem("password"));
const masterPassword = ref();
const isPwd = ref(true);
const role = ref(+localStorage.getItem("role"));
const year = ref(localStorage.getItem("year"));
const serialNo = ref();
const dataForQrCode = ref(localStorage.getItem("dataForQrCode"));
const nameRules = ref([(v) => !!v || "Name is required"]);
const years = getYears().map((year) => `ON${year}`);
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
const checkboxes = ref(
  getYears().map((year) => ({ label: `ON${year}`, model: ref(false) }))
);
let id = hashString(
  localStorage.getItem("forname") +
    localStorage.getItem("lastname") +
    localStorage.getItem("password")
);
let unsub;
// NFC
const nfcSupported = ref(false);
const dialogOpen = ref(false);
const dialogMessage = ref("");
const scanDialogOpen = ref(false);
const scanContent = ref("");
const serialNumber = ref(localStorage.getItem("serialNumber"));
let reader;

/**
 * HOOKS
 */
onMounted(() => {
  if (id) {
    // check if user is already verified
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
  if ("NDEFReader" in window) {
    nfcSupported.value = true;
    reader = new NDEFReader();
  }
});

/**
 * FUNCTIONS
 */

/**
 * Function for scanning the NFC-Tag
 * @author valentin.müller
 */
async function scanNFC() {
  try {
    await reader.scan();
    reader.onreading = ({ serialNumber: readSerialNumber }) => {
      scanContent.value = `Seriennummer: ${readSerialNumber}`;
      serialNumber.value = `${readSerialNumber}`;
      serialNo.value = readSerialNumber;
    };
  } catch (error) {
    console.log("Error: " + error);
  }
}

/**
 * Function for getting the data from the client and sending it to the firebase
 * @author daniel.vollmer, marius.möldner
 */
async function getDataFromClient() {
  id = hashString(forename.value + lastname.value + password.value);
  // Check if the user is a secretary
  if (role.value === 3) {
    console.log(await checkMasterPassword(masterPassword.value));
    if (await checkMasterPassword(masterPassword.value)) {
      addUser(id, hashString(password.value), role.value.toString(), true);
      step.value = 6;
    }
    // Check if the user is a student or a lecturer
  } else {
    // Save the data in the local storage
    localStorage.setItem("forname", forename.value);
    localStorage.setItem("lastname", lastname.value);
    localStorage.setItem("password", password.value);
    localStorage.setItem("role", role.value);
    localStorage.setItem("serialNumber", serialNumber.value);
    localStorage.setItem("year", year.value);
    addUser(id, hashString(password.value), role.value.toString());
    dataPassedToFirebase.value = true;
    // Data for the qr code
    dataForQrCode.value = `{
  "forename": "${forename.value}",
  "lastname": "${lastname.value}",
  "role": ${role.value},
  "course": "${year.value}",
  "serialNumber": "${serialNumber.value}",
  "id": "${id}"
}`;
    // Check if the user is already verified (realtime-update)
    unsub = onSnapshot(
      doc(getFirestore(firebaseInit()), "users", id),
      (doc) => {
        if (doc.data().verified) {
          step.value = 6;
          localStorage.setItem("step", step.value);
        }
      }
    );
    localStorage.setItem("dataPassedToFirebase", dataPassedToFirebase.value);
    localStorage.setItem("dataForQrCode", dataForQrCode.value);
    step.value = 5;
    localStorage.setItem("step", step.value);
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
