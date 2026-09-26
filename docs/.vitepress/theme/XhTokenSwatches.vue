<!-- 设计文档里的色板：按名字前缀从令牌产物里取一组颜色令牌，逐档画成色块。
     色块的底走 var(令牌名)，随文档站当前的明暗主题活着；块下标注档位与源值。 -->
<script setup lang="ts">
import { tokens } from "@xihan-ui/tokens";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /** 令牌名前缀，如 `--xh-color-red-`；取到的档位按声明顺序排 */
    prefix: string;
    /** 只取这些后缀（档位名）；不传即前缀下全部 */
    steps?: string[];
    /** 每块上方的标题（组名）；不传即不显示 */
    label?: string;
    /** 块内不写源值，只留档位（语义角色那种值是 var() 引用的场合） */
    compact?: boolean;
    /** 块内文字取这组令牌里同一档位的一支，如 `--xh-chart-on-categorical-`；不传按档位粗分深浅 */
    onPrefix?: string;
  }>(),
  { steps: undefined, label: undefined, compact: false, onPrefix: undefined },
);

interface Swatch {
  name: string;
  step: string;
  value: string;
}

const swatches = computed<Swatch[]>(() => {
  const all = Object.entries(tokens as Record<string, string>)
    .filter(([name]) => name.startsWith(props.prefix))
    .map(([name, value]) => ({ name, step: name.slice(props.prefix.length), value }));
  if (!props.steps)
    return all;
  const order = new Map(props.steps.map((step, index) => [step, index]));
  return all
    .filter(swatch => order.has(swatch.step))
    .sort((a, b) => order.get(a.step)! - order.get(b.step)!);
});

/** 配对的文字令牌：给了 onPrefix 且这一档有对应令牌时，块内文字取它 */
function onColor(swatch: Swatch): string | undefined {
  const name = props.onPrefix && `${props.onPrefix}${swatch.step}`;
  return name && name in (tokens as Record<string, string>) ? `var(${name})` : undefined;
}

/** 深档的标注字用浅色：按档位数字粗分，语义角色那种没有数字的按 dark / on 字样判 */
function inkOn(swatch: Swatch): "light" | "dark" {
  const step = Number(swatch.step);
  if (!Number.isNaN(step))
    return step >= 500 ? "light" : "dark";
  return /brand$|brand-hover|brand-active|overlay|default$/.test(swatch.step) ? "light" : "dark";
}
</script>

<template>
  <figure class="xh-swatches">
    <figcaption v-if="label" class="xh-swatches__label">
      {{ label }}
    </figcaption>
    <div class="xh-swatches__row" role="list">
      <div
        v-for="swatch in swatches"
        :key="swatch.name"
        class="xh-swatches__cell"
        :class="`xh-swatches__cell--${inkOn(swatch)}`"
        role="listitem"
        :style="{ background: `var(${swatch.name})`, color: onColor(swatch) }"
        :title="`${swatch.name}: ${swatch.value}`"
      >
        <span class="xh-swatches__step">{{ swatch.step }}</span>
        <span v-if="!compact" class="xh-swatches__value">{{ swatch.value }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.xh-swatches {
  margin: var(--xh-space-4) 0;
}

.xh-swatches__label {
  margin-block-end: var(--xh-space-2);
  color: var(--xh-fg-muted);
  font-size: var(--xh-text-secondary-size);
}

.xh-swatches__row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
  gap: var(--xh-space-1);
}

.xh-swatches__cell {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--xh-space-0_5);
  min-block-size: 3.5rem;
  padding: var(--xh-space-2);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-control);
  font-family: var(--xh-font-family-mono);
  font-size: var(--xh-text-caption-size);
  line-height: var(--xh-leading-tight);
}

.xh-swatches__cell--light {
  color: var(--xh-color-neutral-0);
}

.xh-swatches__cell--dark {
  color: var(--xh-color-neutral-950);
}

.xh-swatches__step {
  font-weight: var(--xh-font-weight-semibold);
}

.xh-swatches__value {
  overflow: hidden;
  opacity: 0.85;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
