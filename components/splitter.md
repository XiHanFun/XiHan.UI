来源：https://ui.docs.xihanfun.com/components/splitter

# Splitter 分栏

将内容区域拆分为可调整大小的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/splitter" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/splitter.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/splitter" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/splitter" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/splitter.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

调整侧栏和编辑区域的比例

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <XhSplitterRoot :panels="panels" aria-label="可调整比例的占位区块" style="inline-size: min(640px, 100%); block-size: 180px">
    <XhSplitterPanel :index="0" style="padding: 16px">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="padding: 16px">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%" />
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<xh-splitter
  panels='[{"id":"aside","min":20,"max":60},{"id":"main","min":25}]'
  aria-label="可调整比例的占位区块"
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 180px">
    <div data-xh-part="panel" index="0" style="padding: 16px"><span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%"></span></div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1" style="padding: 16px"><span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%"></span></div>
  </div>
</xh-splitter>
```

## 组件结构

加粗的是必需部件。

`data-scope="splitter"`：**`root`** · **`panel`** · **`resize-trigger`**

## 示例

### 垂直与折叠

垂直调整并折叠面板

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "top", min: 10 },
  { id: "middle", min: 10, collapsible: true, collapsedSize: 0 },
  { id: "bottom", min: 10 },
];
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    orientation="vertical"
    style="inline-size: min(480px, 100%); block-size: 240px"
  >
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="1" />
    <XhSplitterPanel :index="2" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="success" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<xh-splitter
  panels='[{"id":"top","min":10},{"id":"middle","min":10,"collapsible":true,"collapsedSize":0},{"id":"bottom","min":10}]'
  orientation="vertical"
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(480px, 100%); block-size: 240px">
    <div data-xh-part="panel" index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="1"></div>
    <div data-xh-part="panel" index="2" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="success" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
  </div>
</xh-splitter>
```

### 禁用

禁止调整面板比例

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [{ id: "aside" }, { id: "main" }];
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    disabled
    style="inline-size: min(480px, 100%); block-size: 140px"
  >
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<xh-splitter
  panels='[{"id":"aside"},{"id":"main"}]'
  disabled
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(480px, 100%); block-size: 140px">
    <div data-xh-part="panel" index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1" style="background: var(--xh-bg-brand-subtle)">
      <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
  </div>
</xh-splitter>
```

### 嵌套分栏

组合水平和垂直面板

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const outer = [
  { id: "aside", min: 15, max: 50 },
  { id: "workbench", min: 30 },
];
const inner = [
  { id: "editor", min: 20 },
  { id: "console", min: 15 },
];
</script>

<template>
  <XhSplitterRoot :panels="outer" style="inline-size: min(640px, 100%); block-size: 240px">
    <XhSplitterPanel :index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <XhSplitterRoot
        :panels="inner"
        orientation="vertical"
        style="inline-size: 100%; block-size: 100%"
      >
        <XhSplitterPanel :index="0" style="background: var(--xh-bg-brand-subtle)">
          <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
        </XhSplitterPanel>
        <XhSplitterResizeTrigger :index="0" />
        <XhSplitterPanel :index="1" style="background: var(--xh-bg-subtle)">
          <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px" />
        </XhSplitterPanel>
      </XhSplitterRoot>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<xh-splitter
  panels='[{"id":"aside","min":15,"max":50},{"id":"workbench","min":30}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 240px">
    <div data-xh-part="panel" index="0" style="background: var(--xh-bg-subtle)">
      <span data-demo-block data-tone="neutral" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <xh-splitter
        panels='[{"id":"editor","min":20},{"id":"console","min":15}]'
        orientation="vertical"
        style="display: contents"
      >
        <div data-xh-part="root" style="inline-size: 100%; block-size: 100%">
          <div data-xh-part="panel" index="0" style="background: var(--xh-bg-brand-subtle)">
            <span data-demo-block data-tone="brand" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
          </div>
          <div data-xh-part="resize-trigger" index="0"></div>
          <div data-xh-part="panel" index="1" style="background: var(--xh-bg-subtle)">
            <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: calc(100% - 24px); margin: 12px"></span>
          </div>
        </div>
      </xh-splitter>
    </div>
  </div>
</xh-splitter>
```

## 设计指引

### 何时使用

- 构建编辑器、文件管理器或预览界面。
- 保存用户调整后的面板比例。

### 何时不用

- 固定比例使用[栅格](./grid)或[弹性布局](./flex)。
- 仅需展开/折叠侧栏时使用[布局](./layout)。

### 特性

- 支持水平、垂直和嵌套分栏。
- 支持最小/最大尺寸和面板折叠。
- 支持方向键、Shift、Enter 和 Escape。
- 调整中和调整结束分别提供回调。

### 组合

- 可在每个面板中放置独立的[滚动区域](./scroll-area)。

### 最佳实践

- 为每个面板设置合理的最小尺寸。
- 使用 `onSizesChangeEnd` 保存最终布局。

### 反模式

- 不要用于固定比例布局。
- 不要缩小分隔条的交互区域。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-splitter>` |
| Vue 组件 | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| 组合式函数 | `useSplitter` |
| 状态机 | `splitterMachine` |
| 皮肤 | `@xihan-ui/styles/splitter.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sizes` | `number[]` |  | 每块面板的百分比。提供即受控：内部不再自行修改，只发 onSizesChange。 |
| `defaultSizes` | `number[]` |  | 非受控初值；未提供时按面板数等分。 |
| `panels` | `SplitterPanelProps[]` |  | 逐块的约束；数组长度同时决定面板块数。 |
| `orientation` | `Orientation` |  | 面板的排布轴，默认 horizontal（并排，左右拖动）；vertical 是上下堆叠，上下拖动。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 |
| `disabled` | `boolean` |  | 禁用：分隔条退出 Tab 序列、不可拖动也不可推动。 |
| `step` | `number` |  | 方向键的步长（百分比），默认 1。 |
| `largeStep` | `number` |  | Shift + 方向键的步长（百分比），默认 10。 |
| `translations` | `Partial<SplitterTranslations>` |  |  |
| `onSizesChange` | `(details: SplitterSizesChangeDetails) => void` |  | 每次尺寸变化都发出；拖动过程中连续发出。 |
| `onSizesChangeEnd` | `(details: SplitterSizesChangeEndDetails) => void` |  | 只在一次操作结束时发出一次，适合用于保存布局。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sizes-change` | `SplitterSizesChangeDetails` | 布局变化（拖动途中连续发出）；detail 为 `{ sizes: number[] }` |
| `sizes-change-end` | `SplitterSizesChangeEndDetails` | 一次拖拽收尾时发出一次；detail 为 `{ sizes: number[], index: number }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSplitterRoot` | `default` | `SplitterRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle` · `dragging`

**事件**：`SIZES.SET` · `BOUNDARY.STEP` · `BOUNDARY.TO_MIN` · `BOUNDARY.TO_MAX` · `BOUNDARY.SET` · `BOUNDARY.FOCUS` · `PANEL.COLLAPSE` · `PANEL.EXPAND` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `DRAG.CANCEL`

**判据**：`canResize`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sizes` | `number[]` |  |
| `panels` | `SplitterPanelState[]` |  |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setSizes` | `(next: number[]) => void` | 整份赋值：逐块夹进约束、总和归位到 100 之后才落定。 |
| `setPanelSize` | `(index: number, next: number) => void` | 把第 index 块调整为 next，差额从它后面的面板中获取。 最后一块没有属于自己的分隔条，它的尺寸是其余面板的余数，不可调整。 |
| `collapsePanel` | `(index: number) => void` |  |
| `expandPanel` | `(index: number) => void` |  |
| `togglePanel` | `(index: number) => void` | 折叠时展开、展开时折叠；不可折叠的面板上是空操作。 |
| `getRootProps` | `() => T['element']` |  |
| `getPanelProps` | `(index: number) => T['element']` |  |
| `getResizeTriggerProps` | `(index: number) => T['element']` | 第 index 条分隔条位于第 index 与第 index+1 块面板之间，调整的是前一块。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in resize-trigger, not disabled | 把这条分隔条前面那块面板按 step（默认 1%）撑大；水平排布认左右键、竖直排布认上下键，另一条轴上的方向键原样放行 |
| `ArrowLeft` / `ArrowUp` | focus in resize-trigger, not disabled | 按 step 压小，同上的轴向规则；rtl 下左右两键对调，语义恒是"撑大 / 压小前一块" |
| `Shift+ArrowRight` / `Shift+ArrowDown` | focus in resize-trigger, not disabled | 按 largeStep（默认 10%）撑大 |
| `Shift+ArrowLeft` / `Shift+ArrowUp` | focus in resize-trigger, not disabled | 按 largeStep 压小 |
| `Home` | focus in resize-trigger, not disabled | 把前一块面板收到它眼下能到的最小尺寸 |
| `End` | focus in resize-trigger, not disabled | 把前一块面板撑到它眼下能到的最大尺寸 |
| `Escape` | 拖动中 | 放弃这一场拖拽，布局退回按下那一刻；收尾回调不发 |
| `Enter` | focus in resize-trigger 且它调整的面板 collapsible，not disabled | 折叠 / 展开该面板；展开回到折叠前的尺寸。面板不可折叠时不接这个键 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | translations?.root |
| `root` | `role` | 'group' |
| `resize-trigger` | `aria-controls` | `panel` 部件的 id |
| `resize-trigger` | `aria-disabled` | 'true' \| 'false' |
| `resize-trigger` | `aria-label` | translations?.resizeTrigger?.(boundary, Math.max(0, l… |
| `resize-trigger` | `aria-orientation` | 'horizontal' \| 'vertical' |
| `resize-trigger` | `aria-valuemax` | String(panel.max) |
| `resize-trigger` | `aria-valuemin` | String(panel.min) |
| `resize-trigger` | `aria-valuenow` | String(panel.size) |
| `resize-trigger` | `role` | 'separator' |

## 样式参考

### 皮肤

`@xihan-ui/styles/splitter.css` 使用 `[data-scope="splitter"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-dragging` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `panel` | `data-collapsed` | ''（条件成立时才出现） |
| `panel` | `data-disabled` | ''（条件成立时才出现） |
| `panel` | `data-dragging` | ''（条件成立时才出现） |
| `panel` | `data-index` | String(panel.index) |
| `panel` | `data-orientation` | props.orientation |
| `resize-trigger` | `data-disabled` | ''（条件成立时才出现） |
| `resize-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-index` | String(boundary) |
| `resize-trigger` | `data-orientation` | props.orientation |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-splitter-disabled-opacity` | `root` | `opacity` | `disabled` | `0.6` | splitter 的 root 部件 opacity 覆盖槽。 |
| `--xh-splitter-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | splitter 的 root 部件 border-radius 覆盖槽。 |
| `--xh-splitter-trigger-bg` | `resize-trigger` | `background` | `default` | `--xh-border-default` | splitter 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-splitter-trigger-bg-disabled` | `resize-trigger` | `background` | `disabled` | `--xh-border-subtle` | splitter 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-splitter-trigger-bg-dragging` | `resize-trigger` | `background` | `dragging` | `--xh-bg-brand` | splitter 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-splitter-trigger-bg-hover` | `resize-trigger` | `background` | `hover` | `--xh-border-control` | splitter 的 resize-trigger 部件 background 覆盖槽。 |
| `--xh-splitter-trigger-thickness` | `resize-trigger` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical` | `--xh-space-1` | splitter 的 resize-trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。
