const n=`<!-- 形态 | variant 决定颜色怎么用，未按下与已按下两档一起看才完整 -->
<script setup lang="ts">
import { XhToggle } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"] as const;
<\/script>

<template>
  <div style="display: grid; gap: 8px">
    <div style="display: flex; align-items: center; gap: 8px">
      <span style="min-width: 64px">未按下</span>
      <XhToggle v-for="v in variants" :key="v" :variant="v">{{ v }}</XhToggle>
    </div>
    <div style="display: flex; align-items: center; gap: 8px">
      <span style="min-width: 64px">已按下</span>
      <XhToggle v-for="v in variants" :key="v" :variant="v" default-pressed>{{ v }}</XhToggle>
    </div>
  </div>
</template>
`;export{n as default};
