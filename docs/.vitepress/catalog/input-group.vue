<script setup lang="ts">
import { XhInputGroupItem, XhInputGroupRoot, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhInputGroupRoot style="inline-size: 220px">
    <XhInputGroupItem>https://</XhInputGroupItem>
    <XhTextFieldRoot default-value="xihan.fun">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="站点地址" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhInputGroupRoot>
</template>
