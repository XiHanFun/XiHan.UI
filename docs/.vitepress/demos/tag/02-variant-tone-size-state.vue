<!-- 形态、语气、尺寸与状态 | variant 决定颜色的使用方式，tone 只更换色相，size 改变内边距、字号与行框（有无关闭按钮同高）；readOnly 只锁关闭按钮、标签不置灰，disabled 连标签一起置灰，关闭按钮都留在原地，宽度不跳变 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline"] as const;

const tones = [
  { value: "brand", label: "品牌" },
  { value: "neutral", label: "中性" },
  { value: "success", label: "成功" },
  { value: "warning", label: "警告" },
  { value: "danger", label: "危险" },
  { value: "info", label: "信息" },
] as const;

const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "大" },
] as const;

const rowStyle = "display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-2)";
</script>

<template>
  <div style="display: grid; gap: var(--xh-space-4)">
    <div :style="rowStyle">
      <XhTagRoot v-for="v in variants" :key="v" :variant="v" tone="brand">
        <XhTagLabel>{{ v }}</XhTagLabel>
      </XhTagRoot>
    </div>

    <div :style="rowStyle">
      <XhTagRoot
        v-for="tone in tones"
        :key="tone.value"
        variant="subtle"
        :tone="tone.value"
      >
        <XhTagLabel>{{ tone.label }}</XhTagLabel>
      </XhTagRoot>
    </div>

    <div :style="rowStyle">
      <template v-for="item in sizes" :key="item.label">
        <XhTagRoot variant="subtle" :size="item.size">
          <XhTagLabel>{{ item.label }}</XhTagLabel>
        </XhTagRoot>
        <XhTagRoot variant="subtle" :size="item.size" closable>
          <XhTagLabel>{{ item.label }}</XhTagLabel>
          <XhTagCloseTrigger />
        </XhTagRoot>
      </template>
    </div>

    <div :style="rowStyle">
      <XhTagRoot variant="subtle" tone="brand" closable>
        <XhTagLabel>可摘掉</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
      <XhTagRoot variant="subtle" tone="brand" closable read-only>
        <XhTagLabel>只读</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
      <XhTagRoot variant="subtle" tone="brand" closable disabled>
        <XhTagLabel>禁用</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
    </div>
  </div>
</template>
