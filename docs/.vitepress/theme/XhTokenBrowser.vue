<!-- 令牌浏览器：全部全局令牌与组件覆盖槽，按名字、取值或说明搜，按类别挑。
     整块是一个局部视觉环境：明暗、密度、对比度写在它自己的根上，「当前取值」与色块都在这一层实算，
     切换即重算；选「跟随系统」走纯 CSS 的 data-theme="system"，系统明暗变了也跟着重算。
     组件覆盖槽没有自己的全局取值，当前取值列给的是它缺省取自的那支令牌。 -->
<script setup lang="ts">
import componentManifest from "@xihan-ui/styles/components.tokens.json";
import { tokens } from "@xihan-ui/tokens";
import {
  XhButton,
  XhRadioGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Row {
  name: string;
  /** 源值：引用保留 var() 写法 */
  source: string;
  group: string;
  /** 组件覆盖槽：所属组件、部件与说明 */
  component?: string;
  note?: string;
  /** 取当前值时读哪一支：全局令牌读自己，覆盖槽读缺省取自的那支 */
  resolveFrom?: string;
}

interface ComponentToken {
  name: string;
  component: string;
  part: string[];
  defaultToken: string[];
  description: string;
}

/** 名字的第一段 → 类别；没登记的段落进「其他」 */
const GROUP_OF_SEGMENT: Record<string, string> = {
  color: "色彩原语",
  bg: "语义色",
  fg: "语义色",
  border: "语义色",
  ink: "语义色",
  gradient: "语义色",
  diff: "语义色",
  syntax: "语义色",
  space: "尺寸与间距",
  control: "尺寸与间距",
  field: "尺寸与间距",
  list: "尺寸与间距",
  table: "尺寸与间距",
  chip: "尺寸与间距",
  marker: "尺寸与间距",
  nav: "尺寸与间距",
  app: "尺寸与间距",
  sider: "尺寸与间距",
  dropzone: "尺寸与间距",
  viewport: "尺寸与间距",
  section: "尺寸与间距",
  stack: "尺寸与间距",
  layout: "尺寸与间距",
  track: "尺寸与间距",
  switch: "尺寸与间距",
  measure: "尺寸与间距",
  scrollbar: "尺寸与间距",
  breakpoint: "尺寸与间距",
  action: "尺寸与间距",
  font: "字体与图标",
  leading: "字体与图标",
  text: "字体与图标",
  glyph: "字体与图标",
  radius: "形状与描边",
  shape: "形状与描边",
  stroke: "形状与描边",
  ring: "形状与描边",
  shadow: "阴影、材质与层级",
  elevation: "阴影、材质与层级",
  material: "阴影、材质与层级",
  surface: "阴影、材质与层级",
  overlay: "阴影、材质与层级",
  blur: "阴影、材质与层级",
  alpha: "阴影、材质与层级",
  state: "阴影、材质与层级",
  z: "阴影、材质与层级",
  layer: "阴影、材质与层级",
  duration: "动效",
  ease: "动效",
  motion: "动效",
  chart: "图表",
};
const COMPONENT_GROUP = "组件覆盖槽";
const ALL = "全部";

const globalRows: Row[] = Object.entries(tokens as Record<string, string>).map(([name, source]) => ({
  name,
  source,
  group: GROUP_OF_SEGMENT[name.slice("--xh-".length).split("-")[0]!] ?? "其他",
  resolveFrom: name,
}));
const componentRows: Row[] = (componentManifest.tokens as ComponentToken[]).map(token => ({
  name: token.name,
  source: token.defaultToken.length ? token.defaultToken.map(name => `var(${name})`).join(" / ") : "（组件内建）",
  group: COMPONENT_GROUP,
  component: `${token.component} · ${token.part.join(" / ")}`,
  note: token.description,
  resolveFrom: token.defaultToken[0],
}));
const rows = [...globalRows, ...componentRows];

const groupOrder = [...new Set(globalRows.map(row => row.group))];
const groups = [ALL, ...groupOrder.filter(group => group !== "其他"), ...(groupOrder.includes("其他") ? ["其他"] : []), COMPONENT_GROUP];
const counts = Object.fromEntries(groups.map(group => [group, group === ALL ? rows.length : rows.filter(row => row.group === group).length]));

const query = ref("");
const group = ref<string | null>("语义色");
const mode = ref<string | null>("light");
const density = ref<string | null>("comfortable");
const contrast = ref<string | null>("default");

const settings = [
  { label: "明暗", model: mode, options: [{ value: "light", label: "浅色" }, { value: "dark", label: "深色" }, { value: "system", label: "跟随系统" }] },
  { label: "密度", model: density, options: [{ value: "comfortable", label: "宽松" }, { value: "compact", label: "紧凑" }] },
  { label: "对比度", model: contrast, options: [{ value: "default", label: "常规" }, { value: "more", label: "高对比" }] },
];

const visible = computed(() => {
  const words = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return rows.filter((row) => {
    if (group.value && group.value !== ALL && row.group !== group.value)
      return false;
    const haystack = `${row.name} ${row.source} ${row.component ?? ""} ${row.note ?? ""}`.toLowerCase();
    return words.every(word => haystack.includes(word));
  });
});

/** 局部视觉环境的根：取值在这里实算 */
const scope = ref<HTMLElement | null>(null);
const resolved = ref<Record<string, string>>({});

function isColor(value: string): boolean {
  return value !== "" && typeof CSS !== "undefined" && CSS.supports("color", value);
}

async function recompute(): Promise<void> {
  await nextTick();
  const el = scope.value;
  if (!el)
    return;
  const style = getComputedStyle(el);
  const next: Record<string, string> = {};
  for (const row of rows) {
    if (row.resolveFrom)
      next[row.resolveFrom] = style.getPropertyValue(row.resolveFrom).trim();
  }
  resolved.value = next;
}

const copied = ref<string | null>(null);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;

async function copy(name: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(`var(${name})`);
    copied.value = name;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied.value = null), 1600);
  }
  catch {}
}

let systemScheme: MediaQueryList | undefined;
function onSystemScheme(): void {
  if (mode.value === "system")
    void recompute();
}

onMounted(() => {
  void recompute();
  watch([mode, density, contrast], recompute);
  systemScheme = window.matchMedia("(prefers-color-scheme: dark)");
  systemScheme.addEventListener("change", onSystemScheme);
});

onBeforeUnmount(() => {
  systemScheme?.removeEventListener("change", onSystemScheme);
  clearTimeout(copiedTimer);
});
</script>

<template>
  <div class="xh-token-browser">
    <section class="xh-token-browser__toolbar" aria-label="筛选与视觉环境">
      <XhTextFieldRoot v-model:value="query" class="xh-token-browser__search" placeholder="按名字、取值或说明搜，空格分开多个词" size="sm" clearable>
        <XhTextFieldLabel>搜索</XhTextFieldLabel>
        <XhTextFieldControl>
          <XhTextFieldInput />
        </XhTextFieldControl>
      </XhTextFieldRoot>
      <div v-for="setting in settings" :key="setting.label" class="xh-token-browser__setting">
        <span class="xh-token-browser__label" aria-hidden="true">{{ setting.label }}</span>
        <XhRadioGroupRoot
          v-model:value="setting.model.value"
          variant="segmented"
          :collection="setting.options"
          :label="setting.label"
          size="sm"
        />
      </div>
    </section>

    <div class="xh-token-browser__groups" role="group" aria-label="类别">
      <button
        v-for="name in groups"
        :key="name"
        class="xh-token-browser__group"
        type="button"
        :aria-pressed="(group ?? ALL) === name"
        @click="group = name"
      >
        {{ name }}<span class="xh-token-browser__count">{{ counts[name] }}</span>
      </button>
    </div>

    <div
      ref="scope"
      class="xh-token-browser__scope"
      :data-theme="mode ?? 'light'"
      :data-density="density ?? 'comfortable'"
      :data-contrast="contrast ?? 'default'"
    >
      <p class="xh-token-browser__summary" aria-live="polite">
        {{ visible.length }} / {{ rows.length }} 条
      </p>
      <table class="xh-token-browser__table">
        <thead>
          <tr>
            <th scope="col">
              令牌
            </th>
            <th scope="col">
              源值
            </th>
            <th scope="col">
              当前取值
            </th>
            <th scope="col">
              <span class="xh-token-browser__sr">复制</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visible" :key="row.name">
            <td>
              <code>{{ row.name }}</code>
              <span v-if="row.component" class="xh-token-browser__meta">{{ row.component }}</span>
              <span v-if="row.note" class="xh-token-browser__meta">{{ row.note }}</span>
            </td>
            <td><code class="xh-token-browser__value">{{ row.source }}</code></td>
            <td>
              <span class="xh-token-browser__resolved">
                <span
                  v-if="row.resolveFrom && isColor(resolved[row.resolveFrom] ?? '')"
                  class="xh-token-browser__swatch"
                  :style="{ background: `var(${row.resolveFrom})` }"
                  aria-hidden="true"
                />
                <code class="xh-token-browser__value">{{ (row.resolveFrom && resolved[row.resolveFrom]) || "—" }}</code>
              </span>
            </td>
            <td>
              <XhButton variant="ghost" tone="neutral" size="sm" :aria-label="`复制 var(${row.name})`" @click="copy(row.name)">
                {{ copied === row.name ? "已复制" : "复制" }}
              </XhButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.xh-token-browser {
  display: grid;
  gap: var(--xh-space-4);
  margin-block: var(--xh-space-6);
}

.xh-token-browser__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--xh-space-3) var(--xh-space-5);
}

.xh-token-browser__search {
  flex: 1 1 280px;
}

.xh-token-browser__setting {
  display: grid;
  gap: var(--xh-space-1);
}

.xh-token-browser__label {
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}

.xh-token-browser__groups {
  display: flex;
  flex-wrap: wrap;
  gap: var(--xh-space-2);
}

.xh-token-browser__group {
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
}

.xh-token-browser__group[aria-pressed="true"] {
  border-color: var(--xh-fg-brand);
  color: var(--xh-fg-brand);
  background: var(--xh-bg-brand-subtle);
}

.xh-token-browser__group:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}

.xh-token-browser__count {
  color: var(--xh-fg-muted);
  font-variant-numeric: tabular-nums;
}

/* 局部视觉环境：底与字取这一层自己的主题 */
.xh-token-browser__scope {
  overflow-x: auto;
  padding: var(--xh-space-3);
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  color: var(--xh-fg-default);
  background: var(--xh-bg-page);
}

.xh-token-browser__summary {
  margin: 0 0 var(--xh-space-2);
  color: var(--xh-fg-muted);
  font-size: var(--xh-font-size-sm);
}

.xh-token-browser__table {
  display: table;
  inline-size: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: var(--xh-font-size-sm);
}

.xh-token-browser__table th,
.xh-token-browser__table td {
  padding: var(--xh-space-2) var(--xh-space-3);
  border: none;
  border-block-end: var(--xh-stroke-thin) solid var(--xh-border-subtle);
  color: inherit;
  background: transparent;
  text-align: start;
  vertical-align: top;
}

.xh-token-browser__table tr {
  background: transparent;
}

.xh-token-browser__meta {
  display: block;
  margin-block-start: var(--xh-space-1);
  color: var(--xh-fg-muted);
}

.xh-token-browser__value {
  word-break: break-all;
}

.xh-token-browser__resolved {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-2);
}

.xh-token-browser__swatch {
  flex: none;
  inline-size: 1.25em;
  block-size: 1.25em;
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-control);
}

.xh-token-browser__sr {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
