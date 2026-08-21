<!-- 分组与标记位 | 组标题与组内条目用 role="group" 加 aria-labelledby 对上；中间包一层不影响方向键行程，条目里标记位与文字各占一段 -->
<script setup lang="ts">
import { CheckIcon } from "@xihan-ui/icons";
import { ref } from "vue";
import {
  XhIcon,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
} from "@xihan-ui/vue";

const groups = [
  {
    value: "density",
    label: "行高",
    items: [
      { value: "compact", label: "紧凑" },
      { value: "comfortable", label: "宽松" },
    ],
  },
  {
    value: "panel",
    label: "面板",
    items: [
      { value: "sidebar", label: "侧栏" },
      { value: "inspector", label: "属性面板" },
    ],
  },
];

const density = ref("comfortable");
const panels = ref<string[]>(["sidebar"]);

function checked(group: string, value: string): boolean {
  return group === "density" ? density.value === value : panels.value.includes(value);
}

function onSelect(details: { value: string }): void {
  if (details.value === "compact" || details.value === "comfortable") {
    density.value = details.value;
    return;
  }
  panels.value = panels.value.includes(details.value)
    ? panels.value.filter(v => v !== details.value)
    : [...panels.value, details.value];
}

const labelStyle = {
  padding: "6px 8px",
  fontSize: "12px",
  color: "var(--xh-fg-muted)",
};

// 标记位恒占一格，勾不勾都不推动后面的文字
const markStyle = {
  flex: "none",
  inlineSize: "14px",
};
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhMenuRoot @select="onSelect">
      <XhMenuTrigger>视图</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <template v-for="(g, index) in groups" :key="g.value">
            <XhMenuSeparator v-if="index > 0" />
            <div role="group" :aria-labelledby="`menu-group-${g.value}`">
              <div :id="`menu-group-${g.value}`" :style="labelStyle">{{ g.label }}</div>
              <XhMenuItem v-for="item in g.items" :key="item.value" :value="item.value">
                <span :style="markStyle"><XhIcon v-if="checked(g.value, item.value)" :icon="CheckIcon" /></span>
                <span>{{ item.label }}</span>
              </XhMenuItem>
            </div>
          </template>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>

    <span>
      行高：{{ density === "compact" ? "紧凑" : "宽松" }}；面板：{{
        panels.length ? panels.length + " 个" : "都收起了"
      }}
    </span>
  </div>
</template>
