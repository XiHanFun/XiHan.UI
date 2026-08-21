const e=`<!-- 可填区间 | min / max 收窄各段的加减范围，越界的初值只做标注、不被改写 -->
<script setup lang="ts">
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
} from "@xihan-ui/vue";
<\/script>

<template>
  <div style="display: grid; gap: 16px">
    <XhDateFieldRoot
      default-value="2026-07-28"
      locale="zh-CN"
      min="2020-01-01"
      max="2030-12-31"
    >
      <XhDateFieldLabel>在区间内（2020 – 2030）</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>

    <!-- 初值早于 min：root 挂上 data-out-of-range，值本身原样留着 -->
    <XhDateFieldRoot default-value="2019-05-01" locale="zh-CN" min="2020-01-01">
      <XhDateFieldLabel>越界（min 2020-01-01）</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegment :index="0" />
        <span>年</span>
        <XhDateFieldSegment :index="1" />
        <span>月</span>
        <XhDateFieldSegment :index="2" />
        <span>日</span>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  </div>
</template>
`;export{e as default};
