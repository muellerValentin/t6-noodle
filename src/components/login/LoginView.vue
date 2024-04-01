<template>
  <!-- Design template by Joabson Arley
     https://github.com/Joabsonlg/quasar-template-->

  <q-card class="q-ma-xl">
    <div class="row">
      <div class="col-0 col-sm-5 bg-primary rounded-left-borders xs-hide">
        <div
          class="row full-width q-px-xl q-pb-xl full-height flex flex-center"
        >
          <div class="">
            <div
              class="text-h4 text-uppercase text-white fredoka"
              style="min-width: 220px"
            >
              WILLKOMMEN!
            </div>
            <div class="text-white q-my-sm text-subtitle1">
              Bitte melden Sie sich mit Ihrem Account an, um loszulegen.
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-7">
        <div class="row q-ml-sm q-mt-sm sm-and-up-hide">
          <div class="col-12 fredoka text-subtitle1">
            <router-link
              class="text-primary"
              style="text-decoration: none"
              to="/"
            >
              NOODLE
            </router-link>
          </div>
        </div>
        <div class="row q-pa-sm-sm q-pa-md">
          <div class="col-12">
            <q-card-section>
              <div class="q-mb-xl">
                <div class="flex justify-center">
                  <div
                    class="text-h4 text-uppercase q-my-none text-weight-bold text-primary fredoka"
                  >
                    Login
                  </div>
                </div>
              </div>

              <q-form ref="form" class="q-gutter-md" @submit="login">
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

                <div>
                  <q-btn
                    class="full-width fredoka"
                    color="primary"
                    label="Login"
                    type="submit"
                  ></q-btn>

                  <div class="q-mt-lg">
                    <div class="q-mt-sm">
                      Sie haben keinen Account?
                      <router-link class="text-primary" to="/register2"
                        >Registrieren</router-link
                      >
                    </div>
                  </div>
                </div>
              </q-form>
            </q-card-section>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { userLogin } from "src/helpers/firebase/firebase.js";
import hashString from "src/helpers/hashing/hashing.js";
import { ref } from "vue";
const forename = ref();
const lastname = ref();
const password = ref();
const isPwd = ref(true);

async function login() {
  const id = hashString(forename.value + lastname.value + password.value);
  if (await userLogin(id, hashString(password.value))) {
    //@todo: getting role
  } else {
  }
}
</script>