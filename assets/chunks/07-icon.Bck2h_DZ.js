const t=`<!-- 自定义图案 | 星形由作者写，条目自带这颗的点亮状态，点亮与未点亮可以画成两个字形 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-slot="{ items }" :default-value="3">
      <XhRatingLabel>换个字形</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">♥</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="2" allow-half>
      <XhRatingLabel>空心与实心（半颗仍由皮肤裁）</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem
          v-for="i in items"
          :key="i"
          v-slot="{ highlighted }"
          :value="i"
        >{{ highlighted ? "★" : "☆" }}</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
`;export{t as default};
