const n=`<!-- 可滚动的标签栏 | 标签多到一行放不下时，把 list 装进作者自建的横滚容器，两端各摆一个滚动按钮 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: \`module-\${i + 1}\`,
  label: \`模块 \${i + 1}\`,
}));

const viewport = ref<HTMLElement | null>(null);

function scrollStrip(delta: number): void {
  viewport.value?.scrollBy({ left: delta, behavior: "smooth" });
}
<\/script>

<template>
  <XhTabsRoot default-value="module-1" style="inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton
        size="sm"
        variant="outline"
        aria-label="向前滚动"
        @click="scrollStrip(-200)"
      >
        ‹
      </XhButton>

      <!-- 滚动视口是 list 外面的一层普通容器：条目查询只以 list 为界，键盘与切换都不受它影响 -->
      <div ref="viewport" style="flex: 1; min-inline-size: 0; overflow-x: auto">
        <!-- 让 list 撑到内容宽度，基线才跟着标签一起滚 -->
        <XhTabsList style="inline-size: max-content">
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </div>

      <XhButton
        size="sm"
        variant="outline"
        aria-label="向后滚动"
        @click="scrollStrip(200)"
      >
        ›
      </XhButton>
    </div>

    <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
      {{ t.label }} 的面板
    </XhTabsContent>
  </XhTabsRoot>
</template>
`;export{n as default};
