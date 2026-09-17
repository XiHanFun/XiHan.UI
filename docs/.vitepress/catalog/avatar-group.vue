<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/vue";

const members = ["曦", "寒", "懿", "承"];
</script>

<template>
  <XhAvatarGroupRoot>
    <XhAvatarRoot v-for="member in members" :key="member">
      <XhAvatarFallback>{{ member }}</XhAvatarFallback>
    </XhAvatarRoot>
  </XhAvatarGroupRoot>
</template>
