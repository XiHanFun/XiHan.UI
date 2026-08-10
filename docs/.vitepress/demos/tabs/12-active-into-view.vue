<!-- 切换后滚进视野 | 每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import {
  XhButton,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
} from "@xihan-ui/vue";

const tabs = Array.from({ length: 12 }, (_, i) => ({
  value: `chapter-${i + 1}`,
  label: `第 ${i + 1} 章`,
}));

const value = ref("chapter-1");
const viewport = ref<HTMLElement | null>(null);

// 监听选中值而不是切换事件：外部改值、键盘走位、点击三条路都在这里收口
watch(value, (next) => {
  viewport.value
    ?.querySelector<HTMLElement>(`[data-part="trigger"][data-value="${next}"]`)
    ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <XhTabsRoot v-model:value="value" variant="segment">
      <div ref="viewport" style="overflow-x: auto">
        <XhTabsList style="inline-size: max-content">
          <XhTabsTrigger v-for="t in tabs" :key="t.value" :value="t.value">
            {{ t.label }}
          </XhTabsTrigger>
        </XhTabsList>
      </div>

      <XhTabsContent v-for="t in tabs" :key="t.value" :value="t.value">
        {{ t.label }} 的面板
      </XhTabsContent>
    </XhTabsRoot>

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton size="sm" variant="outline" @click="value = 'chapter-12'">
        跳到第 12 章
      </XhButton>
      <XhButton size="sm" variant="outline" @click="value = 'chapter-1'">
        回到第 1 章
      </XhButton>
      <span>用方向键走位时，标签栏也会跟着滚</span>
    </div>
  </div>
</template>
