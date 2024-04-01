<template>
  <router-view />
</template>

<script setup>
// Import the functions you need from the SDKs you need
import { ref } from "vue";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCupHhjqvoXWDZwTv1Aa_xZY9MVrWmiH_U",
  authDomain: "noodle-t6.firebaseapp.com",
  projectId: "noodle-t6",
  storageBucket: "noodle-t6.appspot.com",
  messagingSenderId: "427139124965",
  appId: "1:427139124965:web:0f3ca972889e350ebf8e0c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
defineOptions({
  name: "App",
});
</script>
