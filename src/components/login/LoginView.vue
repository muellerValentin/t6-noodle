<template>
  <q-card class="q-ma-lg q-mt-xl">
    <q-dialog v-if="isInstallable" v-model="seamless" seamless position="top">
      <q-card style="width: 350px">
        <q-linear-progress :value="1" color="primary" />

        <q-card-section class="row items-center no-wrap">
          <q-icon size="36px" name="download"></q-icon>
          <div>
            <div class="text-weight-bold">Noodle</div>
            <div class="text-grey">App installieren</div>
          </div>

          <q-space />

          <q-btn color="primary" @click="installPWA">Install</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
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
            <p class="text-primary">💙-lich Willkommen</p>
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
                    NOODLE
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
                      <router-link class="text-primary" to="/register"
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

  <q-dialog v-model="falseCredentials">
    <q-card>
      <q-card-section class="row items-center">
        <q-icon class="q-mr-sm" name="warning" />
        <div class="text-h6">Falsche Anmeldedaten</div>
      </q-card-section>
      <q-card-section>
        Die eingegebenen Anmeldedaten sind nicht korrekt. Bitte versuchen Sie es
        erneut.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Schließen" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import { userLogin } from "src/helpers/firebase/firebase.js";
import hashString from "src/helpers/hashing/hashing.js";

const seamless = ref(true);
const forename = ref();
const lastname = ref();
const password = ref();
const falseCredentials = ref();
const isPwd = ref(true);
const router = useRouter();

const nameRules = ref([(v) => !!v || "Name is required"]);

async function login() {
  Cookies.remove("user");

  const id = hashString(forename.value + lastname.value + password.value);
  const correctCredentials = await userLogin(id, hashString(password.value));
  console.log(correctCredentials);

  if (correctCredentials) {
    Cookies.set("user", JSON.stringify({ id: id, role: correctCredentials }), {
      expires: 7,
    });

    router.push({ name: "Overview" });
    console.log("Login successful");
    falseCredentials.value = false;
  } else {
    Cookies.remove("user");
    falseCredentials.value = true;
  }
}

const isInstallable = ref(false);
const deferredPrompt = ref(null);
onMounted(() => {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Save the event so it can be triggered later.
    deferredPrompt.value = e;
    // Update UI to notify the user they can install the PWA
    isInstallable.value = true;
  });
});

async function installPWA() {
  if (deferredPrompt.value) {
    // Show the install prompt
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    deferredPrompt.value = null;
    isInstallable.value = false;
  }
}
</script>
