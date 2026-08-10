<!-- 从外部跳到某一节 | 组件只在点链接时滚动；程序化跳转由宿主自己滚，滚完观察器会把高亮结算过来 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhButton,
} from "@xihan-ui/vue";

// 判定线与滚动落点用同一个偏移，跳过去之后高亮正好落在这一节
const OFFSET = 12;

const sections = [
  { value: "anchor-goto-intro", label: "简介" },
  { value: "anchor-goto-usage", label: "用法" },
  { value: "anchor-goto-faq", label: "常见问题" },
];

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

function jumpTo(id: string): void {
  const container = scrollEl.value;
  const target = container?.querySelector<HTMLElement>(`#${id}`);
  if (!container || !target) {
    return;
  }
  const delta
    = target.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      - OFFSET;
  container.scrollTo({ top: container.scrollTop + delta, behavior: "smooth" });
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap">
      <XhButton
        v-for="s in sections"
        :key="s.value"
        size="sm"
        variant="outline"
        @click="jumpTo(s.value)"
      >
        跳到{{ s.label }}
      </XhButton>
      <span>当前：{{ active ?? "（还没有一节越过判定线）" }}</span>
    </div>

    <div
      style="
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 20px;
        align-items: start;
      "
    >
      <XhAnchorRoot
        v-model:value="active"
        :scroll-element="scrollEl"
        :offset="OFFSET"
        smooth
      >
        <XhAnchorList>
          <XhAnchorItem v-for="s in sections" :key="s.value">
            <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
          </XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>

      <div
        ref="scrollEl"
        style="
          block-size: 220px;
          overflow: auto;
          padding: 12px;
          border: 1px solid var(--xh-border-default);
          border-radius: 8px;
        "
      >
        <div
          v-for="s in sections"
          :id="s.value"
          :key="s.value"
          style="block-size: 180px"
        >
          <strong>{{ s.label }}</strong>
          <p>这一节的正文。</p>
        </div>
      </div>
    </div>
  </div>
</template>
