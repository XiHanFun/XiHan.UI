<!-- 语气与尺寸 | tone 决定按钮用哪族颜色，size 换一档尺寸；translations 换掉读屏念出的名字 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";

const scrollEl = ref<HTMLElement | null>(null);
const tone = ref("brand");
const size = ref("md");
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div style="display: flex; gap: 16px">
      <label style="display: flex; align-items: center; gap: 6px">
        语气
        <select v-model="tone">
          <option
            v-for="t in ['brand', 'neutral', 'success', 'warning', 'danger', 'info']"
            :key="t"
            :value="t"
          >
            {{ t }}
          </option>
        </select>
      </label>
      <label style="display: flex; align-items: center; gap: 6px">
        尺寸
        <select v-model="size">
          <option v-for="s in ['sm', 'md', 'lg']" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
    </div>

    <div style="position: relative">
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
        <p v-for="i in 20" :key="i" style="margin: 0 0 12px">第 {{ i }} 段内容。</p>
      </div>

      <XhBackTopRoot
        :target="scrollEl"
        :tone="tone"
        :size="size"
        :visibility-height="40"
        :translations="{ trigger: '回到顶部' }"
        style="position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px"
      >
        <XhBackTopTrigger>↑</XhBackTopTrigger>
      </XhBackTopRoot>
    </div>
  </div>
</template>
