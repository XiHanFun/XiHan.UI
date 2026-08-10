<!-- 触发与连打 | longPressDelay 是触摸端按住多久算触发；typeahead 决定展开后的可打印字符是拿去检索还是放行给页面 -->
<script setup lang="ts">
import type { CSSProperties } from "vue";
import { XhContextMenuRoot } from "@xihan-ui/vue";

const formats = [
  { value: "pdf", label: "PDF 预览" },
  { value: "excel", label: "Excel 导出" },
  { value: "markdown", label: "Markdown 源码" },
];

// 两块触发区共用一份外观，差别只由 root 上那一个属性造成
const triggerStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  minBlockSize: "108px",
  border: "1px dashed var(--xh-border-default)",
  borderRadius: "8px",
  padding: "8px",
  textAlign: "center",
};
</script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    "
  >
    <!-- 长按 300ms 就触发，比缺省的 700ms 灵敏；按住期间指针挪动超过容差算取消 -->
    <XhContextMenuRoot :long-press-delay="300" :collection="formats">
      <template #trigger>
        <span :style="triggerStyle">
          触摸端按住 300ms 即弹出；展开后敲 E 跳到 Excel 那一条
        </span>
      </template>
    </XhContextMenuRoot>

    <!-- 关掉连打检索：同样敲 E，焦点不再移动，字符原样放行给页面 -->
    <XhContextMenuRoot :typeahead="false" :collection="formats">
      <template #trigger>
        <span :style="triggerStyle">连打检索关掉：展开后敲 E 焦点不动</span>
      </template>
    </XhContextMenuRoot>
  </div>
</template>
