const t=`<!-- 四角 | placement 决定钉在哪一角，start / end 跟着书写方向走；那一组恒往页面中间长 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from "@xihan-ui/vue";

const placements = ["top-start", "top-end", "bottom-start", "bottom-end"] as const;
const placement = ref<(typeof placements)[number]>("bottom-end");
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <label v-for="p in placements" :key="p" style="display: flex; align-items: center; gap: 4px">
        <input v-model="placement" type="radio" :value="p" />
        {{ p }}
      </label>
    </div>

    <div
      style="
        position: relative;
        block-size: 280px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <XhFloatButtonRoot
        style="position: absolute"
        :placement="placement"
        :offset="16"
        default-open
      >
        <XhFloatButtonTrigger>＋</XhFloatButtonTrigger>
        <XhFloatButtonList>
          <button type="button" title="编辑">✎</button>
          <button type="button" title="分享">↗</button>
        </XhFloatButtonList>
      </XhFloatButtonRoot>
    </div>
  </div>
</template>
`;export{t as default};
