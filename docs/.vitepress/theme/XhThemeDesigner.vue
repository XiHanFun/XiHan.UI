<script setup lang="ts">
import type { BrandScale, BrandStep } from "@xihan-ui/tokens/runtime";
import { brandScaleCss, contrastRatio, deriveBrandScale, registerBrand } from "@xihan-ui/tokens/runtime";
import {
  XhAlertContent,
  XhAlertDescription,
  XhAlertRoot,
  XhAlertTitle,
  XhBadge,
  XhButton,
  XhCardContent,
  XhCardDescription,
  XhCardHeader,
  XhCardRoot,
  XhCardTitle,
  XhCheckbox,
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
  XhProgress,
  XhRadioGroupRoot,
  XhSliderControl,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSwitch,
  XhTabsContent,
  XhTabsIndicator,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

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

const STORAGE_KEY = "xh-theme-designer";
const PREVIEW_BRAND = "theme-designer";
const EXPORT_BRAND = "custom";
const STEPS: BrandStep[] = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

/** 第一项是组件库的基线品牌色 */
const presets = ["#0067ea", "#7c3aed", "#0d9488", "#059669", "#ea580c", "#e11d48", "#475569"];

/** 原始圆角阶梯：sm 给控件与内层，md 给表面，lg 给浮层 */
const radiusScales: Record<Radius, { sm: number; md: number; lg: number }> = {
  tight: { sm: 2, md: 4, lg: 8 },
  default: { sm: 4, md: 8, lg: 12 },
  round: { sm: 8, md: 12, lg: 16 },
};

const modeOptions = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
];
const densityOptions = [
  { value: "comfortable", label: "宽松" },
  { value: "compact", label: "紧凑" },
];
const contrastOptions = [
  { value: "default", label: "常规" },
  { value: "more", label: "高对比" },
];
const radiusOptions = [
  { value: "tight", label: "方正" },
  { value: "default", label: "默认" },
  { value: "round", label: "圆润" },
];
const periodOptions = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

const initial: DesignerState = {
  seed: presets[0],
  mode: "light",
  density: "comfortable",
  contrast: "default",
  radius: "default",
};

const seed = ref<string[]>([initial.seed]);
const mode = ref<string | null>(initial.mode);
const density = ref<string | null>(initial.density);
const contrast = ref<string | null>(initial.contrast);
const radius = ref<string | null>(initial.radius);

/** 左侧的四组分段设置 */
const settings = [
  { label: "明暗", model: mode, options: modeOptions },
  { label: "密度", model: density, options: densityOptions },
  { label: "对比度", model: contrast, options: contrastOptions },
  { label: "圆角", model: radius, options: radiusOptions },
];

const state = computed<DesignerState>(() => ({
  seed: seed.value[0] ?? initial.seed,
  mode: (mode.value ?? initial.mode) as Mode,
  density: (density.value ?? initial.density) as Density,
  contrast: (contrast.value ?? initial.contrast) as Contrast,
  radius: (radius.value ?? initial.radius) as Radius,
}));

const isInitial = computed(() =>
  (Object.keys(initial) as (keyof DesignerState)[]).every(key => state.value[key] === initial[key]),
);

/** 种子色派生的整套品牌色；种子无法解析时退回基线 */
const scale = computed<BrandScale>(() => {
  try {
    return deriveBrandScale(state.value.seed);
  }
  catch {
    return deriveBrandScale(initial.seed);
  }
});

/** 品牌实心面上白字的对比度 */
const onBrandContrast = computed(() => contrastRatio("#ffffff", scale.value["600"]));

const radiusStyle = computed(() => {
  const r = radiusScales[state.value.radius];
  return {
    "--xh-radius-sm": `${r.sm}px`,
    "--xh-radius-md": `${r.md}px`,
    "--xh-radius-lg": `${r.lg}px`,
  };
});

const cssCode = computed(() => {
  const blocks = [`/* 品牌色：根元素写 data-brand="${EXPORT_BRAND}" 即生效 */\n${brandScaleCss(EXPORT_BRAND, state.value.seed)}`];
  if (state.value.radius !== "default") {
    const r = radiusScales[state.value.radius];
    blocks.push(`/* 圆角阶梯 */\n:root {\n  --xh-radius-sm: ${r.sm}px;\n  --xh-radius-md: ${r.md}px;\n  --xh-radius-lg: ${r.lg}px;\n}`);
  }
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
    // 预览用的是 ${state.value.mode === "dark" ? "深色" : "浅色"}；跟随系统写 "system"
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

function reset(): void {
  seed.value = [initial.seed];
  mode.value = initial.mode;
  density.value = initial.density;
  contrast.value = initial.contrast;
  radius.value = initial.radius;
}

let unregister: (() => void) | undefined;

function applyBrand(): void {
  unregister?.();
  try {
    unregister = registerBrand(PREVIEW_BRAND, state.value.seed);
  }
  catch {
    unregister = registerBrand(PREVIEW_BRAND, initial.seed);
  }
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<DesignerState> | null;
    if (saved) {
      seed.value = [saved.seed ?? initial.seed];
      mode.value = saved.mode ?? initial.mode;
      density.value = saved.density ?? initial.density;
      contrast.value = saved.contrast ?? initial.contrast;
      radius.value = saved.radius ?? initial.radius;
    }
  }
  catch {}
  applyBrand();
  watch(() => state.value.seed, applyBrand);
  watch(state, (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
    catch {}
  });
});

onBeforeUnmount(() => {
  unregister?.();
  clearTimeout(copiedTimer);
});
</script>

<template>
  <div class="xh-designer">
    <div class="xh-designer__workbench">
      <section class="xh-designer__controls" aria-label="主题设置">
        <XhColorPickerRoot v-model:value="seed" :swatches="presets">
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

        <div class="xh-designer__scale" role="img" :aria-label="`派生出的品牌色阶，600 档上白字对比度 ${onBrandContrast.toFixed(1)}:1`">
          <span
            v-for="step in STEPS"
            :key="step"
            class="xh-designer__step"
            :style="{ background: scale[step] }"
            :title="`${step}  ${scale[step]}`"
          />
        </div>
        <p class="xh-designer__note">
          600 档上白字对比度 {{ onBrandContrast.toFixed(1) }}:1。只取种子的色相与彩度，明度曲线沿用基线。
        </p>

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

        <XhButton variant="outline" tone="neutral" size="sm" :disabled="isInitial" @click="reset">
          恢复默认
        </XhButton>
      </section>

      <section
        class="xh-designer__preview"
        aria-label="预览"
        :data-theme="state.mode"
        :data-brand="PREVIEW_BRAND"
        :data-density="state.density"
        :data-contrast="state.contrast"
        :style="radiusStyle"
      >
        <div class="xh-designer__row">
          <XhButton>主要操作</XhButton>
          <XhButton variant="subtle">次要操作</XhButton>
          <XhButton variant="outline">描边按钮</XhButton>
          <XhButton variant="ghost">幽灵按钮</XhButton>
          <XhButton tone="danger">删除</XhButton>
        </div>

        <div class="xh-designer__grid">
          <XhTextFieldRoot name="designer-email" type="email" placeholder="name@example.com">
            <XhTextFieldLabel>邮箱</XhTextFieldLabel>
            <XhTextFieldControl>
              <XhTextFieldInput />
            </XhTextFieldControl>
          </XhTextFieldRoot>

          <XhSliderRoot v-slot="{ value }" :default-value="[60]" :min="0" :max="100" name="designer-volume">
            <XhSliderLabel>音量：{{ value[0] }}</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb />
            </XhSliderControl>
          </XhSliderRoot>
        </div>

        <div class="xh-designer__row">
          <XhCheckbox name="designer-updates" default-checked>
            接收产品更新
          </XhCheckbox>
          <label class="xh-designer__switch">
            <XhSwitch name="designer-notify" default-checked /> 消息通知
          </label>
          <XhRadioGroupRoot variant="segmented" :collection="periodOptions" default-value="week" label="统计周期" size="sm" />
        </div>

        <XhProgress :value="64" />

        <XhTabsRoot default-value="overview">
          <XhTabsList aria-label="项目视图">
            <XhTabsTrigger value="overview">
              概览
            </XhTabsTrigger>
            <XhTabsTrigger value="members">
              成员
            </XhTabsTrigger>
            <XhTabsTrigger value="settings">
              设置
            </XhTabsTrigger>
            <XhTabsIndicator />
          </XhTabsList>
          <XhTabsContent value="overview">
            最近 7 天共有 12 次部署，全部成功。
          </XhTabsContent>
          <XhTabsContent value="members">
            当前项目有 5 位成员。
          </XhTabsContent>
          <XhTabsContent value="settings">
            在这里调整项目的通知与权限。
          </XhTabsContent>
        </XhTabsRoot>

        <div class="xh-designer__grid">
          <XhAlertRoot tone="brand">
            <XhAlertContent>
              <XhAlertTitle>新版本可用</XhAlertTitle>
              <XhAlertDescription>升级后即可使用自定义主题。</XhAlertDescription>
            </XhAlertContent>
          </XhAlertRoot>
          <XhAlertRoot tone="success">
            <XhAlertContent>
              <XhAlertTitle>部署完成</XhAlertTitle>
              <XhAlertDescription>所有检查均已通过。</XhAlertDescription>
            </XhAlertContent>
          </XhAlertRoot>
        </div>

        <XhCardRoot>
          <XhCardHeader>
            <XhCardTitle>本月账单</XhCardTitle>
            <XhCardDescription>账期 7 月 1 日至 7 月 31 日</XhCardDescription>
          </XhCardHeader>
          <XhCardContent>
            <div class="xh-designer__row">
              <span>共 128 笔支出，合计 3,240.00 元。</span>
              <XhBadge :count="3" tone="danger" label="3 条待处理">
                <XhButton variant="outline" size="sm">
                  待处理
                </XhButton>
              </XhBadge>
            </div>
          </XhCardContent>
        </XhCardRoot>
      </section>
    </div>

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

.xh-designer__workbench {
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr);
  gap: var(--xh-space-4);
  align-items: start;
}

.xh-designer__controls {
  display: grid;
  gap: var(--xh-space-4);
  padding: var(--xh-space-4);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-surface);
}

.xh-designer__scale {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  overflow: hidden;
  border-radius: var(--xh-shape-control);
  block-size: var(--xh-space-6);
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

.xh-designer__note {
  margin: calc(var(--xh-space-3) * -1) 0 0;
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-xs);
  line-height: 18px;
}

.xh-designer__preview {
  display: grid;
  gap: var(--xh-space-5);
  padding: var(--xh-space-6);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  color: var(--xh-fg-default);
  background: var(--xh-bg-canvas);
}

.xh-designer__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-3);
}

.xh-designer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--xh-space-4);
}

.xh-designer__switch {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-2);
  font-size: var(--xh-font-size-sm);
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

@media (max-width: 959px) {
  .xh-designer__workbench {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
