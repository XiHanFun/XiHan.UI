const n=`<!-- 可关闭 | closable 给出关闭钮；open 受控时去留由宿主决定，可访问名逐枚带上标签文字，摘掉一枚后焦点交给下一枚 -->
<script setup lang="ts">
import { nextTick, ref } from "vue";
import {
  XhButton,
  XhTagCloseTrigger,
  XhTagLabel,
  XhTagRoot,
} from "@xihan-ui/vue";

const all = ["设计", "前端", "无头内核", "可访问性"];
const tags = ref([...all]);
const listEl = ref<HTMLElement | null>(null);

async function remove(tag: string) {
  const index = tags.value.indexOf(tag);
  tags.value = tags.value.filter((t) => t !== tag);
  await nextTick();

  // 被摘掉的那一枚带着焦点一起消失，接不住就掉回页面开头：
  // 交给顶上来的那一枚的关闭钮，摘的是最后一枚就交给剩下的最后一枚，一枚不剩交给"还原"钮
  const closes = listEl.value
    ? [
        ...listEl.value.querySelectorAll<HTMLElement>(
          '[data-part="close-trigger"]',
        ),
      ]
    : [];
  const next = closes[Math.min(index, closes.length - 1)];
  const reset = listEl.value?.querySelector<HTMLElement>(
    '[data-scope="button"]',
  );
  (next ?? reset)?.focus();
}
<\/script>

<template>
  <div
    ref="listEl"
    style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px"
  >
    <XhTagRoot
      v-for="tag in tags"
      :key="tag"
      variant="subtle"
      tone="brand"
      closable
      :open="true"
      :translations="{ close: \`移除 \${tag}\` }"
      @open-change="remove(tag)"
    >
      <XhTagLabel>{{ tag }}</XhTagLabel>
      <XhTagCloseTrigger />
    </XhTagRoot>

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
`;export{n as default};
