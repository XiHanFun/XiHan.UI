<script setup lang="ts">
import type { Component } from "vue";
import { useData, withBase } from "vitepress";
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { restoreDemoStage, stageAttrs } from "./demo-stage";

const props = defineProps<{
  href: string;
  label: string;
  name: string;
  renderless?: boolean;
  src: string;
  status?: "alpha" | "new" | "updated";
}>();

const previews = import.meta.glob<{ default: Component }>("../catalog/*.vue");
const load = previews[`../catalog/${props.src}.vue`];
const demo = load ? defineAsyncComponent(load) : undefined;
const placeholderTones = ["brand", "info", "success", "warning", "danger"] as const;
const placeholderTone = placeholderTones[props.src.length % placeholderTones.length];
const root = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | undefined;

const { isDark } = useData();
// 预览与示例舞台打同一组档位属性（主题 / 密度 / 对比度 / 方向），读者在示例页存下的档位
// 到总览页同样生效；总览页没有工具条，这里自己校正一次（幂等）
const stageBindings = computed(() => stageAttrs(isDark.value));

onMounted(() => {
  restoreDemoStage();
  if (!("IntersectionObserver" in window)) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting)
      return;
    visible.value = true;
    observer?.disconnect();
  }, { rootMargin: "160px" });

  if (root.value)
    observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <article ref="root" class="xh-component-card">
    <div
      class="xh-component-card__preview xh-demo__stage"
      inert
      aria-hidden="true"
      v-bind="stageBindings"
    >
      <div v-if="visible && demo && !renderless" class="xh-component-card__demo">
        <component :is="demo" />
      </div>
      <span
        v-else
        class="xh-component-card__placeholder"
        data-demo-block
        :data-tone="placeholderTone"
      />
    </div>
    <a class="xh-component-card__link" :href="withBase(href)">
      <strong>{{ name }}</strong>
      <span>{{ label }}</span>
      <span
        v-if="status"
        class="xh-component-card__status"
        :class="`xh-component-card__status--${status}`"
      >{{ status === "updated" ? "更新" : status }}</span>
    </a>
  </article>
</template>

<style>
.xh-component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--xh-space-6) var(--xh-space-4);
  margin: var(--xh-space-5) 0 var(--xh-space-8);
}

.xh-component-card {
  min-width: 0;
}

/*
 * 预览卡是描边面，不是 Card：边界只由描边承担，底取页面色、无影、不缩放。
 * 宽高两档由这里以变量下发给各预览根（--xh-doc-catalog-w 常规、-narrow 单行输入类、-h 可用高），
 * 预览文件自己不写尺寸散值。contain: layout paint 兼做裁切与固定定位包含块：
 * Dialog / Command 缩略面板的 positioner 是 position: fixed，靠它圈在卡内。
 */
.xh-component-card__preview {
  --xh-doc-catalog-w: 240px;
  --xh-doc-catalog-w-narrow: 160px;
  --xh-doc-catalog-h: 166px;

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  block-size: 190px;
  padding: var(--xh-space-3);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-page);
  box-shadow: none;
  contain: layout paint;
}

.xh-component-card__demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-2);
  inline-size: 100%;
  max-block-size: 100%;
  overflow: hidden;
}

.xh-component-card__placeholder {
  --xh-demo-block-inline-size: var(--xh-space-8);
  --xh-demo-block-block-size: var(--xh-space-6);
  --xh-demo-block-radius: var(--xh-shape-control);
}

.vp-doc .xh-component-card__link {
  display: inline-flex;
  gap: var(--xh-space-1_5);
  align-items: baseline;
  padding-top: var(--xh-space-2_5);
  color: var(--xh-fg-default);
  text-decoration: none;
}

.xh-component-card__link:hover strong {
  color: var(--xh-fg-brand-strong);
}

.xh-component-card__link strong {
  font-size: var(--xh-text-label-size);
  font-weight: var(--xh-font-weight-semibold);
  transition: color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter);
}

.xh-component-card__link span {
  color: var(--xh-fg-muted);
  font-size: var(--xh-control-font-sm);
}

.xh-component-card__link .xh-component-card__status {
  display: inline-flex;
  align-items: center;
  padding-inline: 0.5em;
  border-radius: var(--xh-shape-pill);
  background: var(--xh-bg-brand-subtle);
  color: var(--xh-fg-brand-strong);
  font-size: var(--xh-font-size-xs);
  font-weight: var(--xh-font-weight-semibold);
  line-height: 1.6;
}

.xh-component-card__link .xh-component-card__status--alpha {
  color: var(--xh-fg-subtle);
  background: var(--xh-bg-subtle);
  font-weight: var(--xh-font-weight-medium);
}

@media (max-width: 640px) {
  .xh-component-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--xh-space-4) var(--xh-space-3);
  }

  .xh-component-card__preview {
    --xh-doc-catalog-h: 124px;

    block-size: 148px;
  }
}
</style>
