<!-- 断点档位一览 | 四档断点取自令牌：sm 640px、md 768px、lg 1024px、xl 1280px；自窄到宽依次接管，视口到哪一档就用哪一档的列数 -->
<script setup lang="ts">
import { XhGridItem, XhGridRoot } from "@xihan-ui/vue";

const cellStyle =
  "padding: 10px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default); text-align: center";
const headStyle = `${cellStyle}; background: var(--xh-bg-brand-subtle); color: var(--xh-fg-brand-strong)`;
const labelStyle = "font-size: 13px; color: var(--xh-fg-muted)";

// 档位名与生效宽度，与断点令牌逐字一致
const tiers = [
  { name: "base", width: "0（起始档）" },
  { name: "sm", width: "≥ 640px" },
  { name: "md", width: "≥ 768px" },
  { name: "lg", width: "≥ 1024px" },
  { name: "xl", width: "≥ 1280px" },
];

const cells = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸", "子", "丑"];
</script>

<template>
  <XhGridRoot gap="lg">
    <!-- 一档一行：左边档位名，右边这一档从多宽起生效 -->
    <XhGridItem>
      <div :style="labelStyle">档位与生效宽度</div>
      <XhGridRoot :cols="2" gap="sm" style="margin-block-start: 6px">
        <XhGridItem :style="headStyle">档位</XhGridItem>
        <XhGridItem :style="headStyle">生效宽度</XhGridItem>
        <template v-for="tier in tiers" :key="tier.name">
          <XhGridItem :style="cellStyle">{{ tier.name }}</XhGridItem>
          <XhGridItem :style="cellStyle">{{ tier.width }}</XhGridItem>
        </template>
      </XhGridRoot>
    </XhGridItem>

    <!-- 五档写全：一路拉宽窗口，每过一道断点这片格子就少排一行 -->
    <XhGridItem>
      <div :style="labelStyle">五档写全：cols = { base: 1, sm: 2, md: 3, lg: 4, xl: 6 }</div>
      <XhGridRoot
        :cols="{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }"
        gap="sm"
        style="margin-block-start: 6px"
      >
        <XhGridItem v-for="c in cells" :key="c" :style="cellStyle">{{ c }}</XhGridItem>
      </XhGridRoot>
    </XhGridItem>
  </XhGridRoot>
</template>
