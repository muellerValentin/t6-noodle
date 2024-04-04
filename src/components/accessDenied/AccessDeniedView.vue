<!-- 
description: View, when user has no access to a specific file
author: @luca.breisch
 -->
<template>
  <q-card class="q-ma-lg q-mt-xl">
    <div>
      <q-btn
        class="q-mt-md"
        to="/login"
        flat
        bg-color="standard"
        color="primary"
        size="sm"
        icon="arrow_back"
        label="zurück"
      />
    </div>
    <q-separator />
    <div class="flex flex-center q-pa-md">
      <q-icon size="50px" color="red" name="close"></q-icon>
    </div>
    <div class="flex flex-center q-pa-md">
      <p class="text-h4">Zugriff verweigert!</p>
    </div>
  </q-card>
</template>

<script setup></script>
