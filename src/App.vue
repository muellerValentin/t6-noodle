<template>
  <router-view />
</template>

<script setup>
import hashString from "src/helpers/hashing/hashing.js";
console.log(hashString("danielvollmertest1234"));

defineOptions({
  name: "App",
});
</script>
