<!-- 间距档位 | gap 收的是档位名不是像素：xs / sm / md / lg / xl 逐档指向一个间距令牌 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const boxStyle =
  "padding: 6px 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted); inline-size: 96px";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
</script>

<template>
  <XhFlex direction="column" gap="sm">
    <XhFlex v-for="g in gaps" :key="g" align="center" gap="md">
      <span :style="labelStyle">gap = {{ g }}</span>
      <XhFlex :gap="g">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>

    <!-- 档位不够用时，直接给使用者槽位写值，它排在所有档位之前 -->
    <XhFlex align="center" gap="md">
      <span :style="labelStyle">槽位覆盖</span>
      <XhFlex gap="xs" style="--xh-flex-gap: 40px">
        <span :style="boxStyle">甲</span>
        <span :style="boxStyle">乙</span>
        <span :style="boxStyle">丙</span>
      </XhFlex>
    </XhFlex>
  </XhFlex>
</template>
