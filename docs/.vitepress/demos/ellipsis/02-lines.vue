<!-- 行数 | lines 为 1 走单行省略，大于 1 按行数裁，末行收省略号 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhEllipsis } from "@xihan-ui/vue";

const lines = ref(2);
const text =
  "这条商品说明写得很长：材质为 100% 长绒棉，机洗需用中性洗涤剂，不可漂白，" +
  "低温熨烫，深浅色分开洗涤，首次下水建议单独清洗以免染色。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <label style="display: flex; align-items: center; gap: 8px">
      夹几行
      <input v-model.number="lines" type="range" min="1" max="5" step="1" />
      {{ lines }}
    </label>

    <!-- 换行数就是换了一把尺，组件会自己重量一次，不必手动触发 -->
    <XhEllipsis :lines="lines">{{ text }}</XhEllipsis>
  </div>
</template>
