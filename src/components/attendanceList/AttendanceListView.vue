<!-- 
description: Shows the attendance list and allows the user to delete the attendance data
author: @daniel.vollmer, @marius.möldner (design)
 -->
<template>
  <div class="q-ma-lg q-mt-xl">
    <q-stepper v-model="step" vertical color="primary" animated>
      <q-btn
        to="/overview"
        flat
        bg-color="standard"
        color="primary"
        size="sm"
        icon="arrow_back"
        label="zurück"
      />
      <q-step :name="1" title="Datum angeben" icon="settings" :done="step > 1">
        Wählen Sie das Datum, an dem Sie die Anwesenheiten kontrollieren
        möchten.
        <div class="q-mt-sm row items-start">
          <q-date
            flat
            class="q-pr-md"
            dense
            v-model="date"
            minimal
            :options="options"
          />
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
          <q-badge color="blue">
            {{ numberOfNotPresent }} /
            {{ numberOfNotPresent + numberOfPresent }}
          </q-badge>
          <q-table
            class="q-mt-sm"
            :rows="notPresentRows"
            :columns="notPresentColumns"
            title="Nicht anwesend"
            row-key="name"
            card-class="bg-red-2"
            dense
          />
        </div>
        <div class="q-mt-sm">
          <q-table
            :rows="rows"
            :columns="columns"
            title="Anwesend"
            row-key="name"
            card-class="bg-green-2"
            dense
          />
        </div>

        <q-dialog v-model="confirm" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar icon="delete" color="primary" text-color="white" />
              <span class="q-ml-sm"
                >Die Anwesenheitsdaten werden unwiderruflich gelöscht? Möchten
                Sie fortfahren?
              </span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Zurück" color="primary" v-close-popup />
              <q-btn
                @click="deleteTimestamps"
                label="Fortfahren"
                color="primary"
                to="/overview"
                v-close-popup
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-stepper-navigation>
          <q-btn @click="confirm = true" color="primary" label="Fertig" />
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
/**
 * IMPORTS
 */
import { onMounted, ref } from "vue";
import { exportFile, useQuasar } from "quasar";
import {
  getCheckIns,
  deleteDocs,
  getDatesWithAttendenceData,
} from "src/helpers/firebase/firebase.js";
import { getYears } from "src/helpers/util.js";

/**
 * VARIABLES
 */
const years = getYears().map((year) => `ON${year}`);
const confirm = ref(false);
const year = ref();
const step = ref(1);
const date = ref();
const numberOfPresent = ref(0);
const numberOfNotPresent = ref(0);
const notPresentRows = ref();
const options = ref();
const $q = useQuasar();
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
  {
    name: "checkIn",
    label: "Check-In",
    field: "checkIn",
    sortable: true,
    align: "left",
  },
];
const rows = ref();
let docsToDelete = [];

/**
 * HOOKS
 */
onMounted(() => {
  init();
});

/**
 * FUNCTIONS
 */

/**
 * Function for initializing the calendar component
 * @author marius.möldner
 */
async function init() {
  options.value = await getDatesWithAttendenceData();
}

/**
 * Function for getting the attendance list from firestore.
 * The function gets the attendance timestamps for the selected date, year and course.
 * @returns {Promise<void>}
 * @author daniel.vollmer
 */
async function getAttendenceListFromFirestore() {
  const dateForQuery = date.value.replaceAll("/", "-");
  await getCheckIns(
    new Date(dateForQuery + "T00:00:00.000Z"),
    new Date(dateForQuery + "T23:59:59.999Z"),
    year.value
  ).then((result) => {
    numberOfPresent.value = result.presentStudents.length;
    numberOfNotPresent.value = result.notPresentStudents.length;
    rows.value = result.presentStudents;
    notPresentRows.value = result.notPresentStudents;
    docsToDelete = result.docIds;
  });
  step.value = 3;
}

/**
 * Function for deleting the attendance timestamps from firestore.
 * @author marius.möldner
 */
async function deleteTimestamps() {
  await deleteDocs(docsToDelete);
}

/**
 * Function for wrapping a value in a csv format.
 * @param val
 * @param formatFn
 * @param row
 * @returns {string}
 * @author marius.möldner
 */
function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val;
  formatted =
    formatted === void 0 || formatted === null ? "" : String(formatted);
  formatted = formatted.split('"').join('""');
  return `"${formatted}"`;
}

/**
 * Function for exporting the table to a csv file.
 * The function exports the table to a csv file with the name table-export.csv.
 * @returns {Promise<void>}
 * @author marius.möldner
 */
function exportTable() {
  console.log(notPresentColumns);
  const content = [
    notPresentColumns.value.map((col) => wrapCsvValue(col.label)),
  ]
    .concat(
      notPresentRows.value.map((row) =>
        notPresentColumns.value
          .map((col) =>
            wrapCsvValue(
              typeof col.field === "function"
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field],
              col.format,
              row
            )
          )
          .join(",")
      )
    )
    .join("\r\n");

  const status = exportFile("table-export.csv", content, "text/csv");
  if (status !== true) {
    $q.notify({
      message: "Browser denied file download...",
      color: "negative",
      icon: "warning",
    });
  }
}
</script>
