const e=`<!-- 手写格子 | 不提供数据也可以：每格自行声明 value，名字与禁用写在格子上；半透明颜色铺在棋盘格上 -->
<script setup lang="ts">
import { XhColorSwatchPickerItem, XhColorSwatchPickerLabel, XhColorSwatchPickerRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const value = ref<string | null>("rgb(225, 29, 72)");
<\/script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <XhColorSwatchPickerRoot v-model:value="value">
      <XhColorSwatchPickerLabel>高亮色</XhColorSwatchPickerLabel>
      <XhColorSwatchPickerItem value="#e11d48" label="玫红" />
      <XhColorSwatchPickerItem value="#e11d4880" label="半透明玫红" />
      <XhColorSwatchPickerItem value="#f59e0b" label="琥珀" disabled />
      <XhColorSwatchPickerItem value="hsl(217 91% 60%)" label="天蓝" />
    </XhColorSwatchPickerRoot>
    <span style="font-size: 13px">当前：<code>{{ value ?? "（未选）" }}</code></span>
  </div>
</template>
`;export{e as default};
