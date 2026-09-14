<script setup lang="ts">
import { XhListboxContent, XhListboxItem, XhListboxItemIndicator, XhListboxItemText, XhListboxLabel, XhListboxRoot } from "@xihan-ui/vue";

const members = [
  { value: "lin", name: "林知夏" },
  { value: "chen", name: "陈望舒" },
  { value: "zhou", name: "周予安" },
];
</script>

<template>
  <XhListboxRoot :default-value="['lin']" style="inline-size: 200px">
    <XhListboxLabel>团队成员</XhListboxLabel>
    <XhListboxContent>
      <XhListboxItem v-for="member in members" :key="member.value" :value="member.value">
        <XhListboxItemText>{{ member.name }}</XhListboxItemText>
        <XhListboxItemIndicator />
      </XhListboxItem>
    </XhListboxContent>
  </XhListboxRoot>
</template>
