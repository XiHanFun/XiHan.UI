const n=`<!-- 间距档位 | gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌，缺省 md -->
<script setup lang="ts">
import { XhSpace } from "@xihan-ui/vue";

const boxStyle =
  "padding: 6px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const labelStyle =
  "font-size: 13px; color: var(--xh-fg-muted); inline-size: 96px";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
<\/script>

<template>
  <XhSpace direction="vertical" gap="sm" align="start">
    <XhSpace v-for="g in gaps" :key="g" gap="md">
      <span :style="labelStyle">gap = {{ g }}</span>
      <XhSpace :gap="g">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhSpace>
    </XhSpace>

    <!-- 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 -->
    <XhSpace gap="md">
      <span :style="labelStyle">槽位覆盖</span>
      <XhSpace gap="xs" style="--xh-space-gap: 40px">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhSpace>
    </XhSpace>
  </XhSpace>
</template>
`;export{n as default};
