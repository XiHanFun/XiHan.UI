来源：https://ui.docs.xihanfun.com/components/splitter

# 分栏 `splitter`

把一块区域拆成几片可拖动的面板，边界由用户自己分配。

## 何时使用

- 代码编辑器、文件管理器、带预览的编辑界面这类"两边都重要、比例因人而异"的布局。
- 用户调好的比例需要记下来：`onSizesChangeEnd` 就是为此留的。

## 何时不用

- 比例是固定的：用[栅格](./grid)或[弹性布局](./flex)。
- 侧栏只有展开与折叠两态：用[布局](./layout)的折叠侧栏。

## 特性

- `panels` 数组的长度决定面板块数，每条分隔条调的是它前面那一块。
- 两个回调分工明确：`onSizesChange` 拖动途中连着发，`onSizesChangeEnd` 松手才发一次，存布局用后者。
- 方向键按 `step` 推、Shift 加方向键按 `largeStep` 推；`collapsible` 的面板在分隔条上按 Enter 折叠。
- 面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸。
- 拖到一半按 Escape 放弃这一场：布局退回按下那一刻，`onSizesChangeEnd` 不发。
- `translations` 给整组面板与各条分隔条起名，读屏念到的就不再是一串无名的盒子。

## 示例

### 基础用法

panels 数组的长度决定面板块数，每条分隔条调的是它前面那一块

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

// id 用来派生面板的 DOM id，分隔条的 aria-controls 指向它
const panels = [
  { id: "aside", min: 20, max: 60 },
  { id: "main", min: 25 },
];
</script>

<template>
  <!-- 分栏必须先有一个确定的跨轴尺寸，才谈得上把它分成几份 -->
  <XhSplitterRoot :panels="panels" style="inline-size: 100%; block-size: 140px">
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">侧栏：min 20% / max 60%，拖到底也留得住 20%。</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">正文：min 25%，侧栏再撑也吃不掉它这一份。</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<!-- 分栏必须先有一个确定的跨轴尺寸，才谈得上把它分成几份 -->
<xh-splitter
  panels='[{"id":"aside","min":20,"max":60},{"id":"main","min":25}]'
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: 100%; block-size: 140px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">侧栏：min 20% / max 60%，拖到底也留得住 20%。</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <p style="padding: 12px">正文：min 25%，侧栏再撑也吃不掉它这一份。</p>
    </div>
  </div>
</xh-splitter>
```

### 受控

传了 sizes 就由宿主说了算；sizes-change 拖动途中连着发，sizes-change-end 松手才发一次

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";
import { ref } from "vue";

const panels = [{ id: "aside", min: 20 }, { id: "main", min: 20 }];
const size = ref([30, 70]);
const lastEnd = ref("（还没拖过）");

function onSizeChangeEnd(details: { sizes: number[]; index: number }): void {
  lastEnd.value = `第 ${details.index} 条 → ${details.sizes
    .map(n => `${Math.round(n)}%`)
    .join(" / ")}`;
}
</script>

<template>
  <div style="inline-size: 100%; display: grid; gap: 12px">
    <XhSplitterRoot
      v-model:sizes="size"
      :panels="panels"
      style="block-size: 140px"
      @sizes-change-end="onSizeChangeEnd"
    >
      <XhSplitterPanel :index="0">
        <p style="padding: 12px">侧栏</p>
      </XhSplitterPanel>
      <XhSplitterResizeTrigger :index="0" />
      <XhSplitterPanel :index="1">
        <p style="padding: 12px">正文</p>
      </XhSplitterPanel>
    </XhSplitterRoot>

    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
      <button type="button" @click="size = [30, 70]">复位到 30 / 70</button>
      <span>当前：{{ size.map((n) => `${Math.round(n)}%`).join(" / ") }}</span>
      <span>上次收尾：{{ lastEnd }}</span>
    </div>
  </div>
</template>
```

```html
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-splitter
    id="splitter-controlled"
    sizes="30,70"
    panels='[{"id":"aside","min":20},{"id":"main","min":20}]'
    style="display: contents"
  >
    <div data-xh-part="root" style="block-size: 140px">
      <div data-xh-part="panel" index="0">
        <p style="padding: 12px">侧栏</p>
      </div>
      <div data-xh-part="resize-trigger" index="0"></div>
      <div data-xh-part="panel" index="1">
        <p style="padding: 12px">正文</p>
      </div>
    </div>
  </xh-splitter>

  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
    <button type="button" id="splitter-controlled-reset">复位到 30 / 70</button>
    <span>当前：<span id="splitter-controlled-now">30% / 70%</span></span>
    <span>上次收尾：<span id="splitter-controlled-end">（还没拖过）</span></span>
  </div>
</div>

<script type="module">
  // 拖动发来的布局写回元素，界面才跟着变
  const splitter = document.getElementById("splitter-controlled");
  const now = document.getElementById("splitter-controlled-now");
  const end = document.getElementById("splitter-controlled-end");
  const format = (sizes) => sizes.map((n) => `${Math.round(n)}%`).join(" / ");

  splitter.addEventListener("sizes-change", (event) => {
    splitter.sizes = event.detail.sizes;
    now.textContent = format(event.detail.sizes);
  });

  splitter.addEventListener("sizes-change-end", (event) => {
    end.textContent = `第 ${event.detail.index} 条 → ${format(event.detail.sizes)}`;
  });

  document.getElementById("splitter-controlled-reset").addEventListener("click", () => {
    splitter.sizes = [30, 70];
    now.textContent = format([30, 70]);
  });
</script>
```

### 竖排与折叠

orientation 换轴后方向键跟着换，collapsible 的面板在它的分隔条上按 Enter 折叠

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

// 中间那栏可折叠：折叠后带上 data-collapsed，收到 collapsedSize
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
    style="inline-size: 100%; block-size: 220px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">顶栏：min 10%，不可折叠。</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">
        中间这栏可折叠：焦点落到它下面那条分隔条上按 Enter 折叠，再按一次回到折叠前的尺寸。
      </p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="1" />
    <XhSplitterPanel :index="2">
      <p style="padding: 12px">底栏：min 10%。</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<!-- 中间那栏可折叠：折叠后带上 data-collapsed，收到 collapsedSize -->
<xh-splitter
  panels='[{"id":"top","min":10},{"id":"middle","min":10,"collapsible":true,"collapsedSize":0},{"id":"bottom","min":10}]'
  orientation="vertical"
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: 100%; block-size: 220px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">顶栏：min 10%，不可折叠。</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <p style="padding: 12px">
        中间这栏可折叠：焦点落到它下面那条分隔条上按 Enter 折叠，再按一次回到折叠前的尺寸。
      </p>
    </div>
    <div data-xh-part="resize-trigger" index="1"></div>
    <div data-xh-part="panel" index="2">
      <p style="padding: 12px">底栏：min 10%。</p>
    </div>
  </div>
</xh-splitter>
```

### 禁用

disabled 后拖不动也推不动，分隔条整个退出 Tab 序列，方向键放行给页面

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
    style="inline-size: 100%; block-size: 120px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">侧栏</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">正文</p>
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
  <div data-xh-part="root" style="inline-size: 100%; block-size: 120px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">侧栏</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <p style="padding: 12px">正文</p>
    </div>
  </div>
</xh-splitter>
```

### 嵌套

面板里再放一套分栏即可拆出第二根轴，里外两层各管各的尺寸，互不干涉

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
  <XhSplitterRoot :panels="outer" style="inline-size: 100%; block-size: 220px">
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">侧栏</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger :index="0" />
    <XhSplitterPanel :index="1">
      <!-- 内层是另一套分栏：跨轴尺寸取满外层这一格 -->
      <XhSplitterRoot
        :panels="inner"
        orientation="vertical"
        style="inline-size: 100%; block-size: 100%"
      >
        <XhSplitterPanel :index="0">
          <p style="padding: 12px">编辑区</p>
        </XhSplitterPanel>
        <XhSplitterResizeTrigger :index="0" />
        <XhSplitterPanel :index="1">
          <p style="padding: 12px">输出区</p>
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
  <div data-xh-part="root" style="inline-size: 100%; block-size: 220px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">侧栏</p>
    </div>
    <div data-xh-part="resize-trigger" index="0"></div>
    <div data-xh-part="panel" index="1">
      <!-- 内层是另一套分栏：跨轴尺寸取满外层这一格 -->
      <xh-splitter
        panels='[{"id":"editor","min":20},{"id":"console","min":15}]'
        orientation="vertical"
        style="display: contents"
      >
        <div data-xh-part="root" style="inline-size: 100%; block-size: 100%">
          <div data-xh-part="panel" index="0">
            <p style="padding: 12px">编辑区</p>
          </div>
          <div data-xh-part="resize-trigger" index="0"></div>
          <div data-xh-part="panel" index="1">
            <p style="padding: 12px">输出区</p>
          </div>
        </div>
      </xh-splitter>
    </div>
  </div>
</xh-splitter>
```

### 分隔条里放内容

分隔条内可以再摆一个把手，粗细由 --xh-splitter-trigger-thickness 让出位置

```vue
<script setup lang="ts">
import {
  XhSplitterPanel,
  XhSplitterResizeTrigger,
  XhSplitterRoot,
} from "@xihan-ui/vue";

const panels = [
  { id: "list", min: 25, max: 75 },
  { id: "detail", min: 25 },
];
const defaultSize = [40, 60];

// 把手不参与命中判定，指针与键盘照旧落在分隔条自己身上
const gripStyle = {
  fontSize: "12px",
  lineHeight: "1",
  color: "var(--xh-fg-muted)",
};
</script>

<template>
  <XhSplitterRoot
    :panels="panels"
    :default-sizes="defaultSize"
    style="inline-size: 100%; block-size: 140px"
  >
    <XhSplitterPanel :index="0">
      <p style="padding: 12px">列表</p>
    </XhSplitterPanel>
    <XhSplitterResizeTrigger
      :index="0"
      style="--xh-splitter-trigger-thickness: 14px"
    >
      <span aria-hidden="true" :style="gripStyle">⋮⋮</span>
    </XhSplitterResizeTrigger>
    <XhSplitterPanel :index="1">
      <p style="padding: 12px">详情</p>
    </XhSplitterPanel>
  </XhSplitterRoot>
</template>
```

```html
<xh-splitter
  panels='[{"id":"list","min":25,"max":75},{"id":"detail","min":25}]'
  default-sizes="40,60"
  style="display: contents"
>
  <div data-xh-part="root" style="inline-size: 100%; block-size: 140px">
    <div data-xh-part="panel" index="0">
      <p style="padding: 12px">列表</p>
    </div>
    <!-- 把手不参与命中判定，指针与键盘照旧落在分隔条自己身上 -->
    <div
      data-xh-part="resize-trigger"
      index="0"
      style="--xh-splitter-trigger-thickness: 14px"
    >
      <span aria-hidden="true" style="font-size: 12px; line-height: 1; color: var(--xh-fg-muted)">⋮⋮</span>
    </div>
    <div data-xh-part="panel" index="1">
      <p style="padding: 12px">详情</p>
    </div>
  </div>
</xh-splitter>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-splitter>` |
| Vue 组件 | `XhSplitterPanel` `XhSplitterResizeTrigger` `XhSplitterRoot` |
| 组合式函数 | `useSplitter` |
| 状态机 | `splitterMachine` |
| 皮肤 | `@xihan-ui/styles/splitter.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="splitter"`：**`root`** · **`panel`** · **`resize-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `sizes` | `number[]` |  | 每块面板的百分比。给定即受控：内部不再自改，只发 onSizesChange。 |
| `defaultSizes` | `number[]` |  | 非受控初值；不给就按面板数等分。 |
| `panels` | `SplitterPanelProps[]` |  | 逐块的约束；数组长度同时决定面板块数。 |
| `orientation` | `Orientation` |  | 面板的排布轴，默认 horizontal（并排，拖左右）；vertical 是上下堆叠，拖上下。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只对调水平排布下的左右两键与指针位移的正负。 |
| `disabled` | `boolean` |  | 禁用：分隔条退出 Tab 序列、拖不动也推不动。 |
| `step` | `number` |  | 方向键的步长（百分比），默认 1。 |
| `largeStep` | `number` |  | Shift + 方向键的步长（百分比），默认 10。 |
| `translations` | `Partial<SplitterTranslations>` |  |  |
| `onSizesChange` | `(details: SplitterSizesChangeDetails) => void` |  | 每次尺寸变化都发；拖动过程中会连续发很多次。 |
| `onSizesChangeEnd` | `(details: SplitterSizesChangeEndDetails) => void` |  | 只在一次操作结束时发一次，适合拿来存布局。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sizes-change` | `SplitterSizesChangeDetails` | 布局变化（拖动途中会连发）；detail 为 `{ sizes: number[] }` |
| `sizes-change-end` | `SplitterSizesChangeEndDetails` | 一次拖拽收尾发一次；detail 为 `{ sizes: number[], index: number }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhSplitterRoot` | `default` | `SplitterRootSlotProps` |  |

## 状态

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `dragging`

**事件**：`SIZES.SET` · `BOUNDARY.STEP` · `BOUNDARY.TO_MIN` · `BOUNDARY.TO_MAX` · `BOUNDARY.SET` · `BOUNDARY.FOCUS` · `PANEL.COLLAPSE` · `PANEL.EXPAND` · `DRAG.START` · `DRAG.MOVE` · `DRAG.END` · `DRAG.CANCEL`

**判据**：`canResize`

## connect API

`useSplitter` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `sizes` | `number[]` |  |
| `panels` | `SplitterPanelState[]` |  |
| `dragging` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setSizes` | `(next: number[]) => void` | 整份赋值：逐块夹进约束、总和归位到 100 之后才落地。 |
| `setPanelSize` | `(index: number, next: number) => void` | 把第 index 块调到 next，缺的那部分从它后面的面板里取。 最后一块没有属于自己的分隔条，它的尺寸是其余面板的余数，调不动。 |
| `collapsePanel` | `(index: number) => void` |  |
| `expandPanel` | `(index: number) => void` |  |
| `togglePanel` | `(index: number) => void` | 折叠着就展开、展开着就折叠；不可折叠的面板上是空操作。 |
| `getRootProps` | `() => T['element']` |  |
| `getPanelProps` | `(index: number) => T['element']` |  |
| `getResizeTriggerProps` | `(index: number) => T['element']` | 第 index 条分隔条坐在第 index 与第 index+1 块面板之间，调整的是前一块。 |

## 键盘

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

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

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

## 样式

默认皮肤 `@xihan-ui/styles/splitter.css` 按部件选择：`[data-scope="splitter"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `panel` | `data-collapsed` | ''（条件成立时才出现） |
| `panel` | `data-index` | String(panel.index) |
| `resize-trigger` | `data-dragging` | ''（条件成立时才出现） |
| `resize-trigger` | `data-index` | String(boundary) |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-splitter-disabled-opacity` · `--xh-splitter-radius` · `--xh-splitter-trigger-bg` · `--xh-splitter-trigger-bg-disabled` · `--xh-splitter-trigger-bg-dragging` · `--xh-splitter-trigger-bg-hover` · `--xh-splitter-trigger-thickness`

## 动效

`background` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 面板里放[滚动区域](./scroll-area)，让每一片各自滚动。

## 最佳实践

- 给每块面板设最小尺寸，否则能被拖到完全看不见、也拖不回来。
- 存布局用 `onSizesChangeEnd`：拖动途中的每一帧都写存储会把主线程拖垮。

## 反模式

- 拿它做固定比例的两栏布局：多出来的拖动能力只会让用户误操作。
- 分隔条做得只有一两个像素宽：指针命中率极低。
