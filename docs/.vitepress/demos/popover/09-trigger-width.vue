<!-- 浮层与触发器同宽 | 量出触发器的实际宽度写进 content 的行内样式，同时解掉最大宽度上限；触发器换了文案宽度也跟着走 -->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  XhButton,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const anchorEl = ref<HTMLElement | null>(null);
const triggerWidth = ref(0);
const long = ref(false);

// 行内样式压过皮肤里的 max-content；上限也得一并解掉，否则宽度被截在那一档
const panelStyle = computed(() => ({
  inlineSize: triggerWidth.value ? `${triggerWidth.value}px` : "max-content",
  maxInlineSize: "none",
}));

let observer: ResizeObserver | undefined;

onMounted(() => {
  const el = anchorEl.value;
  if (!el) return;
  observer = new ResizeObserver(() => {
    triggerWidth.value = el.offsetWidth;
  });
  observer.observe(el);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px; justify-items: start">
    <XhPopoverRoot placement="bottom-start">
      <!-- 外面这层只用来量宽：inline-block 使它与按钮同宽 -->
      <span ref="anchorEl" style="display: inline-block">
        <XhPopoverTrigger>
          {{ long ? "生产环境 · 华东 1 区 · 主集群" : "生产环境" }}
        </XhPopoverTrigger>
      </span>
      <XhPopoverPositioner>
        <XhPopoverContent :style="panelStyle">
          <XhPopoverTitle>切换环境</XhPopoverTitle>
          <XhPopoverDescription>
            面板宽 {{ triggerWidth }} 像素，与触发器一致。
          </XhPopoverDescription>
        </XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>

    <XhButton size="sm" variant="outline" @click="long = !long">
      {{ long ? "换回短文案" : "换成长文案" }}
    </XhButton>
  </div>
</template>
