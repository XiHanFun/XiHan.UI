来源：https://ui.docs.xihanfun.com/components/anchor

# Anchor 锚点

根据滚动位置高亮当前章节的目录。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/anchor" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/anchor.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/anchor" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/anchor" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/anchor.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

跟随滚动高亮当前章节

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-basic-overview", label: "概览" },
  { value: "anchor-basic-install", label: "安装" },
  { value: "anchor-basic-theme", label: "主题" },
  { value: "anchor-basic-release", label: "发布" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
    grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
      gap: 20px;
      inline-size: min(640px, 100%);
      align-items: start;
    "
  >
    <XhAnchorRoot :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 160px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
    gap: 20px;
    inline-size: min(640px, 100%);
    align-items: start;
  "
>
  <template id="anchor-basic-nav">
    <xh-anchor smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-overview">概览</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-install">安装</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-theme">主题</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-basic-release">发布</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-basic-scroll"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      padding-inline: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div id="anchor-basic-overview" style="block-size: 160px; padding-block: 12px">
      <strong>概览</strong>
      <p style="color: var(--xh-fg-muted)">概览相关内容</p>
    </div>
    <div id="anchor-basic-install" style="block-size: 160px; padding-block: 12px">
      <strong>安装</strong>
      <p style="color: var(--xh-fg-muted)">安装相关内容</p>
    </div>
    <div id="anchor-basic-theme" style="block-size: 160px; padding-block: 12px">
      <strong>主题</strong>
      <p style="color: var(--xh-fg-muted)">主题相关内容</p>
    </div>
    <div id="anchor-basic-release" style="block-size: 160px; padding-block: 12px">
      <strong>发布</strong>
      <p style="color: var(--xh-fg-muted)">发布相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const template = document.getElementById("anchor-basic-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-basic-scroll");
  template.replaceWith(anchor);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="anchor"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-text` · `indicator`

## 示例

### 判定线偏移

为吸顶内容预留空间

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
      gap: 20px;
      inline-size: min(640px, 100%);
      align-items: start;
    "
  >
    <XhAnchorRoot :scroll-element="scrollEl" :offset="44" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        position: relative;
        block-size: 240px;
        overflow: auto;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        style="
          position: sticky;
          inset-block-start: 0;
          z-index: 1;
          block-size: 44px;
          display: flex;
          align-items: center;
          padding-inline: 12px;
          background: var(--xh-bg-surface);
          border-block-end: 1px solid var(--xh-border-default);
        "
      >
        章节导航
      </div>

      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px; padding: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: minmax(112px, 140px) minmax(0, 1fr);
    gap: 20px;
    inline-size: min(640px, 100%);
    align-items: start;
  "
>
  <template id="anchor-offset-nav">
    <xh-anchor offset="44" smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-a">第一节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-b">第二节</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-offset-c">第三节</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-offset-scroll"
    data-xh-scroll
    style="
      position: relative;
      block-size: 240px;
      overflow: auto;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 44px;
        display: flex;
        align-items: center;
        padding-inline: 12px;
        background: var(--xh-bg-surface);
        border-block-end: 1px solid var(--xh-border-default);
      "
    >
      章节导航
    </div>

    <div id="anchor-offset-a" style="block-size: 180px; padding: 12px">
      <strong>第一节</strong>
      <p style="color: var(--xh-fg-muted)">第一节相关内容</p>
    </div>
    <div id="anchor-offset-b" style="block-size: 180px; padding: 12px">
      <strong>第二节</strong>
      <p style="color: var(--xh-fg-muted)">第二节相关内容</p>
    </div>
    <div id="anchor-offset-c" style="block-size: 180px; padding: 12px">
      <strong>第三节</strong>
      <p style="color: var(--xh-fg-muted)">第三节相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const template = document.getElementById("anchor-offset-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-offset-scroll");
  template.replaceWith(anchor);
</script>
```

### 横向排列

在内容上方显示章节导航

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const sections = [
  { value: "anchor-h-overview", label: "概览" },
  { value: "anchor-h-props", label: "属性" },
  { value: "anchor-h-events", label: "事件" },
  { value: "anchor-h-slots", label: "插槽" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; inline-size: min(640px, 100%)">
    <XhAnchorRoot
      :scroll-element="scrollEl"
      orientation="horizontal"
      smooth
    >
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 220px;
        overflow: auto;
        padding-inline: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 170px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: min(640px, 100%)">
  <template id="anchor-h-nav">
    <xh-anchor orientation="horizontal" smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-overview">概览</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-props">属性</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-events">事件</a>
          </li>
          <li data-xh-part="item">
            <a data-xh-part="link" value="anchor-h-slots">插槽</a>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-h-scroll"
    data-xh-scroll
    style="
      block-size: 220px;
      overflow: auto;
      padding-inline: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div id="anchor-h-overview" style="block-size: 170px; padding-block: 12px">
      <strong>概览</strong>
      <p style="color: var(--xh-fg-muted)">概览相关内容</p>
    </div>
    <div id="anchor-h-props" style="block-size: 170px; padding-block: 12px">
      <strong>属性</strong>
      <p style="color: var(--xh-fg-muted)">属性相关内容</p>
    </div>
    <div id="anchor-h-events" style="block-size: 170px; padding-block: 12px">
      <strong>事件</strong>
      <p style="color: var(--xh-fg-muted)">事件相关内容</p>
    </div>
    <div id="anchor-h-slots" style="block-size: 170px; padding-block: 12px">
      <strong>插槽</strong>
      <p style="color: var(--xh-fg-muted)">插槽相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const template = document.getElementById("anchor-h-nav");
  const anchor = template.content.firstElementChild;
  anchor.scrollElement = document.getElementById("anchor-h-scroll");
  template.replaceWith(anchor);
</script>
```

### 嵌套目录

展示父级与子级章节

```vue
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const groups = [
  {
    value: "anchor-nested-guide",
    label: "指南",
    children: [
      { value: "anchor-nested-install", label: "安装" },
      { value: "anchor-nested-start", label: "快速开始" },
    ],
  },
  {
    value: "anchor-nested-api",
    label: "接口",
    children: [
      { value: "anchor-nested-props", label: "属性" },
      { value: "anchor-nested-events", label: "事件" },
    ],
  },
];

const sections = computed(() =>
  groups.flatMap(g => [{ value: g.value, label: g.label }, ...g.children]),
);

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

function isGroupActive(group: {
  value: string;
  children: readonly { value: string }[];
}): boolean {
  return (
    active.value === group.value
    || group.children.some(c => c.value === active.value)
  );
}
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: minmax(128px, 160px) minmax(0, 1fr);
      gap: 20px;
      inline-size: min(640px, 100%);
      align-items: start;
    "
  >
    <XhAnchorRoot v-model:value="active" :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem
          v-for="g in groups"
          :key="g.value"
          style="flex-direction: column; align-items: stretch"
        >
          <XhAnchorLink
            :value="g.value"
            :style="isGroupActive(g) ? { color: 'var(--xh-fg-brand)' } : undefined"
          >
            {{ g.label }}
          </XhAnchorLink>
          <ul
            style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none"
          >
            <XhAnchorItem v-for="c in g.children" :key="c.value">
              <XhAnchorLink :value="c.value">{{ c.label }}</XhAnchorLink>
            </XhAnchorItem>
          </ul>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      data-xh-scroll
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 140px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
```

```html
<div
  style="
    display: grid;
    grid-template-columns: minmax(128px, 160px) minmax(0, 1fr);
    gap: 20px;
    inline-size: min(640px, 100%);
    align-items: start;
  "
>
  <template id="anchor-nested-nav">
    <xh-anchor smooth>
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-guide">指南</a>
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-install">安装</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-start">快速开始</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="item" style="flex-direction: column; align-items: stretch">
            <a data-xh-part="link" value="anchor-nested-api">接口</a>
            <ul style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none">
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-props">属性</a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="anchor-nested-events">事件</a>
              </li>
            </ul>
          </li>
          <li data-xh-part="indicator"></li>
        </ul>
      </nav>
    </xh-anchor>
  </template>

  <div
    id="anchor-nested-scroll"
    data-xh-scroll
    style="
      block-size: 240px;
      overflow: auto;
      padding-inline: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div id="anchor-nested-guide" style="block-size: 140px; padding-block: 12px">
      <strong>指南</strong>
      <p style="color: var(--xh-fg-muted)">指南相关内容</p>
    </div>
    <div id="anchor-nested-install" style="block-size: 140px; padding-block: 12px">
      <strong>安装</strong>
      <p style="color: var(--xh-fg-muted)">安装相关内容</p>
    </div>
    <div id="anchor-nested-start" style="block-size: 140px; padding-block: 12px">
      <strong>快速开始</strong>
      <p style="color: var(--xh-fg-muted)">快速开始相关内容</p>
    </div>
    <div id="anchor-nested-api" style="block-size: 140px; padding-block: 12px">
      <strong>接口</strong>
      <p style="color: var(--xh-fg-muted)">接口相关内容</p>
    </div>
    <div id="anchor-nested-props" style="block-size: 140px; padding-block: 12px">
      <strong>属性</strong>
      <p style="color: var(--xh-fg-muted)">属性相关内容</p>
    </div>
    <div id="anchor-nested-events" style="block-size: 140px; padding-block: 12px">
      <strong>事件</strong>
      <p style="color: var(--xh-fg-muted)">事件相关内容</p>
    </div>
  </div>
</div>

<script type="module">
  const groups = {
    "anchor-nested-guide": ["anchor-nested-install", "anchor-nested-start"],
    "anchor-nested-api": ["anchor-nested-props", "anchor-nested-events"],
  };

  const template = document.getElementById("anchor-nested-nav");
  const anchor = template.content.firstElementChild;

  function apply(next) {
    anchor.value = next;
    for (const [parent, children] of Object.entries(groups)) {
      const link = anchor.querySelector(`[data-xh-part="link"][value="${parent}"]`);
      const on = next === parent || children.includes(next);
      link.style.color = on ? "var(--xh-fg-brand)" : "";
    }
  }

  anchor.scrollElement = document.getElementById("anchor-nested-scroll");
  apply(null);
  template.replaceWith(anchor);

  anchor.addEventListener("value-change", (event) => apply(event.detail.value));
</script>
```

## 设计指引

### 何时使用

- 为长文档、设置页或详情页提供章节导航。

### 何时不用

- 切换独立内容使用[标签页](./tabs)。
- 不需要当前位置反馈时使用普通链接。

### 特性

- 支持页面或指定容器滚动。
- 支持滚动偏移、平滑滚动和当前项指示线：不放 `indicator` 部件时当前链接自带一条静态线（竖排贴起始缘、横排贴底边），放了部件则由部件滑动。
- 支持水平、垂直和嵌套目录。

### 组合

- 可与[固钉](./affix)和[排印](./typography)组合使用。

### 最佳实践

- 有固定页头时设置对应的滚动偏移。
- 目录项文字应与正文标题一致。

### 反模式

- 目录层级不宜超过两级。
- 不要用锚点切换独立视图。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-anchor>` |
| Vue 组件 | `XhAnchorIndicator` `XhAnchorItem` `XhAnchorLink` `XhAnchorLinkText` `XhAnchorList` `XhAnchorRoot` |
| 组合式函数 | `useAnchor` |
| 状态机 | `anchorMachine` |
| 皮肤 | `@xihan-ui/styles/anchor.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` |  | 当前激活的锚点 id，给定即受控。 |
| `defaultValue` | `string \| null` |  |  |
| `collection` | `readonly string[]` |  | 目标区块的 id 清单，按文档序提供；未提供时按渲染出的 link 查询。 |
| `offset` | `number` |  | 判定线距滚动容器视口顶边的距离（px），默认 0。 |
| `bounds` | `number` |  | 压线判定的容差（px），默认 1；区块顶边落在判定线下方该距离内仍视为越过。 |
| `smooth` | `boolean` |  | 点击链接时平滑滚动到目标，默认 false。 |
| `dir` | `Direction` |  | 文字方向，作用于排版与指示条的起始缘。 |
| `orientation` | `Orientation` |  | 列表轴向，默认 vertical，只影响样式。 |
| `translations` | `Partial<AnchorTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: AnchorValueChangeDetails) => void` |  | value 变化意图回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `AnchorValueChangeDetails` | 激活项变化；detail 为 `{ value: string \| null }` |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `scrolling`

**事件**：`SPY.RESOLVE` · `LINK.CLICK` · `VALUE.SET` · `after.scrollLock` · `PRESS.START` · `PRESS.END`

**判据**：`isSmooth` · `isTargetReached` · `canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前激活的锚点 id；没有区块越过判定线时为 null。 |
| `isActive` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: AnchorLinkProps) => T['element']` |  |
| `getLinkTextProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link | 跳到目标区块：smooth 关时由原生 &lt;a href="#id"&gt; 跳转，开时组件拦下并平滑滚动（两种情况都当场把激活项切过去，不等观察器） |
| `Enter` / `Space` | held in link | 按住期间该链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。跳到目标区块照旧由这一次按键承担，激活项与按压互相独立 |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过目录里的链接；锚点导航不做 roving tabindex，每一条都是独立的 Tab 停靠点 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'location' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/anchor.css` 使用 `[data-scope="anchor"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link-text` | `data-xh-collection-slot` | 'text' |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-value` | context.get('value') |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-anchor-fg` | `link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | anchor 的 link、root 部件 color 覆盖槽。 |
| `--xh-anchor-font-size` | `link`<br>`root` | `font-size` | `default` | `--xh-_anchor-font-size` | anchor 的 link、root 部件 font-size 覆盖槽。 |
| `--xh-anchor-gap` | `list` | `gap` | `default` | `--xh-space-1` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-gap-horizontal` | `list` | `gap` | `orientation=horizontal` | `--xh-space-2` | anchor 的 list 部件 gap 覆盖槽。 |
| `--xh-anchor-indicator-color` | `indicator`<br>`link` | `background` | `current`<br>`default` | `--xh-_anchor-accent` | anchor 的 indicator、link 部件 background 覆盖槽。 |
| `--xh-anchor-indicator-radius` | `indicator`<br>`link` | `border-radius` | `current`<br>`default` | `--xh-shape-pill` | anchor 的 indicator、link 部件 border-radius 覆盖槽。 |
| `--xh-anchor-indicator-thickness` | `indicator`<br>`link`<br>`list` | `block-size`<br>`inline-size`<br>`inset-block-end`<br>`inset-inline-start` | `current`<br>`default`<br>`orientation=horizontal`<br>`orientation=vertical` | `--xh-stroke-thick` | anchor 的 indicator、link、list 部件 block-size、inline-size、inset-block-end、inset-inline-start 覆盖槽。 |
| `--xh-anchor-leading` | `link`<br>`root` | `line-height` | `default` | `--xh-leading-normal` | anchor 的 link、root 部件 line-height 覆盖槽。 |
| `--xh-anchor-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` | anchor 的 link 部件 background-color 覆盖槽。 |
| `--xh-anchor-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | anchor 的 link 部件 background-color 覆盖槽。 |
| `--xh-anchor-link-fg-current` | `link` | `color` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_anchor-accent-text` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-fg-default` | anchor 的 link 部件 color 覆盖槽。 |
| `--xh-anchor-link-font-weight-current` | `link` | `font-weight` | `current`<br>`disabled`<br>`error`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-font-weight-medium` | anchor 的 link 部件 font-weight 覆盖槽。 |
| `--xh-anchor-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | anchor 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-anchor-link-px` | `link` | `padding-inline` | `default` | `--xh-_anchor-link-px` | anchor 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-anchor-link-py` | `link` | `padding-block` | `default` | `--xh-space-1` | anchor 的 link 部件 padding-block 覆盖槽。 |
| `--xh-anchor-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | anchor 的 link 部件 border-radius 覆盖槽。 |
| `--xh-anchor-track` | `list` | `border-block-end`<br>`border-inline-start` | `default`<br>`orientation=horizontal` | `--xh-border-default` | anchor 的 list 部件 border-block-end、border-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`block-size` · `inline-size` · `inset-block-start` · `inset-inline-start` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
