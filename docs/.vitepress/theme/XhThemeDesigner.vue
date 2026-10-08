<script setup lang="ts">
import type { BrandScale, BrandStep } from "@xihan-ui/tokens/runtime";
import { tokens } from "@xihan-ui/tokens";
import { brandScaleCss, contrastRatio, deriveBrandScale, registerBrand } from "@xihan-ui/tokens/runtime";
import {
  XhButton,
  XhColorPickerAreaThumb,
  XhColorPickerContent,
  XhColorPickerControl,
  XhColorPickerHueSlider,
  XhColorPickerLabel,
  XhColorPickerPositioner,
  XhColorPickerRoot,
  XhColorPickerSaturationArea,
  XhColorPickerSwatch,
  XhColorPickerSwatchPicker,
  XhColorPickerTrigger,
  XhColorPickerValueText,
  XhRadioGroupRoot,
} from "@xihan-ui/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import XhThemePreview from "./XhThemePreview.vue";

type Mode = "light" | "dark";
type Density = "comfortable" | "compact";
type Contrast = "default" | "more";
type Radius = "tight" | "default" | "round";

interface DesignerState {
  seed: string;
  mode: Mode;
  density: Density;
  contrast: Contrast;
  radius: Radius;
}

interface Preset extends DesignerState {
  id: string;
  name: string;
}

const STORAGE_KEY = "xh-theme-designer";
const PREVIEW_BRAND = "theme-designer";
const EXPORT_BRAND = "custom";
const STEPS: BrandStep[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const KEYS: (keyof DesignerState)[] = ["seed", "mode", "density", "contrast", "radius"];

/** 基础一组只换明暗、密度与对比度，风格一组换品牌色与圆角；第一项是组件库的基线主题 */
const presetGroups: { label: string; presets: Preset[] }[] = [
  {
    label: "基础",
    presets: [
      { id: "default", name: "默认", seed: "#0067ea", mode: "light", density: "comfortable", contrast: "default", radius: "default" },
      { id: "dark", name: "暗黑", seed: "#0067ea", mode: "dark", density: "comfortable", contrast: "default", radius: "default" },
      { id: "compact", name: "紧凑", seed: "#0067ea", mode: "light", density: "compact", contrast: "default", radius: "default" },
      { id: "contrast", name: "高对比", seed: "#0067ea", mode: "light", density: "comfortable", contrast: "more", radius: "default" },
      { id: "dark-compact", name: "暗黑紧凑", seed: "#0067ea", mode: "dark", density: "compact", contrast: "default", radius: "default" },
      { id: "dark-contrast", name: "暗黑高对比", seed: "#0067ea", mode: "dark", density: "comfortable", contrast: "more", radius: "default" },
    ],
  },
  {
    label: "风格",
    presets: [
      { id: "slate", name: "墨石", seed: "#475569", mode: "light", density: "compact", contrast: "default", radius: "tight" },
      { id: "ink", name: "素墨", seed: "#18181b", mode: "light", density: "comfortable", contrast: "default", radius: "tight" },
      { id: "sky", name: "天青", seed: "#0284c7", mode: "light", density: "comfortable", contrast: "default", radius: "round" },
      { id: "turquoise", name: "松石", seed: "#0891b2", mode: "light", density: "compact", contrast: "default", radius: "default" },
      { id: "jade", name: "青翠", seed: "#059669", mode: "light", density: "comfortable", contrast: "default", radius: "round" },
      { id: "bamboo", name: "竹青", seed: "#65a30d", mode: "light", density: "comfortable", contrast: "default", radius: "default" },
      { id: "amber", name: "琥珀", seed: "#d97706", mode: "light", density: "comfortable", contrast: "default", radius: "round" },
      { id: "sunset", name: "落日", seed: "#ea580c", mode: "light", density: "comfortable", contrast: "default", radius: "default" },
      { id: "rose", name: "胭脂", seed: "#e11d48", mode: "light", density: "comfortable", contrast: "default", radius: "round" },
      { id: "sakura", name: "樱粉", seed: "#db2777", mode: "light", density: "comfortable", contrast: "default", radius: "default" },
      { id: "wisteria", name: "紫藤", seed: "#c026d3", mode: "light", density: "compact", contrast: "default", radius: "round" },
      { id: "violet", name: "暮紫", seed: "#7c3aed", mode: "light", density: "comfortable", contrast: "default", radius: "round" },
      { id: "starry", name: "星夜", seed: "#6366f1", mode: "dark", density: "comfortable", contrast: "default", radius: "round" },
      { id: "ocean", name: "深海", seed: "#0d9488", mode: "dark", density: "comfortable", contrast: "default", radius: "default" },
      { id: "gilded", name: "鎏金", seed: "#ca8a04", mode: "dark", density: "comfortable", contrast: "default", radius: "tight" },
    ],
  },
];
const presets = presetGroups.flatMap(group => group.presets);
const baseline = presets[0];

const swatches = [...new Set(presets.map(preset => preset.seed))];

/** 原始圆角阶梯：sm 给控件与内层，md 给表面，lg 给浮层 */
const radiusScales: Record<Radius, { sm: number; md: number; lg: number }> = {
  tight: { sm: 2, md: 4, lg: 8 },
  default: { sm: 4, md: 8, lg: 12 },
  round: { sm: 8, md: 12, lg: 16 },
};

const seed = ref<string[]>([baseline.seed]);
const mode = ref<string | null>(baseline.mode);
const density = ref<string | null>(baseline.density);
const contrast = ref<string | null>(baseline.contrast);
const radius = ref<string | null>(baseline.radius);

/** 工具条上的四组分段设置 */
const settings = [
  { label: "明暗", model: mode, options: [{ value: "light", label: "浅色" }, { value: "dark", label: "深色" }] },
  { label: "密度", model: density, options: [{ value: "comfortable", label: "宽松" }, { value: "compact", label: "紧凑" }] },
  { label: "对比度", model: contrast, options: [{ value: "default", label: "常规" }, { value: "more", label: "高对比" }] },
  { label: "圆角", model: radius, options: [{ value: "tight", label: "方正" }, { value: "default", label: "默认" }, { value: "round", label: "圆润" }] },
];

const state = computed<DesignerState>(() => ({
  seed: seed.value[0] ?? baseline.seed,
  mode: (mode.value ?? baseline.mode) as Mode,
  density: (density.value ?? baseline.density) as Density,
  contrast: (contrast.value ?? baseline.contrast) as Contrast,
  radius: (radius.value ?? baseline.radius) as Radius,
}));

/** 与当前设置完全一致的预设 */
const activePreset = computed(() =>
  presets.find(preset => KEYS.every(key => preset[key].toLowerCase() === state.value[key].toLowerCase()))?.id ?? null,
);

function apply(next: DesignerState): void {
  seed.value = [next.seed];
  mode.value = next.mode;
  density.value = next.density;
  contrast.value = next.contrast;
  radius.value = next.radius;
}

/** 种子色派生的整套品牌色；种子无法解析时退回基线 */
const scale = computed<BrandScale>(() => {
  try {
    return deriveBrandScale(state.value.seed);
  }
  catch {
    return deriveBrandScale(baseline.seed);
  }
});

/** 品牌实心面上白字的对比度 */
const onBrandContrast = computed(() => contrastRatio("#ffffff", scale.value["600"]).toFixed(1));

/** 引用圆角原语的形状令牌 */
const shapeTokens = Object.entries(tokens).filter(([name, value]) => name.startsWith("--xh-shape-") && value.includes("--xh-radius-"));

function radiusBlock(selector: string, value: Radius, withShapes = false): string {
  const r = radiusScales[value];
  const lines = [`--xh-radius-sm: ${r.sm}px;`, `--xh-radius-md: ${r.md}px;`, `--xh-radius-lg: ${r.lg}px;`];
  if (withShapes)
    lines.push(...shapeTokens.map(([name, ref]) => `${name}: ${ref};`));
  return `${selector} {\n${lines.map(line => `  ${line}`).join("\n")}\n}`;
}

const cssCode = computed(() => {
  const blocks = [`/* 品牌色：根元素写 data-brand="${EXPORT_BRAND}" 即生效 */\n${brandScaleCss(EXPORT_BRAND, state.value.seed)}`];
  if (state.value.radius !== "default")
    blocks.push(`/* 圆角阶梯 */\n${radiusBlock(":root", state.value.radius)}`);
  return blocks.join("\n\n");
});

const tsCode = computed(() => `import {
  brandId,
  createVisualEnvironmentController,
  registerBrand,
} from "@xihan-ui/tokens/runtime";

registerBrand("${EXPORT_BRAND}", "${state.value.seed}");

const visual = createVisualEnvironmentController({
  root: document.documentElement,
  initial: {
    // 预览用的是${state.value.mode === "dark" ? "深色" : "浅色"}；跟随系统写 "system"
    mode: "${state.value.mode}",
    brand: brandId("${EXPORT_BRAND}"),
    density: "${state.value.density}",
    contrast: "${state.value.contrast}",
  },
});`);

const copied = ref<"css" | "ts" | null>(null);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

async function copy(kind: "css" | "ts"): Promise<void> {
  try {
    await navigator.clipboard.writeText(kind === "css" ? cssCode.value : tsCode.value);
    copied.value = kind;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = null), 1600);
  }
  catch {}
}

let unregisterBrand: (() => void) | undefined;
let radiusStyle: HTMLStyleElement | undefined;

/** 预览品牌色注册成 [data-brand] 取值块，预览区与它弹出的浮层都认这个属性 */
function applyBrand(): void {
  unregisterBrand?.();
  try {
    unregisterBrand = registerBrand(PREVIEW_BRAND, state.value.seed);
  }
  catch {
    unregisterBrand = registerBrand(PREVIEW_BRAND, baseline.seed);
  }
}

/**
 * 预览圆角挂在同一个品牌选择器上，随品牌属性一起桥接到浮层；
 * 紧凑密度的作用域不重算形状令牌，这里随原语一起重声明
 */
function applyRadius(): void {
  if (!radiusStyle) {
    radiusStyle = document.createElement("style");
    radiusStyle.dataset.xhThemeDesigner = "";
    document.head.appendChild(radiusStyle);
  }
  radiusStyle.textContent = radiusBlock(`[data-brand='${PREVIEW_BRAND}']`, state.value.radius, true);
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DesignerState> | null;
    if (saved)
      apply({ ...baseline, ...saved });
  }
  catch {}
  applyBrand();
  applyRadius();
  watch(() => state.value.seed, applyBrand);
  watch(() => state.value.radius, applyRadius);
  watch(state, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
    catch {}
  });
});

onBeforeUnmount(() => {
  unregisterBrand?.();
  radiusStyle?.remove();
  clearTimeout(copiedTimer);
});
</script>

<template>
  <div class="xh-designer">
    <div class="xh-designer__presets">
      <div
        v-for="group in presetGroups"
        :key="group.label"
        class="xh-designer__preset-group"
        role="group"
        :aria-label="`${group.label}预设`"
      >
        <span class="xh-designer__label" aria-hidden="true">{{ group.label }}</span>
        <div class="xh-designer__preset-list">
          <button
            v-for="preset in group.presets"
            :key="preset.id"
            class="xh-designer__preset"
            type="button"
            :aria-pressed="activePreset === preset.id"
            @click="apply(preset)"
          >
            <span
              class="xh-designer__preset-dot"
              :data-mode="preset.mode"
              :style="{ background: preset.seed }"
              aria-hidden="true"
            />
            {{ preset.name }}
          </button>
        </div>
      </div>
    </div>

    <section class="xh-designer__toolbar" aria-label="主题设置">
      <div class="xh-designer__brand">
        <XhColorPickerRoot v-model:value="seed" :swatches="swatches" size="sm">
          <XhColorPickerLabel>品牌色</XhColorPickerLabel>
          <XhColorPickerControl>
            <XhColorPickerTrigger>
              <XhColorPickerSwatch />
              <XhColorPickerValueText />
            </XhColorPickerTrigger>
          </XhColorPickerControl>
          <XhColorPickerPositioner>
            <XhColorPickerContent>
              <XhColorPickerSaturationArea>
                <XhColorPickerAreaThumb />
              </XhColorPickerSaturationArea>
              <XhColorPickerHueSlider />
              <XhColorPickerSwatchPicker />
            </XhColorPickerContent>
          </XhColorPickerPositioner>
        </XhColorPickerRoot>
        <div
          class="xh-designer__scale"
          role="img"
          :aria-label="`派生出的品牌色阶，600 档上白字对比度 ${onBrandContrast}:1`"
          :title="`600 档上白字对比度 ${onBrandContrast}:1`"
        >
          <span v-for="step in STEPS" :key="step" :style="{ background: scale[step] }" />
        </div>
      </div>

      <div v-for="setting in settings" :key="setting.label" class="xh-designer__setting">
        <!-- 分段形态的 label 只作可及名，这里补一行可见标题 -->
        <span class="xh-designer__label" aria-hidden="true">{{ setting.label }}</span>
        <XhRadioGroupRoot
          v-model:value="setting.model.value"
          variant="segmented"
          :collection="setting.options"
          :label="setting.label"
          size="sm"
        />
      </div>

      <XhButton
        class="xh-designer__reset"
        variant="outline"
        tone="neutral"
        size="sm"
        :disabled="activePreset === baseline.id"
        @click="apply(baseline)"
      >
        恢复默认
      </XhButton>
    </section>

    <XhThemePreview
      :brand="PREVIEW_BRAND"
      :mode="state.mode"
      :density="state.density"
      :contrast="state.contrast"
    />

    <div class="xh-designer__exports">
      <section class="xh-designer__export" aria-label="CSS">
        <header class="xh-designer__export-head">
          <span>CSS：品牌色与圆角</span>
          <XhButton variant="ghost" tone="neutral" size="sm" @click="copy('css')">
            {{ copied === "css" ? "已复制" : "复制" }}
          </XhButton>
        </header>
        <pre class="xh-designer__code"><code>{{ cssCode }}</code></pre>
      </section>
      <section class="xh-designer__export" aria-label="接入代码">
        <header class="xh-designer__export-head">
          <span>TypeScript：注册品牌并提交视觉环境</span>
          <XhButton variant="ghost" tone="neutral" size="sm" @click="copy('ts')">
            {{ copied === "ts" ? "已复制" : "复制" }}
          </XhButton>
        </header>
        <pre class="xh-designer__code"><code>{{ tsCode }}</code></pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.xh-designer {
  display: grid;
  gap: var(--xh-space-4);
  margin-block: var(--xh-space-6);
}

.xh-designer__presets {
  display: grid;
  gap: var(--xh-space-3);
}

/* 组名在左、预设在右；窄屏组名落到上一行 */
.xh-designer__preset-group {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: var(--xh-space-2) var(--xh-space-4);
}

.xh-designer__preset-group > .xh-designer__label {
  padding-block-start: var(--xh-space-1);
}

@media (max-width: 767px) {
  .xh-designer__preset-group {
    grid-template-columns: minmax(0, 1fr);
  }

  .xh-designer__preset-group > .xh-designer__label {
    padding-block-start: 0;
  }
}

.xh-designer__preset-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--xh-space-2);
}

.xh-designer__preset {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-2);
  min-block-size: var(--xh-control-h-sm);
  padding-inline: var(--xh-space-3);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-control);
  color: var(--xh-fg-default);
  background: var(--xh-bg-surface);
  font-size: var(--xh-font-size-sm);
  cursor: pointer;
  transition:
    border-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    background-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter);
}

.xh-designer__preset:hover {
  background: var(--xh-bg-subtle);
}

.xh-designer__preset[aria-pressed="true"] {
  border-color: var(--xh-fg-brand);
  color: var(--xh-fg-brand);
  background: var(--xh-bg-brand-subtle);
}

.xh-designer__preset:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}

/* 圆点是种子色，外圈表示这套预设的明暗 */
.xh-designer__preset-dot {
  inline-size: var(--xh-space-4);
  block-size: var(--xh-space-4);
  border: var(--xh-stroke-thick) solid var(--xh-color-neutral-50);
  border-radius: var(--xh-shape-circle);
  outline: var(--xh-stroke-thin) solid var(--xh-border-default);
}

.xh-designer__preset-dot[data-mode="dark"] {
  border-color: var(--xh-color-neutral-900);
}

.xh-designer__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--xh-space-4) var(--xh-space-6);
  padding: var(--xh-space-4);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-surface);
}

.xh-designer__brand {
  display: grid;
  gap: var(--xh-space-2);
}

.xh-designer__scale {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  overflow: hidden;
  border-radius: var(--xh-shape-control);
  block-size: var(--xh-space-2);
}

.xh-designer__setting {
  display: grid;
  gap: var(--xh-space-1);
  justify-items: start;
}

.xh-designer__label {
  color: var(--xh-fg-default);
  font-size: var(--xh-text-label-size);
  font-weight: var(--xh-text-label-weight);
  line-height: 20px;
}

.xh-designer__reset {
  margin-inline-start: auto;
}

.xh-designer__exports {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--xh-space-4);
}

.xh-designer__export {
  min-width: 0;
  overflow: hidden;
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--vp-code-block-bg);
}

.xh-designer__export-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--xh-space-1) var(--xh-space-2) var(--xh-space-1) var(--xh-space-4);
  border-bottom: var(--xh-stroke-thin) solid var(--xh-border-subtle);
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-xs);
}

.xh-designer__code {
  margin: 0;
  padding: var(--xh-space-4);
  overflow-x: auto;
  color: var(--vp-c-text-1);
  font-family: var(--xh-font-family-mono);
  font-size: var(--xh-font-size-xs);
  line-height: 20px;
}
</style>
