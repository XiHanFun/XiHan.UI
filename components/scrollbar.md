来源：https://ui.docs.xihanfun.com/components/scrollbar

# Scrollbar 滚动条

为现有滚动容器提供一致的滚动条样式。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/scrollbar" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/scrollbar.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/scrollbar" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/scrollbar" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/scrollbar.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

为滚动容器添加滚动条

```vue
<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const items = ["项目概览", "组件规范", "设计令牌", "无障碍", "交互状态", "主题配置", "发布记录", "迁移指南"];
</script>

<template>
  <div style="position: relative; inline-size: 240px">
    <div
      ref="box"
      style="
        block-size: 144px;
        overflow: auto;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
        padding: 12px;
      "
    >
      <div v-for="item in items" :key="item" style="padding-block: 6px">
        {{ item }}
      </div>
    </div>

    <XhScrollbarRoot :scrollable="box" type="always">
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
```

```html
<div style="position: relative; inline-size: 240px">
  <div id="scrollbar-basic-box" style="block-size: 144px; overflow: auto; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 12px">
    <div style="padding-block: 6px">项目概览</div>
    <div style="padding-block: 6px">组件规范</div>
    <div style="padding-block: 6px">设计令牌</div>
    <div style="padding-block: 6px">无障碍</div>
    <div style="padding-block: 6px">交互状态</div>
    <div style="padding-block: 6px">主题配置</div>
    <div style="padding-block: 6px">发布记录</div>
    <div style="padding-block: 6px">迁移指南</div>
  </div>

  <xh-scrollbar controls="scrollbar-basic-box" type="always">
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-scrollbar>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="scrollbar"`：**`root`** · **`track`** · **`thumb`** · `corner`

## 示例

### 键盘操作

让滑块可聚焦

```vue
<script setup lang="ts">
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const cells = Array.from({ length: 24 }, (_, i) => `第 ${i + 1} 列`);
</script>

<template>
  <div style="position: relative; inline-size: 320px">
    <div
      id="scrollbar-focusable-box"
      ref="box"
      style="
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        padding: 8px;
      "
    >
      <div style="display: flex; gap: 8px; inline-size: max-content">
        <div
          v-for="cell in cells"
          :key="cell"
          style="
            padding: 6px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-subtle);
            white-space: nowrap;
          "
        >
          {{ cell }}
        </div>
      </div>
    </div>

    <XhScrollbarRoot
      :scrollable="box"
      controls="scrollbar-focusable-box"
      orientation="horizontal"
      type="always"
      size="lg"
      focusable
      :translations="{ thumb: '横向滚动条' }"
    >
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
```

```html
<div style="position: relative; inline-size: 320px">
  <div
    id="scrollbar-focusable-box"
    style="
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
      padding: 8px;
    "
  >
    <div id="scrollbar-focusable-row" style="display: flex; gap: 8px; inline-size: max-content"></div>
  </div>

  <xh-scrollbar
    id="scrollbar-focusable"
    controls="scrollbar-focusable-box"
    orientation="horizontal"
    type="always"
    size="lg"
    focusable
  >
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-scrollbar>
</div>

<script type="module">
  document.getElementById("scrollbar-focusable-row").replaceChildren(
    ...Array.from({ length: 24 }, (_, i) => {
      const cell = document.createElement("div");
      cell.style.padding = "6px 12px";
      cell.style.borderRadius = "var(--xh-shape-control)";
      cell.style.background = "var(--xh-bg-subtle)";
      cell.style.whiteSpace = "nowrap";
      cell.textContent = `第 ${i + 1} 列`;
      return cell;
    }),
  );
  document.getElementById("scrollbar-focusable").translations = { thumb: "横向滚动条" };
</script>
```

### 双轴滚动

同时显示横向和纵向滚动条

```vue
<script setup lang="ts">
import { XhScrollbarCorner, XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const box = ref<HTMLElement | null>(null);
const rows = Array.from({ length: 30 }, (_, r) => Array.from({ length: 12 }, (_, c) => `${r + 1}-${c + 1}`));
</script>

<template>
  <div style="position: relative; inline-size: 320px">
    <div
      ref="box"
      style="
        block-size: 200px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: var(--xh-shape-surface);
        padding: 8px;
      "
    >
      <div
        v-for="(row, r) in rows"
        :key="r"
        style="display: flex; gap: 8px; inline-size: max-content; padding-block: 2px"
      >
        <span
          v-for="cell in row"
          :key="cell"
          style="inline-size: 56px; color: var(--xh-fg-muted); font-variant-numeric: tabular-nums"
        >
          {{ cell }}
        </span>
      </div>
    </div>

    <XhScrollbarRoot :scrollable="box" type="auto" gutter>
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
      <XhScrollbarCorner />
    </XhScrollbarRoot>
    <XhScrollbarRoot :scrollable="box" type="auto" orientation="horizontal" gutter>
      <XhScrollbarTrack>
        <XhScrollbarThumb />
      </XhScrollbarTrack>
    </XhScrollbarRoot>
  </div>
</template>
```

```html
<div style="position: relative; inline-size: 320px">
  <div
    id="scrollbar-both-box"
    style="
      block-size: 200px;
      overflow: auto;
      border: 1px solid var(--xh-border-default);
      border-radius: var(--xh-shape-surface);
      padding: 8px;
    "
  ></div>

  <xh-scrollbar controls="scrollbar-both-box" type="auto" gutter>
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
      <div data-xh-part="corner"></div>
    </div>
  </xh-scrollbar>
  <xh-scrollbar controls="scrollbar-both-box" type="auto" orientation="horizontal" gutter>
    <div data-xh-part="root">
      <div data-xh-part="track">
        <div data-xh-part="thumb"></div>
      </div>
    </div>
  </xh-scrollbar>
</div>

<script type="module">
  document.getElementById("scrollbar-both-box").replaceChildren(
    ...Array.from({ length: 30 }, (_, r) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.inlineSize = "max-content";
      row.style.paddingBlock = "2px";
      row.replaceChildren(
        ...Array.from({ length: 12 }, (_, c) => {
          const cell = document.createElement("span");
          cell.style.inlineSize = "56px";
          cell.style.color = "var(--xh-fg-muted)";
          cell.style.fontVariantNumeric = "tabular-nums";
          cell.textContent = `${r + 1}-${c + 1}`;
          return cell;
        }),
      );
      return row;
    }),
  );
</script>
```

### 显示方式

设置滚动条的显示时机

```vue
<script setup lang="ts">
import type { ScrollbarType } from "@xihan-ui/headless";
import { XhScrollbarRoot, XhScrollbarThumb, XhScrollbarTrack } from "@xihan-ui/vue";
import { ref } from "vue";

const types: ScrollbarType[] = ["scroll-hover", "auto", "always", "scroll", "hover"];
const boxes = ref<Record<string, HTMLElement | null>>({});
const lines = Array.from({ length: 30 }, (_, i) => `第 ${i + 1} 行`);
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <div v-for="type in types" :key="type" style="display: flex; flex-direction: column; gap: 6px">
      <span style="font-size: 13px; color: var(--xh-fg-muted)">type="{{ type }}"</span>
      <div style="position: relative; inline-size: 150px">
        <div
          :ref="(el) => { boxes[type] = el as HTMLElement | null }"
          style="
            block-size: 140px;
            overflow: auto;
            border: 1px solid var(--xh-border-default);
            border-radius: var(--xh-shape-surface);
            padding: 8px;
          "
        >
          <div v-for="line in lines" :key="line" style="padding-block: 2px">{{ line }}</div>
        </div>
        <XhScrollbarRoot :scrollable="() => boxes[type] ?? null" :type="type" :hide-delay="400">
          <XhScrollbarTrack>
            <XhScrollbarThumb />
          </XhScrollbarTrack>
        </XhScrollbarRoot>
      </div>
    </div>
  </div>
</template>
```

```html
<div id="scrollbar-types" style="display: flex; flex-wrap: wrap; gap: 16px"></div>

<script type="module">
  const host = document.getElementById("scrollbar-types");
  for (const type of ["scroll-hover", "auto", "always", "scroll", "hover"]) {
    const column = document.createElement("div");
    column.style.display = "flex";
    column.style.flexDirection = "column";
    column.style.gap = "6px";

    const caption = document.createElement("span");
    caption.style.fontSize = "13px";
    caption.style.color = "var(--xh-fg-muted)";
    caption.textContent = `type="${type}"`;

    const frame = document.createElement("div");
    frame.style.position = "relative";
    frame.style.inlineSize = "150px";

    const box = document.createElement("div");
    box.id = `scrollbar-types-${type}`;
    box.style.cssText =
      "block-size: 140px; overflow: auto; border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 8px";
    box.replaceChildren(
      ...Array.from({ length: 30 }, (_, i) => {
        const line = document.createElement("div");
        line.style.paddingBlock = "2px";
        line.textContent = `第 ${i + 1} 行`;
        return line;
      }),
    );

    const bar = document.createElement("xh-scrollbar");
    bar.setAttribute("controls", box.id);
    bar.setAttribute("type", type);
    bar.setAttribute("hide-delay", "400");
    bar.innerHTML =
      '<div data-xh-part="root"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>';

    frame.append(box, bar);
    column.append(caption, frame);
    host.append(column);
  }
</script>
```

## 设计指引

### 何时使用

- 需要统一不同平台的滚动条样式。
- 需要为已有滚动容器补充自定义滚动条。

### 何时不用

- 需要完整的滚动容器时，使用[滚动区域](./scroll-area)。
- 只需调整原生滚动条宽度时，优先使用 CSS。

### 特性

- 支持五种显示时机，默认在滚动或悬停时显示。
- 默认使用透明轨道与半透明中性滑块，悬停和拖动时逐级增强。
- 三档厚度为 4 / 6 / 8px；组件内部保留原生滚动时也复用相同的透明轨道与低对比滑块色阶，作者自建的滚动容器加 `data-xh-scroll` 即得同一套细条。
- 支持拖动、点击轨道、键盘操作与 RTL。
- 支持横向、纵向和双轴滚动。
- 触屏设备默认保留原生滚动体验。

### 组合

- 可与[表格](./table)、[虚拟滚动](./virtualizer)和[日志](./log)组合使用。
- 日期、时间和年份网格等组件内部滚动面复用本组件的透明轨道、厚度和滑块色阶；需要完整自绘交互时组合 `root`、`track` 与 `thumb`。
- 双轴滚动时使用 `gutter` 和 `corner` 处理交叉区域。
- 多个滚动层并排共用一个定位壳（级联的列、时间列）时，`anchor` 取 `layer`，每层各自一套滚动条贴在该层的盒子上。

### 最佳实践

- 保留滚动容器的原生滚轮和键盘能力。
- 触摸设备不要仅使用 `hover` 显示模式。

### 反模式

- 不要为每条辅助滚动条都启用 `focusable`。
- 不要用滚动条组件拦截滚轮事件。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-scrollbar>` |
| Vue 组件 | `XhScrollbarCorner` `XhScrollbarRoot` `XhScrollbarThumb` `XhScrollbarTrack` |
| 组合式函数 | `useScrollbar` |
| 状态机 | `scrollbarMachine` |
| 皮肤 | `@xihan-ui/styles/scrollbar.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `Orientation` |  | 该滚动条管理的轴，默认 vertical。 |
| `type` | `ScrollbarType` |  | 显示的时机，默认 scroll-hover。 |
| `hideDelay` | `number` |  | 收起前的等待毫秒（type 为 scroll / hover / scroll-hover 时生效），默认 600。 |
| `minThumbSize` | `number` |  | 滑块的最小像素长度，默认 20。长文档中的滑块再短也可按下。 |
| `step` | `number` |  | 方向键一步滚动的像素数，默认 40。翻页键按视口长度计算，不使用该值。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，影响滚动条厚度。 |
| `anchor` | `ScrollbarAnchor` |  | 根节点的锚定方式，默认 shell。layer 时根节点按滚动层在壳内的偏移盒以内联样式定位， 壳必须是滚动层的定位祖先（offsetParent）；该值在状态机生命周期内不应变化。 |
| `disabled` | `boolean` |  | 禁用：不接受指针也不接受键盘，恒不显示。 |
| `focusable` | `boolean` |  | 滑块进入 Tab 序列并报告 role=scrollbar，默认 false。 默认不进入：滚动容器自身已能用键盘滚动，再给每条滚动条一个 Tab 停靠点， 长页面上会多出许多停靠点。需要键盘操作滑块本身时才开启。 |
| `controls` | `string` |  | 被控滚动容器的 id；focusable 时写到滑块的 aria-controls 上（未提供时使用容器自身的 id）。 |
| `gutter` | `boolean` |  | 横竖两条同时存在时，各自在末端让出交叉口的一格：竖条不伸到底、横条不伸到头。 交叉口由其中一条中的 corner 部件补上。 |
| `forceVisible` | `boolean` |  | 触屏设备（粗指针）上也显示，默认 false：触屏没有悬停、拖动滑块也不如直接划动内容， 默认交给原生滚动，本组件整条不显示并带 data-native。 |
| `dir` | `Direction` |  | 排版方向，默认随文档。只影响横轴：RTL 下滚动量的正负、指针位移的方向都要翻转。 必须显式提供：组件不读取计算样式，无法感知从 RTL 祖先继承的方向。 |
| `translations` | `Partial<ScrollbarTranslations>` |  |  |
| `onScrollStart` | `(details: ScrollbarScrollDetails) => void` |  | 开始滚动（停止 120ms 才视为一段结束，中途连续滚动不重复通知）。 |
| `onScrollEnd` | `(details: ScrollbarScrollDetails) => void` |  | 一段滚动结束。 |
| `onDragStart` | `(details: ScrollbarScrollDetails) => void` |  | 按住滑块。 |
| `onDragEnd` | `(details: ScrollbarScrollDetails) => void` |  | 松开滑块。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `name` | `CustomEvent` |  |
| `scroll-start` | `` | 开始滚动；detail 为 `{ offset: number, max: number }` |
| `scroll-end` | `` | 一段滚动结束（停止 120ms）；detail 同上 |
| `drag-start` | `` | 按住滑块；detail 同上 |
| `drag-end` | `` | 松开滑块；detail 同上 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhScrollbarRoot` | `default` | `ScrollbarRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhScrollbarRoot` | `scrollable` | `ScrollbarTarget` |  | 真正在滚动的元素，或者取它的函数。它不必是本组件的后代： 表格的滚动盒、虚拟滚动的视口、任意 overflow:auto 的 div 均可。 |
| `XhScrollbarRoot` | `children` | `SlotChildren<ScrollbarRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'visible' \| 'hidden' |
| `corner` | 'visible' \| 'hidden' |

以下名称仅用于内部状态机。

**状态**：`hidden` · `visible` · `hiding` · `dragging`

**事件**：`MEASURE` · `SCROLL` · `SCROLL.IDLE` · `POINTER.ENTER` · `POINTER.LEAVE` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `TRACK.CLICK` · `STEP` · `SCROLL.TO` · `after.hideDelay`

**判据**：`showsOnHover` · `showsOnScroll` · `staysVisible` · `canInteract`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `orientation` | `Orientation` |  |
| `type` | `ScrollbarType` |  |
| `overflow` | `boolean` | 内容比可视区长。不溢出时 auto 档整条不显示。 |
| `visible` | `boolean` | 当前是否应显示（已把 type、disabled 与触屏原生路径都计算在内）。 |
| `native` | `boolean` | 已交给原生滚动：粗指针设备且未开启 forceVisible，整条不显示。 |
| `hover` | `boolean` | 指针当前在滚动容器或滚动条上。 |
| `dragging` | `boolean` | 指针按在滑块上。 |
| `scrolling` | `boolean` | 本段滚动仍在进行中。 |
| `thumbSize` | `number` | 滑块长度占轨道的比例，0-1。 |
| `thumbOffset` | `number` | 滑块起点占轨道的比例，0-1。 |
| `scroll` | `number` | 距逻辑起始缘的滚动量（px）。 |
| `max` | `number` | 仍可向前滚动的距离（px）。 |
| `scrollTo` | `(offset: number) => void` | 滚动到某个绝对位置（px），越界自动夹取。 |
| `scrollBy` | `(delta: number) => void` | 相对当前位置滚动若干像素。 |
| `measure` | `() => void` | 重新测量。内容长度变化会自动重新测量（MutationObserver 观察容器子树）， 该出口留给无法测量的情况：容器更换、内容在 Shadow DOM 中、或自定义元素内部修改。 |
| `getRootProps` | `() => T['element']` |  |
| `getTrackProps` | `() => T['element']` |  |
| `getThumbProps` | `() => T['element']` |  |
| `getCornerProps` | `() => T['element']` | 交叉口补丁，写在其中一条的 root 中；随该条的显隐变化。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/WCAG21/Techniques/general/G202)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowUp` / `ArrowLeft` | focus in thumb, focusable, 与本轴同向 | 往回滚一步（step，默认 40px）；交叉轴的那一个不拦，照常交给页面 |
| `ArrowDown` / `ArrowRight` | focus in thumb, focusable, 与本轴同向 | 往前滚一步 |
| `PageUp` | focus in thumb, focusable | 往回滚一屏（按滚动容器的可视长度） |
| `PageDown` | focus in thumb, focusable | 往前滚一屏 |
| `Home` | focus in thumb, focusable | 滚到起点 |
| `End` | focus in thumb, focusable | 滚到终点 |
| `Tab` / `Shift+Tab` | focusable | 滑块是一个 Tab 停靠点；不开 focusable 时整条退出 Tab 序，也对读屏隐藏 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-hidden` | undefined \| 'true' |
| `thumb` | `aria-controls` | props.controls \| undefined |
| `thumb` | `aria-disabled` | 'true' \| undefined |
| `thumb` | `aria-label` | props.translations.thumb \| undefined |
| `thumb` | `aria-orientation` | props.orientation \| undefined |
| `thumb` | `aria-valuemax` | Math.round(max) \| undefined |
| `thumb` | `aria-valuemin` | 0 \| undefined |
| `thumb` | `aria-valuenow` | Math.round(metrics.scroll) \| undefined |
| `thumb` | `role` | 'scrollbar' \| undefined |

## 样式参考

### 皮肤

`@xihan-ui/styles/scrollbar.css` 使用 `[data-scope="scrollbar"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-anchor` | 'layer' \| undefined |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-gutter` | ''（条件成立时才出现） |
| `root` | `data-native` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-reveal-mode` | props.type |
| `root` | `data-scrolling` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'visible' \| 'hidden' |
| `track` | `data-disabled` | ''（条件成立时才出现） |
| `track` | `data-orientation` | props.orientation |
| `thumb` | `data-disabled` | ''（条件成立时才出现） |
| `thumb` | `data-dragging` | ''（条件成立时才出现） |
| `thumb` | `data-orientation` | props.orientation |
| `corner` | `data-orientation` | props.orientation |
| `corner` | `data-size` | props.size |
| `corner` | `data-state` | 'visible' \| 'hidden' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-scrollbar-corner-bg` | `corner` | `background` | `default` | `--xh-scrollbar-track-bg` | scrollbar 的 corner 部件 background 覆盖槽。 |
| `--xh-scrollbar-thumb-bg` | `thumb` | `background` | `default` | `--xh-fg-scrollbar-thumb` | scrollbar 的 thumb 部件 background 覆盖槽。 |
| `--xh-scrollbar-thumb-bg-active` | `thumb` | `background` | `dragging` | `--xh-fg-scrollbar-thumb-active` | scrollbar 的 thumb 部件 background 覆盖槽。 |
| `--xh-scrollbar-thumb-bg-disabled` | `thumb` | `background` | `disabled` | `--xh-border-subtle` | scrollbar 的 thumb 部件 background 覆盖槽。 |
| `--xh-scrollbar-thumb-bg-hover` | `thumb` | `background` | `hover` | `--xh-fg-scrollbar-thumb-hover` | scrollbar 的 thumb 部件 background 覆盖槽。 |
| `--xh-scrollbar-thumb-radius` | `thumb` | `border-radius` | `default` | `--xh-shape-pill` | scrollbar 的 thumb 部件 border-radius 覆盖槽。 |
| `--xh-scrollbar-track-bg` | `corner`<br>`track` | `background` | `default` | `--xh-bg-scrollbar-track`<br>`transparent` | scrollbar 的 corner、track 部件 background 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：状态 · 出现（见[动效规范](../design/motion#角色)）。

`background-color` · `color` · `opacity` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
