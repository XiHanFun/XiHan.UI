const n=`<!-- 再点一次清空 | allowClear 缺省就开：点中当前那一档清回“还没评”，键盘在最低档再往下走一步同样清零；设为 false 关掉 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";

const score = ref(3);
const sticky = ref(3);
<\/script>

<template>
  <div style="display: grid; gap: 12px">
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="score">
        <XhRatingLabel>整体满意度（可清空）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ score === 0 ? "还没评" : score }}</p>
    </div>
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="sticky" :allow-clear="false">
        <XhRatingLabel>关掉清空（再点不清）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i">★</XhRatingItem>
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ sticky }}</p>
    </div>
  </div>
</template>
`;export{n as default};
