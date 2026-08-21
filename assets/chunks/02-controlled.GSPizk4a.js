const n=`<!-- 受控 | 传了 value 就由宿主说了算；一节都没越过判定线时它是 null，此时谁都不亮、指示条整条收起 -->
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

const sections = [
  { value: "anchor-ctl-install", label: "安装" },
  { value: "anchor-ctl-usage", label: "用法" },
  { value: "anchor-ctl-faq", label: "常见问题" },
];

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
    <div
      style="
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 20px;
        align-items: start;
      "
    >
      <XhAnchorRoot v-model:value="active" :scroll-element="scrollEl" smooth>
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

    <div style="display: flex; align-items: center; gap: 8px">
      <XhButton variant="outline" @click="active = 'anchor-ctl-faq'">
        点亮「常见问题」
      </XhButton>
      <span>当前：{{ active ?? "（还没有一节越过判定线）" }}</span>
    </div>
  </div>
</template>
`;export{n as default};
