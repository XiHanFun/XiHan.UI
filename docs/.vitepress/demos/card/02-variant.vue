<!-- 形态 | variant 只改描边、底色与投影怎么用，各段的排版三档一致 -->
<script setup lang="ts">
import { XhCardBody, XhCardHeader, XhCardRoot, XhCardTitle } from "@xihan-ui/vue";

const variants = ["outline", "subtle", "elevated", "ghost"] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhCardRoot v-for="v in variants" :key="v" :variant="v" style="inline-size: 200px">
      <XhCardHeader>
        <XhCardTitle>{{ v }}</XhCardTitle>
      </XhCardHeader>
      <XhCardBody>一段用来看底色与描边的正文。</XhCardBody>
    </XhCardRoot>
  </div>
</template>
