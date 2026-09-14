<script setup lang="ts">
import { XhSliderControl, XhSliderHiddenInput, XhSliderLabel, XhSliderRange, XhSliderRoot, XhSliderThumb, XhSliderTrack } from "@xihan-ui/vue";
</script>

<template>
  <XhSliderRoot v-slot="{ value }" :default-value="[40]" style="inline-size: 220px">
    <XhSliderLabel>音量：{{ value[0] }}</XhSliderLabel>
    <XhSliderControl>
      <XhSliderTrack>
        <XhSliderRange />
      </XhSliderTrack>
      <XhSliderThumb>
        <XhSliderHiddenInput />
      </XhSliderThumb>
    </XhSliderControl>
  </XhSliderRoot>
</template>
