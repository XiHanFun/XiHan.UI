<!-- 再点一次清空 | allowClear 默认开启：点击当前档位清回未评分，键盘在最低档再向下一步同样清零；设为 false 关闭 -->
<script setup lang="ts">
import { XhRatingControl, XhRatingItem, XhRatingLabel, XhRatingRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const score = ref(3);
const sticky = ref(3);
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="score">
        <XhRatingLabel>整体满意度（可清空）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ score === 0 ? "还没评" : score }}</p>
    </div>
    <div>
      <XhRatingRoot v-slot="{ items }" v-model:value="sticky" :allow-clear="false">
        <XhRatingLabel>关掉清空（再点不清）</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i" />
        </XhRatingControl>
      </XhRatingRoot>
      <p style="margin: 4px 0 0; font-size: 13px">当前：{{ sticky }}</p>
    </div>
  </div>
</template>
