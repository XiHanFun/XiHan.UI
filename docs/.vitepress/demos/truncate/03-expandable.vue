<!-- 点击展开 | expandable 让整块文字变成一颗按钮，Enter / Space 也按得动 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhTruncate } from "@xihan-ui/vue";

const expanded = ref(false);
const text =
  "这次更新把导出改成了后台任务：点导出后先落一条记录，处理完再推通知，" +
  "中途关掉页面也不影响；文件保留 7 天，过期由清理任务回收。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <!-- v-model:open 走受控：状态在外面，组件只发意图 -->
    <XhTruncate v-model:open="expanded" :lines="2" expandable>
      {{ text }}
    </XhTruncate>

    <button type="button" style="justify-self: start" @click="expanded = !expanded">
      {{ expanded ? "收回去" : "在外面展开" }}
    </button>
  </div>
</template>
