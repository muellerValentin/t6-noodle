<template>
  <div class="q-pa-md">
    <div class="q-pa-md row justify-center">
      <q-avatar>
        <img src="https://cdn.quasar.dev/img/avatar.png" />
      </q-avatar>
      <q-card
        class="q-gutter-md col-xs-12 col-sm-10 col-md-8 col-lg-6 col-xl-4"
      >
        <q-card-section>
          <q-form @submit="onSubmit" @reset="onReset">
            <q-input
              filled
              v-model="forename"
              label="Vorname"
              lazy-rules
              :rules="nameRules"
            />
            <q-input
              filled
              v-model="lastname"
              label="Nachname"
              lazy-rules
              :rules="nameRules"
            />
            <q-option-group
              v-model="role"
              :options="options"
              inline
              color="primary"
            />

            <q-input
              v-if="role === 1"
              filled
              type="number"
              v-model="year"
              label="ON-Jahrgang"
              lazy-rules
              :rules="yearRules"
            />

            <div v-if="role === 2" class="q-gutter-sm q-mt-md">
              <q-checkbox v-model="year1" label="ON21" />
              <q-checkbox v-model="year2" label="ON22" />
              <q-checkbox v-model="year3" label="ON23" />
            </div>

            <q-input
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

            <br />

            <q-btn-group spread>
              <q-btn
                type="submit"
                color="primary"
                label="Fortfahren"
                icon="timeline"
              />
              <q-btn
                type="reset"
                color="purple"
                label="Zurücksetzen"
                icon="visibility"
              />
            </q-btn-group>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const forename = ref();
const lastname = ref();
const role = ref(null);
const year = ref(null);
const password = ref();
const isPwd = ref(true);
const year1 = ref(false);
const year2 = ref(false);
const year3 = ref(false);

const nameRules = [(val) => (val && val.length > 0) || "Bitte trage etwas ein"];
const yearRules = [
  (val) => (val !== null && val !== "") || "Bitte trage deinen Jahrgang ein",
  (val) =>
    (val >= new Date().getFullYear() - 2000 - 3 &&
      val <= new Date().getFullYear() - 2000 - 1) ||
    "Nur die Jahrgänge ON" +
      (new Date().getFullYear() - 2000 - 3) +
      " bis ON" +
      (new Date().getFullYear() - 2000 - 1) +
      " sind erlaubt",
];

watch(role, (newValue, oldValue) => {
  console.log(newValue);
});

function onReset() {
  forename.value = null;
  lastname.value = null;
  role.value = null;
  year.value = null;
  password.value = null;
  year1.value = null;
  year2.value = null;
  year3.value = null;
}

function onSubmit() {}
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
</script>
