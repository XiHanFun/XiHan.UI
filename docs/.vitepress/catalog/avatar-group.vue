<script setup lang="ts">
import { XhAvatarFallback, XhAvatarGroupRoot, XhAvatarRoot } from "@xihan-ui/vue";

const members = [
  { label: "曦", tone: "brand" },
  { label: "寒", tone: "success" },
  { label: "懿", tone: "warning" },
  { label: "承", tone: "info" },
] as const;
</script>

<template>
  <XhAvatarGroupRoot>
    <XhAvatarRoot v-for="member in members" :key="member.label" :tone="member.tone">
      <XhAvatarFallback>{{ member.label }}</XhAvatarFallback>
    </XhAvatarRoot>
  </XhAvatarGroupRoot>
</template>
