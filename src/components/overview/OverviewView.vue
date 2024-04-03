<template>
  <div class="q-ma-lg q-mt-xl">
    <q-card v-if="!showCarousel">
      <q-card-actions align="center" class="q-gutter-md">
        <q-skeleton type="QToggle" />
      </q-card-actions>

      <q-skeleton height="150px" square />
      <q-card-actions align="center" class="q-gutter-md">
        <q-skeleton type="QBtn" />
      </q-card-actions>
      <q-card-actions align="center" class="q-gutter-md">
        <q-skeleton size="22px" type="QRadio" />
        <q-skeleton size="22px" type="QRadio" />
      </q-card-actions>
    </q-card>
    <q-carousel
      v-else
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      animated
      control-color="white"
      navigation
      padding
      arrows
      height="300px"
      class="bg-primary text-white shadow-1 rounded-borders"
    >
      <template v-slot:navigation-icon="{ active, btnProps, onClick }">
        <q-btn
          v-if="active"
          size="lg"
          :icon="btnProps.icon"
          color="yellow"
          flat
          round
          dense
          @click="onClick"
        />
        <q-btn
          v-else
          size="sm"
          :icon="btnProps.icon"
          color="white"
          flat
          round
          dense
          @click="onClick"
        />
      </template>
      <q-carousel-slide
        v-if="role === '1'"
        name="init"
        class="column no-wrap flex-center"
      >
        <q-icon name="list" size="56px" />
        <div class="q-mt-md text-center">
          Sehen Sie eine Liste mit Ihren aktuellen (noch ungeprüften) Check-Ins
          an.
          <div>
            <q-btn
              class="q-mt-sm"
              text-color="black"
              color="yellow"
              label="Zum Feature"
            />
          </div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        v-if="role === '1'"
        name="qr-fallback"
        class="column no-wrap flex-center"
      >
        <q-icon name="qr_code" size="56px" />
        <div class="q-mt-md text-center">
          Sie haben Ihren Studierendenausweis vergessen? Kein Problem! Nutzen
          Sie einfach den QR-Code.
          <div>
            <q-btn
              class="q-mt-sm"
              text-color="black"
              color="yellow"
              label="Zum Feature"
            />
          </div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        v-if="role === '2'"
        name="init"
        class="column no-wrap flex-center"
      >
        <q-icon name="nfc" size="56px" />
        <div class="q-mt-md text-center">
          Sie halten gerade eine Vorlesung und möchten die Anwesenheit der
          Studierenden aufnehmen? Dann starten Sie den NFC-Scan.
          <div>
            <q-btn
              class="q-mt-sm"
              text-color="black"
              color="yellow"
              label="Zum Feature"
              to="nfc-scan"
            />
          </div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        v-if="role === '3'"
        name="init"
        class="column no-wrap flex-center"
      >
        <q-icon name="qr_code" size="56px" />
        <div class="q-mt-md text-center">
          Sie möchten einen neuen Studierenden registrieren? Dann scannen Sie
          den QR-Code und bestätigen Sie die Daten.
          <div>
            <q-btn
              class="q-mt-sm"
              text-color="black"
              color="yellow"
              label="Zum Feature"
              to="/qr-test"
            />
          </div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        v-if="role === '3'"
        name="attendance-list"
        class="column no-wrap flex-center"
      >
        <q-icon name="groups" size="56px" />
        <div class="q-mt-md text-center">
          Sie möchten die Anwesenheiten der Studierenden für einen bestimmten
          Tag kontrollieren? Dann öffnen Sie die Liste.
          <div>
            <q-btn
              class="q-mt-sm"
              text-color="black"
              color="yellow"
              label="Zum Feature"
              to="/attendance-list"
            />
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script setup>
import Cookies from "js-cookie";
import { onMounted, ref } from "vue";
const slide = ref("init");
const lorem = ref(
  "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Itaque voluptatem totam, architecto cupiditate officia rerum, error dignissimos praesentium libero ab nemo."
);
const role = ref();
const showCarousel = ref(false);
init();
onMounted(() =>
  setTimeout(() => {
    showCarousel.value = true;
  }, 1000)
);

function init() {
  const cookie = readCookie();
  role.value = cookie.role;
}

//CODE DUPLICATE - INDEX:JS
function readCookie() {
  const userCookie = Cookies.get("user");
  if (userCookie) {
    console.log("Cookie gefunden");
    const user = parseCookie(userCookie);
    return user;
  } else {
    //router.push("/login"); // Leiten Sie den Benutzer zur Login-Seite um, wenn kein Cookie gefunden wird
  }
}

function parseCookie(cookie) {
  const decodedCookie = decodeURIComponent(cookie);
  const parsedCookie = JSON.parse(decodedCookie);
  console.log(parsedCookie);
  return parsedCookie;
}
</script>
