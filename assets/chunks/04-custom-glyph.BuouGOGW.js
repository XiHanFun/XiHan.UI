const n=`<!-- 自定义图元 | 默认插槽给出内容时改由插槽填充根 svg，元素不再生成 glyph 空壳；坐标系此时由自己写的 viewBox 定 -->
<script setup lang="ts">
import { XhIcon } from "@xihan-ui/vue";
<\/script>

<template>
  <!-- 不传 icon，几何自己写：适合一次性的品牌标记、渐变填充这类不进图标集的图形 -->
  <XhIcon viewBox="0 0 24 24" size="lg" label="曦寒标记">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
    <path
      d="M8 8L16 16M16 8L8 16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </XhIcon>

  <XhIcon viewBox="0 0 24 24" size="lg" label="半满进度">
    <rect x="3" y="9" width="18" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="2" />
    <rect x="5" y="11" width="7" height="2" rx="1" fill="currentColor" />
  </XhIcon>
</template>
`;export{n as default};
