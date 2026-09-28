<script setup lang="ts">
import type { Component } from "vue";
import { withBase } from "vitepress";
import { defineAsyncComponent, hydrateOnVisible } from "vue";

const props = defineProps<{
  href: string;
  label: string;
  name: string;
  renderless?: boolean;
  src: string;
  status?: "alpha" | "new" | "updated";
}>();

// 示意图是纯静态 SVG：预渲染时就写进页面，客户端滚到附近才取回并接管，首屏没有占位闪烁
const previews = import.meta.glob<{ default: Component }>("../catalog/*.vue");
const load = props.renderless ? undefined : previews[`../catalog/${props.src}.vue`];
const preview = load
  ? defineAsyncComponent({ loader: load, hydrate: hydrateOnVisible({ rootMargin: "160px" }) })
  : undefined;
</script>

<template>
  <article class="xh-component-card">
    <div class="xh-component-card__preview">
      <component :is="preview" v-if="preview" />
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
 * 预览卡是描边面，不是 Card：边界只由描边承担，底取页面色、无影。
 * 卡里只放一张 240 × 160 画布的示意图（docs/.vitepress/catalog/*.vue），宽窄都铺满内容区、
 * 按比例缩放；--xh-doc-catalog-canvas-h 是画布在卡里的高，宽屏下与画布 1:1。
 */
.xh-component-card__preview {
  --xh-doc-catalog-canvas-h: 160px;

  display: grid;
  block-size: calc(var(--xh-doc-catalog-canvas-h) + 2 * var(--xh-space-3) + 2 * var(--xh-stroke-thin));
  padding: var(--xh-space-3);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-page);
  box-shadow: none;
}

.xh-component-card__preview > svg {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

/* 示意图画的是界面布局，随书写方向镜像；方向固定的内容（图表绘图区、代码、条码）标 data-direction="fixed" */
.xh-component-card__preview:dir(rtl) > svg:not([data-direction="fixed"]) {
  transform: scaleX(-1);
}

/*
 * 强制色：示意图转成系统色线稿。有填充的形状画成 Canvas 面 + CanvasText 边，
 * 线与文字条取 CanvasText；品牌与选中取 Highlight / HighlightText，禁用取 GrayText。
 * 示意图作者只按令牌语义取色，不写强制色分支。
 */
@media (forced-colors: active) {
  .xh-component-card__preview > svg {
    forced-color-adjust: none;
  }

  .xh-component-card__preview > svg :where([fill]:not([fill="none"])) {
    fill: Canvas;
    stroke: CanvasText;
  }

  .xh-component-card__preview > svg :where([stroke]:not([stroke="none"])) {
    stroke: CanvasText;
  }

  .xh-component-card__preview > svg :is([fill*="brand"], [fill*="focus"]) {
    fill: Highlight;
    stroke: Highlight;
  }

  .xh-component-card__preview > svg :is([stroke*="brand"], [stroke*="focus"]) {
    stroke: Highlight;
  }

  .xh-component-card__preview > svg [fill*="on-brand"] {
    fill: HighlightText;
    stroke: HighlightText;
  }

  .xh-component-card__preview > svg [stroke*="on-brand"] {
    stroke: HighlightText;
  }

  .xh-component-card__preview > svg [stroke*="disabled"] {
    stroke: GrayText;
  }
}

.vp-doc .xh-component-card__link {
  display: inline-flex;
  flex-wrap: wrap;
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

@media not all and (min-width: 640px) {
  .xh-component-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--xh-space-4) var(--xh-space-3);
  }

  .xh-component-card__preview {
    --xh-doc-catalog-canvas-h: 120px;
  }
}
</style>
