const t=`<!-- 尺寸 | size 改星的大小与间距，不写即缺省中档 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
    <XhRatingRoot v-slot="{ items }" :default-value="3" size="sm">
      <XhRatingLabel>sm</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="3">
      <XhRatingLabel>缺省</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>

    <XhRatingRoot v-slot="{ items }" :default-value="3" size="lg">
      <XhRatingLabel>lg</XhRatingLabel>
      <XhRatingControl>
        <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
      </XhRatingControl>
    </XhRatingRoot>
  </div>
</template>
`;export{t as default};
