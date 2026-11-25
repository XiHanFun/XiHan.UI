<!-- 设计文档里的令牌表：按名字（或前缀）从令牌产物里取一组令牌，列成名字 / 取值 / 预览三栏。
     取值列缺省印源值（引用保留 var() 写法），写 resolve 时顺着别名展开到字面量；modes 每写一档就多一列
     那一档的取值（深色、紧凑、减弱动效、高对比），数据在构建期从 tokens.css 拆出，不手抄。
     预览列按 kind 画：色块、间距条、圆角块、阴影块、字样。 -->
<script setup lang="ts">
import type { TokenMode } from "./token-modes.data";
import { computed } from "vue";
import { data } from "./token-modes.data";
import { createTokenResolver } from "./token-resolve";

type Kind = "color" | "space" | "radius" | "shadow" | "text" | "none";

const props = withDefaults(
  defineProps<{
    /** 令牌名前缀；与 names 二选一 */
    prefix?: string;
    /** 逐个点名的令牌，按给的顺序排 */
    names?: string[];
    /** 逐个令牌的一句说明，键是令牌名 */
    notes?: Record<string, string>;
    /** 预览列怎么画；none 不画 */
    kind?: Kind;
    /** 顺着别名一路展开到字面量（150ms、4px），不写时保留 var(--xh-…) 写法 */
    resolve?: boolean;
    /** 并排列出的环境档，每档一列 */
    modes?: TokenMode[];
    /** 缺省档那一列的列名，如「浅色」「comfortable（缺省）」 */
    valueLabel?: string;
  }>(),
  { prefix: undefined, names: undefined, notes: undefined, kind: "none", resolve: false, modes: () => [], valueLabel: "取值" },
);

const MODE_LABELS: Record<TokenMode, string> = {
  dark: "深色",
  compact: "compact",
  reduce: "减弱动效",
  more: "高对比",
};

const resolver = createTokenResolver(data);

interface Row {
  name: string;
  value: string;
  modeValues: string[];
  note: string;
}

const rows = computed<Row[]>(() => {
  const names = props.names
    ?? Object.keys(data.base).filter(name => props.prefix != null && name.startsWith(props.prefix) && !name.startsWith("--xh-_"));
  return names.map(name => ({
    name,
    value: resolver.value(name, "default", props.resolve) ?? "（未定义）",
    modeValues: props.modes.map(mode => resolver.value(name, mode, props.resolve) ?? "（未定义）"),
    note: props.notes?.[name] ?? "",
  }));
});

const hasNotes = computed(() => rows.value.some(row => row.note));

function previewStyle(row: Row): Record<string, string> {
  switch (props.kind) {
    case "color":
      return { background: `var(${row.name})` };
    case "space":
      return { inlineSize: `var(${row.name})` };
    case "radius":
      return { borderRadius: `var(${row.name})` };
    case "shadow":
      return { boxShadow: `var(${row.name})` };
    case "text":
      return { fontSize: `var(${row.name})` };
    default:
      return {};
  }
}
</script>

<template>
  <table class="xh-token-table">
    <thead>
      <tr>
        <th>令牌</th>
        <th>{{ valueLabel }}</th>
        <th v-for="mode in modes" :key="mode">{{ MODE_LABELS[mode] }}</th>
        <th v-if="kind !== 'none'">预览</th>
        <th v-if="hasNotes">说明</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.name">
        <td><code class="xh-token-table__name">{{ row.name }}</code></td>
        <td><code class="xh-token-table__value" :title="row.value">{{ row.value }}</code></td>
        <td v-for="(value, index) in row.modeValues" :key="modes[index]">
          <code class="xh-token-table__value" :title="value">{{ value }}</code>
        </td>
        <td v-if="kind !== 'none'">
          <span
            class="xh-token-table__preview"
            :class="`xh-token-table__preview--${kind}`"
            :style="previewStyle(row)"
            aria-hidden="true"
          >{{ kind === "text" ? "永字八法 Ag" : "" }}</span>
        </td>
        <td v-if="hasNotes" class="xh-token-table__note">{{ row.note }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.xh-token-table__name {
  white-space: nowrap;
}

/* 列多时表格横向滚动，说明列不被挤成一字一行 */
.xh-token-table__note {
  min-inline-size: 14rem;
}

.xh-token-table__value {
  display: inline-block;
  max-inline-size: 22rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}

.xh-token-table__preview {
  display: inline-block;
  vertical-align: middle;
}

.xh-token-table__preview--color {
  inline-size: 3rem;
  block-size: 1.5rem;
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-inset);
}

.xh-token-table__preview--space {
  block-size: 0.75rem;
  background: var(--xh-bg-brand);
  border-radius: var(--xh-shape-pill);
}

.xh-token-table__preview--radius {
  inline-size: 2.5rem;
  block-size: 2.5rem;
  border: var(--xh-stroke-thin) solid var(--xh-border-strong);
  background: var(--xh-bg-subtle);
}

.xh-token-table__preview--shadow {
  inline-size: 3.5rem;
  block-size: 2rem;
  margin: var(--xh-space-1) 0;
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  background: var(--xh-bg-surface);
}

.xh-token-table__preview--text {
  line-height: var(--xh-leading-tight);
  white-space: nowrap;
}
</style>
