<template>
  <Navbar />
  <main class="container mt-4 mb-5">
    <router-view />
  </main>
</template>
<script setup>
import Navbar from './components/Navbar.vue';
</script>
<style>
body { background-color: #f8f9fa; }
</style>