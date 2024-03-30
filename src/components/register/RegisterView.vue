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
          <q-btn @click="step = 3" color="primary" label="Weiter" />
          <q-btn
            flat
            @click="step = 1"
            color="primary"
            label="Zurück"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        title="Spezifische Informationen"
        icon="assignment"
        :done="step > 3"
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

      <q-step v-if="role !== 3" :name="4" title="QR-Code" icon="qr_code">
        Diesen QR-Code müssen Sie zum Abschluss der Registrierung im Sekretariat
        vorzeigen.

        <div v-if="dataPassedToFirebase">
          <QrGenerator :qr-code-content="dataForQrCode" />
        </div>

        <q-stepper-navigation>
          <q-btn color="primary" label="Finish" />
          <q-btn
            flat
            @click="step = 3"
            color="primary"
            label="Back"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { addUser } from "src/helpers/firebase/firebase.js";
import hashString from "src/helpers/hashing/hashing.js";
import QrGenerator from "../qr/QrGenerator.vue";
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
console.log(getYears());

/**
 * Function for getting possible course-years, e.g. ON21, ON22, ON23
 * @author daniel
 */
function getYears() {
  let possibleYears = new Array();
  const currentYear = new Date().getFullYear() - 2000;
  for (let i = currentYear - 3; i < currentYear; i++) {
    possibleYears.push(i);
  }
  return possibleYears;
}

function getDataFromClient() {
  if (role.value === 3) {
    //Sekretariat
  } else {
  }
  localStorage.setItem("forname", forename.value);
  localStorage.setItem("lastname", lastname.value);
  localStorage.setItem("password", password.value);
  localStorage.setItem("role", role.value);
  localStorage.setItem("year", year.value);
  const id = hashString(forename.value + lastname.value + password.value);
  addUser(id, hashString(password.value), hashString(role.value.toString()));
  dataPassedToFirebase.value = true;
  dataForQrCode.value = forename.value + lastname.value + role.value + id;
  localStorage.setItem("dataPassedToFirebase", dataPassedToFirebase.value);
  localStorage.setItem("dataForQrCode", dataForQrCode.value);
  step.value = 4;
  localStorage.setItem("step", step.value);
}
</script>
