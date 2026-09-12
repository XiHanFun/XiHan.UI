来源：https://ui.docs.xihanfun.com/components/masonry

# Masonry `瀑布流`

等宽不等高的一批项，按最短列优先落进若干列，列数可随容器宽度换档。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/masonry" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/masonry.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/masonry" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/masonry" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/masonry.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

等宽不等高的项按最短列优先落进三列，底边尽量齐平

```vue
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "甲", height: 90 },
  { label: "乙", height: 140 },
  { label: "丙", height: 60 },
  { label: "丁", height: 110 },
  { label: "戊", height: 70 },
  { label: "己", height: 150 },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md">
    <div
      v-for="c in cards"
      :key="c.label"
      :style="`${cardStyle}; block-size: ${c.height}px`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
```

```html
<style>
  #masonry-basic [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上；列写成空容器，项由元素搬进去 -->
<!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
<xh-masonry id="masonry-basic" columns="3" gap="md" style="display: contents">
  <div data-xh-part="root">
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>

    <div data-xh-part="item"><div data-card style="block-size: 90px">甲</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 140px">乙</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 60px">丙</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 110px">丁</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 70px">戊</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 150px">己</div></div>
  </div>
</xh-masonry>
```

## 示例

### 逐档列数

列数写成断点对象，按容器自身的宽度换档：窄栏一列，宽到 md 两列，宽到 lg 四列

```vue
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "甲", height: 80 },
  { label: "乙", height: 130 },
  { label: "丙", height: 60 },
  { label: "丁", height: 100 },
  { label: "戊", height: 90 },
  { label: "己", height: 120 },
  { label: "庚", height: 70 },
  { label: "辛", height: 110 },
];
</script>

<template>
  <XhMasonry :columns="{ base: 1, md: 2, lg: 4 }" gap="md">
    <div
      v-for="c in cards"
      :key="c.label"
      :style="`${cardStyle}; block-size: ${c.height}px`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
```

```html
<style>
  #masonry-columns [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
</style>

<!-- 列数写成 JSON 对象；列按最宽那一档写足四个，当前档位用不上的会被收起 -->
<!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
<xh-masonry
  id="masonry-columns"
  columns='{"base":1,"md":2,"lg":4}'
  gap="md"
  style="display: contents"
>
  <div data-xh-part="root">
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>

    <div data-xh-part="item"><div data-card style="block-size: 80px">甲</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 130px">乙</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 60px">丙</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 100px">丁</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 90px">戊</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 120px">己</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 70px">庚</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 110px">辛</div></div>
  </div>
</xh-masonry>
```

### 间距档位

gap 一档管两处：列与列之间、同一列里项与项之间，留白始终对齐

```vue
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";
import { ref } from "vue";

const cardStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const gaps = ["xs", "sm", "md", "lg", "xl"] as const;
const gap = ref<(typeof gaps)[number]>("md");

const cards = [
  { label: "甲", height: 80 },
  { label: "乙", height: 120 },
  { label: "丙", height: 60 },
  { label: "丁", height: 100 },
  { label: "戊", height: 90 },
  { label: "己", height: 70 },
];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button
        v-for="g in gaps"
        :key="g"
        type="button"
        :aria-pressed="g === gap"
        :style="`padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: ${g === gap ? 'var(--xh-bg-brand)' : 'transparent'}; color: ${g === gap ? 'var(--xh-fg-on-brand)' : 'var(--xh-fg-default)'}`"
        @click="gap = g"
      >
        {{ g }}
      </button>
    </div>

    <XhMasonry :columns="3" :gap="gap">
      <div
        v-for="c in cards"
        :key="c.label"
        :style="`${cardStyle}; block-size: ${c.height}px`"
      >
        {{ c.label }}
      </div>
    </XhMasonry>
  </div>
</template>
```

```html
<style>
  #masonry-gap-demo [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }

  #masonry-gap-demo [data-gap-button] {
    padding: 4px 10px;
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-radius-sm);
    background: transparent;
    color: var(--xh-fg-default);
  }

  #masonry-gap-demo [data-gap-button][aria-pressed="true"] {
    background: var(--xh-bg-brand);
    color: var(--xh-fg-on-brand);
  }
</style>

<div id="masonry-gap-demo" style="display: flex; flex-direction: column; gap: 12px">
  <div style="display: flex; gap: 8px">
    <button type="button" data-gap-button value="xs">xs</button>
    <button type="button" data-gap-button value="sm">sm</button>
    <button type="button" data-gap-button value="md" aria-pressed="true">md</button>
    <button type="button" data-gap-button value="lg">lg</button>
    <button type="button" data-gap-button value="xl">xl</button>
  </div>

  <!-- 宿主设 display: contents，排布落在 root 上 -->
  <!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
  <xh-masonry id="masonry-gap" columns="3" gap="md" style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>

      <div data-xh-part="item"><div data-card style="block-size: 80px">甲</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 120px">乙</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 60px">丙</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 100px">丁</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 90px">戊</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 70px">己</div></div>
    </div>
  </xh-masonry>
</div>

<script type="module">
  const host = document.getElementById("masonry-gap");
  const buttons = document.querySelectorAll("#masonry-gap-demo [data-gap-button]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      host.gap = button.value;
      for (const other of buttons) {
        other.setAttribute("aria-pressed", String(other === button));
      }
    });
  }
</script>
```

### 逐列填

打开 sequential 后项按文档序成段落进各列，读起来是「先走完左列，再走下一列」

```vue
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";

const cardStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

const cards = [
  { label: "1", height: 70 },
  { label: "2", height: 120 },
  { label: "3", height: 60 },
  { label: "4", height: 100 },
  { label: "5", height: 80 },
  { label: "6", height: 110 },
];
</script>

<template>
  <XhMasonry :columns="3" gap="md" sequential>
    <div
      v-for="c in cards"
      :key="c.label"
      :style="`${cardStyle}; block-size: ${c.height}px`"
    >
      {{ c.label }}
    </div>
  </XhMasonry>
</template>
```

```html
<style>
  #masonry-sequential [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }
</style>

<!-- 宿主设 display: contents，排布落在 root 上 -->
<!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
<xh-masonry
  id="masonry-sequential"
  columns="3"
  gap="md"
  sequential
  style="display: contents"
>
  <div data-xh-part="root">
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>
    <div data-xh-part="column"></div>

    <div data-xh-part="item"><div data-card style="block-size: 70px">1</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 120px">2</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 60px">3</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 100px">4</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 80px">5</div></div>
    <div data-xh-part="item"><div data-card style="block-size: 110px">6</div></div>
  </div>
</xh-masonry>
```

### 动态增删

项增删后重新量高、重新落格；新项排在末尾，摘掉一项后其余项会补位

```vue
<script setup lang="ts">
import { XhMasonry } from "@xihan-ui/vue";
import { ref } from "vue";

const cardStyle
  = "padding: 12px; border-radius: var(--xh-radius-md); background: var(--xh-bg-subtle); color: var(--xh-fg-default)";

let seq = 4;
const cards = ref([
  { id: 1, height: 90 },
  { id: 2, height: 140 },
  { id: 3, height: 60 },
]);

function add() {
  // 先取号再算高度：对象字面量按书写顺序求值，写成 id: seq++ 会让 height 读到自增后的号
  const id = seq++;
  // 高度在 60–160 之间挑一个，好看出落格是按高度定的
  cards.value.push({ id, height: 60 + ((id * 37) % 100) });
}

function removeLast() {
  cards.value.pop();
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 8px">
      <button
        type="button"
        style="padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: transparent; color: var(--xh-fg-default)"
        @click="add"
      >
        添加一项
      </button>
      <button
        type="button"
        style="padding: 4px 10px; border-radius: var(--xh-radius-sm); border: 1px solid var(--xh-border-default); background: transparent; color: var(--xh-fg-default)"
        @click="removeLast"
      >
        摘掉末项
      </button>
    </div>

    <XhMasonry :columns="3" gap="md">
      <div
        v-for="c in cards"
        :key="c.id"
        :style="`${cardStyle}; block-size: ${c.height}px`"
      >
        {{ c.id }}
      </div>
    </XhMasonry>
  </div>
</template>
```

```html
<style>
  #masonry-dynamic-demo [data-card] {
    padding: 12px;
    border-radius: var(--xh-radius-md);
    background: var(--xh-bg-subtle);
    color: var(--xh-fg-default);
  }

  #masonry-dynamic-demo [data-action] {
    padding: 4px 10px;
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-radius-sm);
    background: transparent;
    color: var(--xh-fg-default);
  }
</style>

<div id="masonry-dynamic-demo" style="display: flex; flex-direction: column; gap: 12px">
  <div style="display: flex; gap: 8px">
    <button type="button" data-action value="add">添加一项</button>
    <button type="button" data-action value="remove">摘掉末项</button>
  </div>

  <!-- 宿主设 display: contents，排布落在 root 上 -->
  <!-- item 只做承重的盒子，卡片样式落在它的子节点上，与 Vue 版铺出来的结构一致 -->
  <xh-masonry id="masonry-dynamic" columns="3" gap="md" style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>
      <div data-xh-part="column"></div>

      <div data-xh-part="item"><div data-card style="block-size: 90px">1</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 140px">2</div></div>
      <div data-xh-part="item"><div data-card style="block-size: 60px">3</div></div>
    </div>
  </xh-masonry>
</div>

<script type="module">
  const root = document.querySelector("#masonry-dynamic [data-xh-part='root']");
  let seq = 4;

  // 新项写进 root 就行，元素会把它搬进某一列；先来后到即项的原序
  // item 只做承重的盒子，卡片是它的子节点，与 Vue 版铺出来的结构一致
  function add() {
    const id = seq++;
    const item = document.createElement("div");
    item.dataset.xhPart = "item";
    const card = document.createElement("div");
    card.setAttribute("data-card", "");
    card.style.blockSize = `${60 + ((id * 37) % 100)}px`;
    card.textContent = String(id);
    item.append(card);
    root.append(item);
  }

  // DOM 序等于列序，末项要按 data-index（作者写的原序）找
  function removeLast() {
    const items = [...root.querySelectorAll("[data-xh-part='item']")];
    if (!items.length) return;
    items.sort((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
    items[items.length - 1].remove();
  }

  for (const button of document.querySelectorAll("#masonry-dynamic-demo [data-action]")) {
    button.addEventListener("click", () => {
      if (button.value === "add") add();
      else removeLast();
    });
  }
</script>
```

## 设计指引

### 何时使用

- 图片墙、卡片流：每一项宽度一致、高度由内容决定，希望底边尽量齐平。
- 摘要列表：文字长短不一，不想被强行拉成等高的格子。

### 何时不用

- 每一项高度一致，或需要跨列跨行：用[栅格](./grid)，它是二维规则网格，还能跨列与错列。
- 只想让一排东西之间留白：用[弹性布局](./flex)。
- 上万条数据要滚动：瀑布流会把每一项都渲出来并逐一量高，改用[虚拟滚动](./virtualizer)。

### 特性

- 两种落格策略：缺省最短列优先，底边最齐；`sequential` 打开后按文档序逐列填，读起来是「先走完左列，再走下一列」。
- 列数可写成断点对象 `{ base, sm, md, lg, xl }`，档位名与栅格同一套。
- 落格算法是一个不碰 DOM 的纯函数，量高度归适配器；同一批高度在两个适配器上算出同一副版面。
- 两个适配器的作者侧写法不同，最终 DOM 一致：Vue 侧只写内容，列的盒子与每一项的盒子都由组件铺；Web Components 侧元素不生成结构，列与项都要作者写进标记，元素只负责把项搬进对应的列。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-masonry>` |
| Vue 组件 | `XhMasonry` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/masonry.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="masonry"`：**`root`** · **`column`** · `item`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `MasonryColumns` |  | 分几列，不写按三列。也收断点对象 `{ base, sm, md, lg, xl }`，逐档写各自的列数， 没写的档沿用比它窄的那一档。换档看的是容器自身的宽度，不是视口宽度。 |
| `gap` | `MasonryGap` |  | 列与列、项与项之间的间距档位：xs / sm / md / lg / xl，不写则不留间距。档位换算成多少由皮肤定。 |
| `sequential` | `boolean` |  | 按文档序逐列填：项成段落进各列，读起来仍是「先走完左列，再走下一列」。 不写则最短列优先，视觉上更齐平，但相邻的两项未必挨着。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getColumnProps` | `(props: MasonryColumnProps) => T['element']` |  |
| `getItemProps` | `(props: MasonryItemProps) => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

- 落格会**物理重排 DOM**：两个适配器都把项挪进列里，所以朗读序与 Tab 序自此等于列序——先走完第 0 列，再走下一列。作者数组里的第 2 项很可能要等第 5 项念完才轮到。
- 顺序有意义的内容（步骤、排行榜、时间线）请打开 `sequential`：项按文档序成段落进各列，段内保持作者写的先后，朗读与 Tab 只在换列处跳一次。
- 根上不写 `role`，容器只管排布。里面装的若是一份语义列表，请由作者自己在项里写出对应的语义。
- 项里若有可聚焦的控件，重排会把焦点连节点一起搬走；浏览器不为节点移动派 `focusout`，读屏用户会突然失去落点。需要焦点稳定请改用[栅格](./grid)。

## 样式

默认皮肤 `@xihan-ui/styles/masonry.css` 按部件选择：`[data-scope="masonry"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-gap` | props.gap |
| `root` | `data-sequential` | ''（条件成立时才出现） |
| `column` | `data-index` | String(column.index) |
| `item` | `data-column` | String(item.column) |
| `item` | `data-index` | String(item.index) |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-masonry-gap` | `column`<br>`root` | `gap` | `default`<br>`gap=lg`<br>`gap=md`<br>`gap=sm`<br>`gap=xl`<br>`gap=xs` | `--xh-layout-gap-lg`<br>`--xh-layout-gap-md`<br>`--xh-layout-gap-sm`<br>`--xh-layout-gap-xl`<br>`--xh-layout-gap-xs`<br>`--xh-space-0` | masonry 的 column、root 部件 gap 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 响应式

- 换档看的是**容器自身的宽度**，不是视口宽度：窄栏里的瀑布流不会因为窗口宽就分成三列。
- 断点对象没写 `base` 时按缺省的三列起步，**不像栅格那样回落到一列**：`{ md: 4 }` 读作「窄时三列、md 起四列」。要窄时一列请显式写 `base: 1`。
- 容器改宽、项的内容改高，都会重新量并重排；浏览器不支持 `ResizeObserver` 时不再跟随尺寸变化——Vue 适配器停在挂载与每次更新那一刻量到的高度，Web Components 元素则每次接线时量一遍。

## RTL

- 列的先后跟着书写方向走：`dir="rtl"` 下第 0 列在最右边，列内仍自上而下。
- 项与列之间的间距全部走逻辑属性，不需要为 RTL 另写规则。

## 组合

- 每一项里放[卡片](./card)或[图片](./image)最常见；图片请写明宽高比，否则加载完成前量到的高度是 0，加载完成后会重排一次。
- 一项里放[骨架屏](./skeleton)占位时，请让骨架的高度接近真实内容，减少一次大的重排。

## 最佳实践

- 重排会把某一项挪进另一列。Vue 适配器上这一项会被重新挂载，项里别放不可重建的状态（正在播放的视频、没提交的输入）。
- 摘掉一项后焦点会掉回 `<body>`，键盘与读屏用户每摘一次就丢一次位置。组件不接管这件事，删除按钮请自己把焦点交给下一项或列表容器。
- 图片一律写 `width` / `height` 或 `aspect-ratio`：不写就要等图片加载完才量得到真实高度，一屏图片会引起一整轮重排。
- Web Components 侧请按最宽那一档需要的列数写足 `column` 节点：元素不生成结构，手上没有的列变不出来，当前档位用不上的那几列会被自动收起。`column` 必须是空容器，项由元素搬进去。
- Web Components 侧项的先后取「首次见到的顺序」：静态标记就是作者写的顺序，运行期新增的项排在末尾。要把新项插到中间，请整块重建这批项。

## 反模式

- 用 CSS 的 `columns` 代替本组件：那是竖向分栏，阅读顺序是「一列读到底再读下一列」，与最短列优先的落格顺序对不上。
- 把有先后关系的内容（步骤、排行榜）放进最短列优先的瀑布流：作者写的先后不再是朗读与 Tab 的先后。要保住顺序请打开 `sequential`。
- 项与项之间用外边距拉开距离：间距由 `gap` 档位统一给，自己写外边距会让列内与列间的留白对不齐。
