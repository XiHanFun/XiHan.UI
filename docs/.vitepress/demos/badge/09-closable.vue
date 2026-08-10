<!-- 可关闭标签 | 根是 inline-flex 且自带间距，关闭件直接写进默认插槽跟文字并排；点击语义、Tab 停靠与回车触发由原生按钮自带 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBadge, XhButton } from "@xihan-ui/vue";

const all = ["设计", "前端", "无头内核", "可访问性"];
const tags = ref([...all]);

function remove(tag: string) {
  tags.value = tags.value.filter((t) => t !== tag);
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <XhBadge v-for="tag in tags" :key="tag" variant="subtle" tone="brand">
      {{ tag }}
      <!-- 关闭件的名字给全，读屏念到的是「移除 前端」而不是一个叉 -->
      <button
        type="button"
        :aria-label="'移除 ' + tag"
        style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          line-height: 1;
          cursor: pointer;
        "
        @click="remove(tag)"
      >
        ×
      </button>
    </XhBadge>

    <span v-if="!tags.length" style="font-size: 13px">已全部移除</span>

    <XhButton
      v-if="tags.length < all.length"
      size="sm"
      variant="ghost"
      @click="tags = [...all]"
    >
      还原
    </XhButton>
  </div>
</template>
