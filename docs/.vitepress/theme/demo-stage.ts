import type { Ref } from "vue";
import { computed, ref } from "vue";

/** 主题轴多一档「跟随站点」：舞台跟着 VitePress 的深浅走，不自己钉死。 */
export type StageTheme = "site" | "light" | "dark";
export type StageDensity = "comfortable" | "compact";
export type StageContrast = "base" | "more";
export type StageDirection = "ltr" | "rtl";

export const stageTheme = ref<StageTheme>("site");
export const stageDensity = ref<StageDensity>("comfortable");
export const stageContrast = ref<StageContrast>("base");
export const stageDirection = ref<StageDirection>("ltr");

export interface StageAxis {
  /** 存储键与选择器的标识。 */
  id: string;
  /** 控件的可见标签。 */
  label: string;
  value: Ref<string>;
  /** 复位到哪一档。 */
  initial: string;
  options: readonly { value: string; label: string }[];
}

/** 工具条列出的轴。每条对应令牌层已有的一个档位属性，这里只负责把它暴露给读者切换。 */
export const stageAxes: readonly StageAxis[] = [
  {
    id: "theme",
    label: "主题",
    value: stageTheme as Ref<string>,
    initial: "site",
    options: [
      { value: "site", label: "跟随站点" },
      { value: "light", label: "浅色" },
      { value: "dark", label: "深色" },
    ],
  },
  {
    id: "density",
    label: "密度",
    value: stageDensity as Ref<string>,
    initial: "comfortable",
    options: [
      { value: "comfortable", label: "宽松" },
      { value: "compact", label: "紧凑" },
    ],
  },
  {
    id: "contrast",
    label: "对比度",
    value: stageContrast as Ref<string>,
    initial: "base",
    options: [
      { value: "base", label: "基线" },
      { value: "more", label: "高对比" },
    ],
  },
  {
    id: "direction",
    label: "方向",
    value: stageDirection as Ref<string>,
    initial: "ltr",
    options: [
      { value: "ltr", label: "从左到右" },
      { value: "rtl", label: "从右到左" },
    ],
  },
];

/** 四个轴是否都停在初始档。 */
export const stageIsInitial = computed(() =>
  stageAxes.every(axis => axis.value.value === axis.initial),
);

const STORAGE_KEY = "xh-demo-stage";

function persist(): void {
  const state: Record<string, string> = {};
  for (const axis of stageAxes) state[axis.id] = axis.value.value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function setStageAxis(axis: StageAxis, value: string): void {
  if (!axis.options.some(option => option.value === value))
    return;
  axis.value.value = value;
  persist();
}

/** 全部轴回到初始档。 */
export function resetDemoStage(): void {
  for (const axis of stageAxes) axis.value.value = axis.initial;
  persist();
}

let restored = false;

// 预渲染读不到 localStorage，首屏一律用初始档，挂载后再校正。舞台有很多份，只校正一次
export function restoreDemoStage(): void {
  if (restored)
    return;
  restored = true;
  let saved: unknown;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  }
  catch {
    return;
  }
  if (saved === null || typeof saved !== "object")
    return;
  for (const axis of stageAxes) {
    const value = (saved as Record<string, unknown>)[axis.id];
    if (typeof value === "string" && axis.options.some(option => option.value === value)) {
      axis.value.value = value;
    }
  }
}

/**
 * 舞台上要打的属性。
 *
 * `data-theme` 无论选哪一档都写：高对比档的深色取值块选择器是
 * `[data-theme='dark'][data-contrast='more']`，两个属性不落在同一个元素上就选不中。
 */
export function stageAttrs(siteDark: boolean): Record<string, string> {
  return {
    "data-theme":
      stageTheme.value === "site" ? (siteDark ? "dark" : "light") : stageTheme.value,
    "data-density": stageDensity.value,
    "data-contrast": stageContrast.value,
    "dir": stageDirection.value,
  };
}
