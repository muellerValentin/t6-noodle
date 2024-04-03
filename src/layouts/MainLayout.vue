<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Noodle </q-toolbar-title>

        <div>
          <q-btn
            flat
            dense
            round
            icon="logout"
            aria-label="Logout"
            id="logout"
            @click="logout"
          />
          <q-btn
            flat
            dense
            round
            icon="info_outline"
            aria-label="info"
            id="info"
            @click="alert = true"
          />
          <q-dialog
            backdrop-filter="blur(4px) saturate(150%)"
            v-model="alert"
            :position="position"
          >
            <q-card style="width: 350px">
              <q-linear-progress :value="1" color="primary" />

              <q-card-section class="row items-center no-wrap">
                <div>
                  <div class="text-weight-bold h-6">Noodle</div>
                  <div class="text-grey">
                    by L.Breisch, L.Lederer, M.Möldner, V.Müller, D.Vollmer
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import Cookies from "js-cookie";
import { ref } from "vue";
const alert = ref(false);
function showInfo() {}
import { useRouter } from "vue-router";

const router = useRouter();

defineOptions({
  name: "MainLayout",
});

function logout() {
  Cookies.remove("user");
  router.push("/login");
}
</script>

<style>
#logout {
  margin-left: 2rem;
}
</style>
