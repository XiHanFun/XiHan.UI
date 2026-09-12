来源：https://ui.docs.xihanfun.com/components/truncate

# Truncate `文本截断`

放不下的文本收成省略号，并把"到底有没有被裁掉"如实报出来。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/truncate" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/truncate.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/truncate" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/truncate" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/truncate.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一行放不下就收成省略号；有没有被裁如实报出来

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
import { ref } from "vue";

const width = ref(240);
const overflowing = ref(false);
const text
  = "订单 2024-0731-8842 已由杭州仓发出，预计明日 18:00 前送达，签收前请当面核对包装。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      容器宽度
      <input v-model.number="width" type="range" min="120" max="640" step="20">
      {{ width }}px
    </label>

    <!-- 盒子越窄裁得越多。量测跟着容器尺寸走，拖动过程中结论一直是准的 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhTruncate @overflow-change="overflowing = $event.overflowing">
        {{ text }}
      </XhTruncate>
    </div>

    <p style="margin: 0; color: var(--xh-fg-muted)">
      此刻 {{ overflowing ? "被裁掉了一截" : "整段都放得下" }}
    </p>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%">
  <label style="display: flex; align-items: center; gap: 8px">
    容器宽度
    <input
      id="truncate-basic-width"
      type="range"
      min="120"
      max="640"
      step="20"
      value="240"
    />
    <span id="truncate-basic-width-text">240px</span>
  </label>

  <!-- 盒子越窄裁得越多。量测跟着容器尺寸走，拖动过程中结论一直是准的 -->
  <div id="truncate-basic-box" style="inline-size: 240px; max-inline-size: 100%">
    <!-- root 的内联 style 归组件写，作者自己的尺寸声明写在外层 -->
    <xh-truncate id="truncate-basic">
      <div data-xh-part="root">
        订单 2024-0731-8842 已由杭州仓发出，预计明日 18:00
        前送达，签收前请当面核对包装。
      </div>
    </xh-truncate>
  </div>

  <p style="margin: 0; color: var(--xh-fg-muted)">
    此刻 <span id="truncate-basic-state">整段都放得下</span>
  </p>
</div>

<script type="module">
  // 拖动滑杆改外层宽度，结论由 overflow-change 报回来
  const box = document.getElementById("truncate-basic-box");
  const slider = document.getElementById("truncate-basic-width");
  const widthText = document.getElementById("truncate-basic-width-text");
  const state = document.getElementById("truncate-basic-state");

  slider.addEventListener("input", () => {
    box.style.inlineSize = `${slider.value}px`;
    widthText.textContent = `${slider.value}px`;
  });

  document
    .getElementById("truncate-basic")
    .addEventListener("overflow-change", (event) => {
      state.textContent = event.detail.overflowing
        ? "被裁掉了一截"
        : "整段都放得下";
    });
</script>
```

## 示例

### 行数

lines 为 1 走单行省略，大于 1 按行数裁，末行收省略号

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
import { ref } from "vue";

const lines = ref(2);
const text
  = "这条商品说明写得很长：材质为 100% 长绒棉，机洗需用中性洗涤剂，不可漂白，"
    + "低温熨烫，深浅色分开洗涤，首次下水建议单独清洗以免染色。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <label style="display: flex; align-items: center; gap: 8px">
      夹几行
      <input v-model.number="lines" type="range" min="1" max="5" step="1">
      {{ lines }}
    </label>

    <!-- 换行数就是换了一把尺，组件会自己重量一次，不必手动触发 -->
    <XhTruncate :lines="lines">{{ text }}</XhTruncate>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <label style="display: flex; align-items: center; gap: 8px">
    夹几行
    <input id="truncate-lines-input" type="range" min="1" max="5" step="1" value="2" />
    <span id="truncate-lines-text">2</span>
  </label>

  <!-- 换行数就是换了一把尺，组件会自己重量一次，不必手动触发 -->
  <xh-truncate id="truncate-lines" lines="2">
    <div data-xh-part="root">
      这条商品说明写得很长：材质为 100%
      长绒棉，机洗需用中性洗涤剂，不可漂白，低温熨烫，深浅色分开洗涤，首次下水建议单独清洗以免染色。
    </div>
  </xh-truncate>
</div>

<script type="module">
  // 滑杆改的就是 lines 属性
  const host = document.getElementById("truncate-lines");
  const slider = document.getElementById("truncate-lines-input");
  const text = document.getElementById("truncate-lines-text");

  slider.addEventListener("input", () => {
    host.setAttribute("lines", slider.value);
    text.textContent = slider.value;
  });
</script>
```

### 点击展开

expandable 让整块文字变成一颗按钮，Enter / Space 也按得动

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
import { ref } from "vue";

const expanded = ref(false);
const text
  = "这次更新把导出改成了后台任务：点导出后先落一条记录，处理完再推通知，"
    + "中途关掉页面也不影响；文件保留 7 天，过期由清理任务回收。";
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
    <!-- v-model:open 走受控：状态在外面，组件只发意图 -->
    <XhTruncate v-model:open="expanded" :lines="2" expandable>
      {{ text }}
    </XhTruncate>

    <button type="button" style="justify-self: start" @click="expanded = !expanded">
      {{ expanded ? "收回去" : "在外面展开" }}
    </button>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: 100%; max-inline-size: 420px">
  <!-- 写了 open 就是受控：状态在外面，组件只发意图 -->
  <xh-truncate id="truncate-expandable" lines="2" expandable open="false">
    <div data-xh-part="root">
      这次更新把导出改成了后台任务：点导出后先落一条记录，处理完再推通知，中途关掉页面也不影响；文件保留
      7 天，过期由清理任务回收。
    </div>
  </xh-truncate>

  <button id="truncate-expandable-toggle" type="button" style="justify-self: start">
    在外面展开
  </button>
</div>

<script type="module">
  // 展开状态握在外面，组件发的意图写回去才算数
  const host = document.getElementById("truncate-expandable");
  const toggle = document.getElementById("truncate-expandable-toggle");
  let expanded = false;

  function setOpen(next) {
    expanded = next;
    host.open = next;
    toggle.textContent = next ? "收回去" : "在外面展开";
  }

  host.addEventListener("open-change", (event) =>
    setOpen(event.detail.open)
  );
  toggle.addEventListener("click", () => setOpen(!expanded));
</script>
```

### 溢出才提示

上面套 Tooltip 按 overflow-change 开关，下面用 tooltip 交给平台的原生提示

```vue
<script setup lang="ts">
import {
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
  XhTruncate,
} from "@xihan-ui/vue";
import { ref } from "vue";

const width = ref(200);
const overflowing = ref(false);
const text = "配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室";

// 触发器本身是按钮，这里让它按普通文字那样铺满一行
const asText = {
  display: "block",
  inlineSize: "100%",
  padding: "0",
  border: "0",
  background: "none",
  font: "inherit",
  color: "inherit",
  textAlign: "start",
  cursor: "default",
};
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: 100%">
    <label style="display: flex; align-items: center; gap: 8px">
      容器宽度
      <input v-model.number="width" type="range" min="120" max="560" step="20">
      {{ width }}px
    </label>

    <!-- 组件只报「被裁了没有」，浮层归 Tooltip；没被裁时把提示整个关掉 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhTooltipRoot :disabled="!overflowing">
        <XhTooltipTrigger :style="asText">
          <XhTruncate @overflow-change="overflowing = $event.overflowing">
            {{ text }}
          </XhTruncate>
        </XhTooltipTrigger>
        <XhTooltipPositioner>
          <XhTooltipContent>{{ text }}</XhTooltipContent>
        </XhTooltipPositioner>
      </XhTooltipRoot>
    </div>

    <!-- 不想要浮层就开 tooltip：被裁时整段文字写进 title，交给平台自己的提示 -->
    <div :style="{ inlineSize: `${width}px`, maxInlineSize: '100%' }">
      <XhTruncate tooltip>{{ text }}</XhTruncate>
    </div>
  </div>
</template>
```

```html
<div id="truncate-tip" style="display: grid; gap: 16px; inline-size: 100%">
  <label style="display: flex; align-items: center; gap: 8px">
    容器宽度
    <input
      id="truncate-tip-width"
      type="range"
      min="120"
      max="560"
      step="20"
      value="200"
    />
    <span id="truncate-tip-width-text">200px</span>
  </label>

  <!-- 组件只报「被裁了没有」，浮层归 Tooltip；没被裁时把提示整个关掉 -->
  <div class="truncate-tip-box" style="inline-size: 200px; max-inline-size: 100%">
    <xh-tooltip id="truncate-tip-tooltip" disabled>
      <!-- 触发器本身是按钮，这里让它按普通文字那样铺满一行 -->
      <button
        data-xh-part="trigger"
        style="
          display: block;
          inline-size: 100%;
          padding: 0;
          border: 0;
          background: none;
          font: inherit;
          color: inherit;
          text-align: start;
          cursor: default;
        "
      >
        <xh-truncate id="truncate-tip-source">
          <div data-xh-part="root">
            配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室
          </div>
        </xh-truncate>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室
        </div>
      </div>
    </xh-tooltip>
  </div>

  <!-- 不想要浮层就开 tooltip：被裁时整段文字写进 title，交给平台自己的提示 -->
  <div class="truncate-tip-box" style="inline-size: 200px; max-inline-size: 100%">
    <xh-truncate tooltip>
      <div data-xh-part="root">
        配送地址：浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室
      </div>
    </xh-truncate>
  </div>
</div>

<script type="module">
  // 没被裁就把提示整个关掉，被裁了才放它出来
  const slider = document.getElementById("truncate-tip-width");
  const widthText = document.getElementById("truncate-tip-width-text");
  const tooltip = document.getElementById("truncate-tip-tooltip");
  const boxes = document
    .getElementById("truncate-tip")
    .querySelectorAll(".truncate-tip-box");

  slider.addEventListener("input", () => {
    for (const box of boxes) {
      box.style.inlineSize = `${slider.value}px`;
    }
    widthText.textContent = `${slider.value}px`;
  });

  document
    .getElementById("truncate-tip-source")
    .addEventListener("overflow-change", (event) => {
      tooltip.disabled = !event.detail.overflowing;
    });
</script>
```

## 设计指引

### 何时使用

- 表格单元格、列表项、面包屑末段这类宽度不由内容决定的位置。
- 需要在真被裁掉时才给出完整文本的提示。

### 何时不用

- 文本必须完整可读（价格、编号、错误原因）：换布局，别裁。
- 要裁的是一整块正文并需要"展开全文"的阅读体验：可以用本组件的 `expandable`，但更长的正文交给[排印](./typography)加自己的折叠。

### 特性

- `lines` 为 1 走单行省略，大于 1 按行数裁、末行收省略号。
- 溢出结论会实测并在翻面时回调；容器尺寸、正文节点和所属文档的字体加载完成都会触发重量，不靠猜。
- `expandable` 让整块文字变成一颗按钮，Enter / Space 也按得动。
- `tooltip` 在真被裁掉时把整段文字交给平台的原生提示。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-truncate>` |
| Vue 组件 | `XhTruncate` |
| 组合式函数 | `useTruncate` |
| 状态机 | `truncateMachine` |
| 皮肤 | `@xihan-ui/styles/truncate.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="truncate"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lines` | `number` |  | 夹几行，1 为单行，默认 1。 |
| `expandable` | `boolean` |  | 点一下铺开全文。 |
| `open` | `boolean` |  | 受控展开；缺省即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控时的初始展开态。 |
| `tooltip` | `boolean` |  | 真被裁掉了才把整段文字交给平台的原生提示。 |
| `onOpenChange` | `(details: TruncateOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onOverflowChange` | `(details: TruncateOverflowChangeDetails) => void` |  | 量出来的溢出结论翻面时回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TruncateOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |
| `overflow-change` | `TruncateOverflowChangeDetails` | 溢出结论翻面；detail 为 `{ overflowing: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTruncate` | `default` | `TruncateSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `open`

**事件**：`MEASURE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useTruncate` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 此刻是不是铺开了全文。 |
| `overflowing` | `boolean` | 夹住的那一版有没有被裁掉内容。作者据此决定要不要套一层提示。 |
| `setOpen` | `(next: boolean) => void` | 程序化展开 / 收回，与点一下走同一条路。 |
| `measure` | `() => void` | 手动重量一次：字体到位、外层换了布局这类观察器看不见的变化，由作者补一枪。 |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | expandable，焦点在 root 上 | 铺开全文 / 收回夹住的那一版；Space 拦掉翻页的默认动作 |
| `Tab` / `Shift+Tab` | expandable | 停到这块文字上；不可展开时它不带 tabindex，不在 Tab 序列里 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-expanded` | 'true' \| 'false' |
| `root` | `role` | 'button' |

## 样式

默认皮肤 `@xihan-ui/styles/truncate.css` 按部件选择：`[data-scope="truncate"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-expandable` | ''（条件成立时才出现） |
| `root` | `data-lines` | String(lines) |
| `root` | `data-multiline` | ''（条件成立时才出现） |
| `root` | `data-overflowing` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-truncate-lines` | `root` | `-webkit-line-clamp` | `multiline` | `--xh-_truncate-lines` | truncate 的 root 部件 -webkit-line-clamp 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

`color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 组合

- 外面套[文字提示](./tooltip)，按溢出回调开关，可以拿到与站点一致的提示样式。

## 最佳实践

- 只在裁掉时才给提示：没裁还弹提示是纯噪音。
- 展开态要能收回去，否则布局在一次点击后再也回不来。

## 反模式

- 用固定字符数截断字符串代替本组件：等宽假设在中英混排与不同字体下都不成立。
- 裁掉之后不提供任何看到全文的途径。
