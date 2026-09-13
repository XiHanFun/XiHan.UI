const n=`<!-- 自定义图标 | 条目可使用首方图标，也可留空使用皮肤默认星形 -->
<script setup lang="ts">
import { HeartIcon } from "@xihan-ui/icons";
import { XhIcon, XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap">
    <XhRatingRoot v-slot="{ items }" :default-value="3">
      <XhRatingLabel>换个字形</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i"><XhIcon :icon="HeartIcon" /></XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="2" allow-half>
      <XhRatingLabel>内置星形与半档</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i" />
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
`;export{n as default};
