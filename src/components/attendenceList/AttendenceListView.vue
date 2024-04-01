<template>
  <div class="q-pa-md">
    <q-stepper v-model="step" vertical color="primary" animated>
      <q-step :name="1" title="Datum angeben" icon="settings" :done="step > 1">
        Wählen Sie das Datum, an dem Sie die Anwesenheiten kontrollieren
        möchten.
        <div class="q-mt-sm row items-start">
          <q-date v-model="date" minimal />
        </div>
        <q-stepper-navigation>
          <q-btn @click="step = 2" color="primary" label="Weiter" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Kurs wählen" icon="groups" :done="step > 2">
        Wählen Sie den Kurs aus.

        <q-select
          class="q-mt-sm"
          filled
          v-model="year"
          :options="years"
          label="Jahrgang"
        />

        <q-stepper-navigation>
          <q-btn
            @click="getAttendenceListFromFirestore"
            color="primary"
            label="Weiter"
          />
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
        title="Anwesenheit kontrollieren"
        icon="check_box"
        :done="step > 3"
      >
        Bitte überprüfen Sie die Anwesenheiten und bestätigen Sie mit einem
        Klick auf Abschluss.
        <div class="q-mt-sm">
          <q-table
            :rows="rows"
            :columns="columns"
            title="Anwesend"
            row-key="name"
          />
        </div>
        <div class="q-mt-sm">
          <q-table
            :rows="notPresentRows"
            :columns="notPresentColumns"
            title="Nicht Anwesend"
            row-key="name"
          />
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
    </q-stepper>
  </div>
</template>

<script setup>
import { ref } from "vue";
import hashString from "src/helpers/hashing/hashing.js";
import { getCheckIns } from "src/helpers/firebase/firebase.js";
import { getYears } from "src/helpers/util.js";
const years = getYears().map((year) => `ON${year}`);
const year = ref();
const step = ref(1);
const date = ref();
const notPresentRows = ref();
const notPresentColumns = [
  {
    name: "forename",
    required: true,
    label: "Vorname",
    align: "left",
    field: "forename",
    sortable: true,
  },
  {
    name: "lastname",
    align: "left",
    label: "Nachname",
    field: "lastname",
    sortable: true,
  },
];
const columns = [
  {
    name: "forename",
    required: true,
    label: "Vorname",
    align: "left",
    field: "forename",
    sortable: true,
  },
  {
    name: "lastname",
    align: "left",
    label: "Nachname",
    field: "lastname",
    sortable: true,
  },
  { name: "checkIn", label: "Check-In", field: "checkIn", sortable: true },
];
const rows = ref();

async function getAttendenceListFromFirestore() {
  const dateForQuery = date.value.replaceAll("/", "-");
  rows.value = await getCheckIns(
    new Date(dateForQuery + "T00:00:00.000Z"),
    new Date(dateForQuery + "T23:59:59.999Z"),
    hashString(year.value)
  ).then((result) => {
    return result.presentStudents;
  });
  notPresentRows.value = await getCheckIns(
    new Date(dateForQuery + "T00:00:00.000Z"),
    new Date(dateForQuery + "T23:59:59.999Z"),
    hashString(year.value)
  ).then((result) => {
    return result.notPresentStudents;
  });
  step.value = 3;
}
</script>
