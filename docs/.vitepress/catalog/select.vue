<script setup lang="ts">
import { XhSelectRoot } from "@xihan-ui/vue";

const options = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];
</script>

<template>
  <XhSelectRoot :collection="options" :default-value="['banana']" label="水果" />
</template>
