const n=`<!-- 监听吸附状态 | affix-change 报吸住与松开；默认插槽也把 affixed 透出来 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const affixed = ref(false);

function onAffixChange(details: { affixed: boolean }): void {
  affixed.value = details.affixed;
}
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
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
      <p style="block-size: 120px">往下滚，下面的状态会跟着变。</p>

      <XhAffixRoot v-slot="{ affixed: pinned }" :target="scrollEl" @affix-change="onAffixChange">
        <XhAffixContent
          style="padding: 8px 12px; border-radius: 6px; background: var(--xh-bg-subtle)"
        >
          {{ pinned ? "已钉住" : "在常规流里" }}
        </XhAffixContent>
      </XhAffixRoot>

      <p style="block-size: 600px">后面还有很长的内容。</p>
    </div>

    <span>affix-change 最近一次报的是：{{ affixed ? "吸住" : "松开" }}</span>
  </div>
</template>
`;export{n as default};
