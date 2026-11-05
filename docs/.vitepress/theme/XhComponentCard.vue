<script setup lang="ts">
import type { Component } from "vue";
import { useData, withBase } from "vitepress";
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
// 英文区（/en/）的卡片状态用英文
const { lang } = useData();
const preview = load
  ? defineAsyncComponent({ loader: load, hydrate: hydrateOnVisible({ rootMargin: "160px" }) })
  : undefined;
</script>

<template>
  <article class="xh-component-card">
    <a class="xh-component-card__link" :href="withBase(href)">
      <strong>{{ name }}</strong>
      <span>{{ label }}</span>
      <span
        v-if="status"
        class="xh-component-card__status"
        :class="`xh-component-card__status--${status}`"
      >{{ status === "updated" && !lang.startsWith("en") ? "更新" : status }}</span>
    </a>
    <div class="xh-component-card__preview">
      <component :is="preview" v-if="preview" />
    </div>
  </article>
</template>

<style>
.xh-component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--xh-space-6) var(--xh-space-4);
  margin: var(--xh-space-5) 0 var(--xh-space-8);
}

/*
 * 分类定色：每个分类取一个分类色槽作色相，同一分类的卡片同色。色相只在这张表里决定，
 * 示意图文件不写色相。图表分类只有家具取色相，数据标记仍取自己的数据色。
 */
.xh-component-grid {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-1);
}

.xh-component-grid[data-category="layout"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-8);
}

.xh-component-grid[data-category="navigation"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-7);
}

.xh-component-grid[data-category="form"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-5);
}

.xh-component-grid[data-category="data-display"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-6);
}

.xh-component-grid[data-category="feedback"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-2);
}

.xh-component-grid[data-category="overlay"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-3);
}

.xh-component-grid[data-category="ai"] {
  --xh-doc-catalog-hue: var(--xh-chart-categorical-4);
}

.xh-component-card {
  /* 淡彩域要重写同名语义令牌，重写前的取值先在卡片上存一份，否则就是自引用 */
  --xh-doc-catalog-base: var(--xh-bg-canvas);
  --xh-doc-catalog-surface: var(--xh-bg-surface);
  --xh-doc-catalog-raised: var(--xh-bg-surface-raised);
  --xh-doc-catalog-danger: var(--xh-fg-danger);
  --xh-doc-catalog-warning: var(--xh-fg-warning);
  --xh-doc-catalog-success: var(--xh-fg-success);
  --xh-doc-catalog-syntax-string: var(--xh-syntax-string);
  --xh-doc-catalog-syntax-number: var(--xh-syntax-number);
  --xh-doc-catalog-syntax-keyword: var(--xh-syntax-keyword);

  /* 标题折行时同一行的预览面仍对齐：标题贴顶，预览面贴底 */
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/*
 * 预览卡是描边面，不是 Card：边界只由描边承担，底取淡彩、无影。
 * 卡里只放一张 240 × 160 画布的示意图（docs/.vitepress/catalog/*.vue），宽窄都铺满内容区、
 * 按比例缩放；--xh-doc-catalog-canvas-h 是画布在卡里的高，宽屏下与画布 1:1。
 */
.xh-component-card__preview {
  --xh-doc-catalog-canvas-h: 160px;

  display: grid;
  block-size: calc(var(--xh-doc-catalog-canvas-h) + 2 * var(--xh-space-3) + 2 * var(--xh-stroke-thin));
  margin-block-start: auto;
  padding: var(--xh-space-3);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-page);
  box-shadow: none;
}

/*
 * 淡彩域：示意图只按角色写语义令牌，这里把这些令牌重写成分类色相的一条曲线，示意图文件
 * 不各想配色，亮暗两档跟着色槽与 canvas 走。名单由 check-catalog-preview 核对：示意图用到的
 * 中性与品牌令牌都要在这里重写，漏一支就会漏出灰色。要更高对比的用户不进这个域，
 * 示意图退回原本的语义令牌。
 */
@media not all and (prefers-contrast: more) {
  .xh-component-card__preview {
    /* 墨：往底里兑的不透明四档，给文字条、字形、描边与色阶 */
    --xh-doc-catalog-ink-1: color-mix(in oklab, var(--xh-doc-catalog-hue) 84%, var(--xh-doc-catalog-base));
    --xh-doc-catalog-ink-2: color-mix(in oklab, var(--xh-doc-catalog-hue) 62%, var(--xh-doc-catalog-base));
    --xh-doc-catalog-ink-3: color-mix(in oklab, var(--xh-doc-catalog-hue) 46%, var(--xh-doc-catalog-base));
    --xh-doc-catalog-ink-4: color-mix(in oklab, var(--xh-doc-catalog-hue) 32%, var(--xh-doc-catalog-base));

    /* 面 */
    --xh-bg-page: color-mix(in oklab, var(--xh-doc-catalog-hue) 10%, var(--xh-doc-catalog-base));
    --xh-bg-surface: color-mix(in oklab, var(--xh-doc-catalog-hue) 2%, var(--xh-doc-catalog-surface));
    --xh-bg-surface-raised: color-mix(in oklab, var(--xh-doc-catalog-hue) 2%, var(--xh-doc-catalog-raised));
    --xh-bg-field: var(--xh-bg-surface);
    --xh-bg-field-invalid: color-mix(in oklab, var(--xh-doc-catalog-danger) 8%, var(--xh-bg-surface));
    --xh-bg-subtle: color-mix(in oklab, var(--xh-doc-catalog-hue) 14%, transparent);
    --xh-bg-subtle-hover: color-mix(in oklab, var(--xh-doc-catalog-hue) 24%, transparent);
    --xh-bg-subtle-active: color-mix(in oklab, var(--xh-doc-catalog-hue) 36%, transparent);
    --xh-bg-subtle-hover-opaque: color-mix(in oklab, var(--xh-doc-catalog-hue) 24%, var(--xh-doc-catalog-base));
    --xh-bg-subtle-active-opaque: color-mix(in oklab, var(--xh-doc-catalog-hue) 36%, var(--xh-doc-catalog-base));
    --xh-bg-overlay: color-mix(in oklab, var(--xh-doc-catalog-hue) 36%, transparent);
    --xh-bg-media-chrome: var(--xh-doc-catalog-hue);
    --xh-bg-brand: var(--xh-doc-catalog-hue);
    --xh-bg-brand-subtle: color-mix(in oklab, var(--xh-doc-catalog-hue) 28%, var(--xh-bg-surface));

    /* 文字条与字形 */
    --xh-fg-default: var(--xh-doc-catalog-ink-1);
    --xh-fg-muted: var(--xh-doc-catalog-ink-2);
    --xh-fg-subtle: var(--xh-doc-catalog-ink-3);
    --xh-fg-disabled: var(--xh-doc-catalog-ink-4);
    --xh-fg-brand: var(--xh-doc-catalog-hue);
    --xh-fg-brand-strong: var(--xh-doc-catalog-hue);
    --xh-fg-on-brand-subtle: var(--xh-doc-catalog-hue);
    --xh-fg-on-media-chrome: var(--xh-fg-on-brand);
    --xh-fg-scrollbar-thumb-hover: var(--xh-doc-catalog-ink-2);
    --xh-fg-danger: color-mix(in oklab, var(--xh-doc-catalog-danger) 60%, var(--xh-doc-catalog-base));
    --xh-fg-warning: color-mix(in oklab, var(--xh-doc-catalog-warning) 60%, var(--xh-doc-catalog-base));
    --xh-fg-success: color-mix(in oklab, var(--xh-doc-catalog-success) 60%, var(--xh-doc-catalog-base));
    --xh-syntax-string: color-mix(in oklab, var(--xh-doc-catalog-syntax-string) 60%, var(--xh-doc-catalog-base));
    --xh-syntax-number: color-mix(in oklab, var(--xh-doc-catalog-syntax-number) 60%, var(--xh-doc-catalog-base));
    --xh-syntax-keyword: color-mix(in oklab, var(--xh-doc-catalog-syntax-keyword) 60%, var(--xh-doc-catalog-base));

    /* 描边 */
    --xh-border-subtle: var(--xh-doc-catalog-ink-4);
    --xh-border-default: var(--xh-doc-catalog-ink-3);
    --xh-border-control: var(--xh-doc-catalog-ink-2);
    --xh-border-strong: var(--xh-doc-catalog-ink-1);
    --xh-border-control-focus: var(--xh-doc-catalog-hue);
    --xh-border-invalid: color-mix(in oklab, var(--xh-doc-catalog-danger) 60%, var(--xh-doc-catalog-base));

    /* 图表家具引用上面这些角色，令牌层算好的是外层的值，这里按重写后的角色再取一遍 */
    --xh-chart-label: var(--xh-fg-muted);
    --xh-chart-surface: var(--xh-bg-surface);
    --xh-chart-grid: var(--xh-border-subtle);
    --xh-chart-axis: var(--xh-border-default);

    /* 有序与顺序色阶令牌层取品牌深档，这里换成同一条曲线 */
    --xh-chart-ordinal-1: var(--xh-doc-catalog-hue);
    --xh-chart-ordinal-2: var(--xh-doc-catalog-ink-1);
    --xh-chart-ordinal-3: var(--xh-doc-catalog-ink-2);
    --xh-chart-ordinal-4: var(--xh-doc-catalog-ink-3);
    --xh-chart-sequential-start: var(--xh-bg-subtle-hover-opaque);
    --xh-chart-sequential-mid: var(--xh-doc-catalog-ink-2);
    --xh-chart-sequential-end: var(--xh-doc-catalog-hue);

    /* 色块上的字条跟实心面同一副：数据色在这里是浅色调，墨字太重 */
    --xh-chart-on-categorical-1: var(--xh-fg-on-brand);
    --xh-chart-on-categorical-2: var(--xh-fg-on-brand);
    --xh-chart-on-categorical-3: var(--xh-fg-on-brand);
    --xh-chart-on-categorical-4: var(--xh-fg-on-brand);
    --xh-chart-on-categorical-5: var(--xh-fg-on-brand);
  }

  /* 语气示意同样落到淡彩：语气色往底里兑一段，淡底与淡边沿用语气轴的曲线 */
  .xh-component-card__preview [data-tone] {
    --xh-tone-solid: color-mix(in oklab, var(--xh-_tone) 60%, var(--xh-doc-catalog-base));
    --xh-tone-fg: color-mix(in oklab, var(--xh-_tone) 60%, var(--xh-doc-catalog-base));
    --xh-tone-on: var(--xh-fg-on-brand);
  }
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

/* 比主题的 .dark .vp-doc a 高一档：标题是正文色，不随暗色换成链接色 */
.vp-doc .xh-component-card > .xh-component-card__link {
  display: inline-flex;
  flex-wrap: wrap;
  align-self: flex-start;
  gap: var(--xh-space-1_5);
  align-items: baseline;
  padding-bottom: var(--xh-space-2);
  color: var(--xh-fg-default);
  text-decoration: none;
}

.xh-component-card__link:hover strong {
  color: var(--xh-fg-brand-strong);
}

.xh-component-card__link strong {
  font-size: var(--xh-text-heading-3-size);
  font-weight: var(--xh-font-weight-bold);
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
