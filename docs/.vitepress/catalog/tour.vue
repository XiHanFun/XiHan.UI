<script setup lang="ts">
import {
  XhTourContent,
  XhTourDescription,
  XhTourNextTrigger,
  XhTourProgressText,
  XhTourRoot,
  XhTourTitle,
} from "@xihan-ui/vue";

const steps = [{ id: "welcome", title: "快速上手", description: "从这里开始了解主要功能。" }];
</script>

<template>
  <XhTourRoot :steps="steps" default-open>
    <XhTourContent style="position: static; inline-size: var(--xh-doc-catalog-w)">
      <XhTourTitle />
      <XhTourDescription />
      <XhTourProgressText />
      <XhTourNextTrigger>完成</XhTourNextTrigger>
    </XhTourContent>
  </XhTourRoot>
</template>
