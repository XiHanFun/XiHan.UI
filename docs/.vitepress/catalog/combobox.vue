<script setup lang="ts">
import { XhComboboxRoot } from "@xihan-ui/vue";

const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
];
</script>

<template>
  <XhComboboxRoot :collection="cities" :default-value="['beijing']" label="城市" placeholder="搜索城市" style="inline-size: 220px" />
</template>
