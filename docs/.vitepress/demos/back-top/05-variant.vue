<!-- 形态 | variant 换按钮的底色、描边与前景怎么用；这里把露面门槛设成 0，不滚也看得见 -->
<script setup lang="ts">
import { XhBackTopRoot, XhBackTopTrigger } from "@xihan-ui/vue";
import { ref } from "vue";

const solidEl = ref<HTMLElement | null>(null);
const outlineEl = ref<HTMLElement | null>(null);
const ghostEl = ref<HTMLElement | null>(null);

const boxStyle = {
  blockSize: "160px",
  overflow: "auto",
  padding: "12px",
  border: "1px solid var(--xh-border-default)",
  borderRadius: "8px",
};
const rootStyle
  = "position: absolute; --xh-back-top-inset-block: 12px; --xh-back-top-inset-inline: 12px";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div style="position: relative; inline-size: 200px">
      <div ref="solidEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">实心 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="solidEl" variant="solid" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative; inline-size: 200px">
      <div ref="outlineEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">描边 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="outlineEl" variant="outline" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>

    <div style="position: relative; inline-size: 200px">
      <div ref="ghostEl" :style="boxStyle">
        <p v-for="i in 12" :key="i" style="margin: 0 0 12px">幽灵 {{ i }}</p>
      </div>
      <XhBackTopRoot :target="ghostEl" variant="ghost" :visibility-height="0" :style="rootStyle">
        <XhBackTopTrigger />
      </XhBackTopRoot>
    </div>
  </div>
</template>
