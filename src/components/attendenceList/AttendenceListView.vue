<template>
  <div class="q-pa-md">
    <q-table
      title="Anwesenheitsliste"
      :rows="rows"
      :columns="columns"
      row-key="name"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import { getCheckIns } from "src/helpers/firebase/firebase.js";

const columns = [
  {
    name: "forname",
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
  { name: "course", label: "Kurs", field: "course", sortable: true },
  { name: "checkIn", label: "Check-In", field: "checkIn", sortable: true },
];
const rows = ref();
test();

async function test() {
  rows.value = await getCheckIns(
    new Date("2024-04-02T00:00:00.000Z"),
    new Date("2024-04-02T23:59:59.999Z")
  );
}

export default {
  setup() {
    return {
      columns,
      rows,
    };
  },
};
</script>
