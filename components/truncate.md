来源：https://ui.docs.xihanfun.com/components/truncate

# Truncate 文本截断

用于在有限空间内省略过长文本。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/truncate" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/truncate.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/truncate" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/truncate" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/truncate.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单行文本溢出时显示省略号

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: 280px; max-inline-size: 100%">
    <XhTruncate>XiHan.UI 提供框架无关的 Headless UI 组件与多端适配器。</XhTruncate>
  </div>
</template>
```

```html
<div style="inline-size: 280px; max-inline-size: 100%">
  <xh-truncate>
    <div data-xh-part="root">XiHan.UI 提供框架无关的 Headless UI 组件与多端适配器。</div>
  </xh-truncate>
</div>
```

## 组件结构

加粗的是必需部件。

`data-scope="truncate"`：**`root`** · `trigger`

## 示例

### 多行截断

限制文本显示两行

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: 360px; max-inline-size: 100%">
    <XhTruncate :lines="2">
      组件状态与无障碍逻辑由无头内核统一管理，Vue、React 与 Web Components 适配器共享同一份行为定义。
    </XhTruncate>
  </div>
</template>
```

```html
<div style="inline-size: 360px; max-inline-size: 100%">
  <xh-truncate lines="2">
    <div data-xh-part="root">
      组件状态与无障碍逻辑由无头内核统一管理，Vue、React 与 Web Components 适配器共享同一份行为定义。
    </div>
  </xh-truncate>
</div>
```

### 展开全文

真被裁了才在文字之后露出一颗展开按钮；文字本身照常可选中，展开与收起只归按钮管

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";

const translations = { expand: "展开", collapse: "收起" };
</script>

<template>
  <div style="inline-size: 360px; max-inline-size: 100%">
    <XhTruncate :lines="2" expandable :translations="translations">
      本次更新改进了组件主题、键盘交互与响应式布局。按下文字下方的按钮可查看完整内容，再按一次即可收起。
    </XhTruncate>
  </div>
</template>
```

```html
<div style="inline-size: 360px; max-inline-size: 100%">
  <xh-truncate id="truncate-expandable" lines="2" expandable>
    <div data-xh-part="root">
      本次更新改进了组件主题、键盘交互与响应式布局。按下文字下方的按钮可查看完整内容，再按一次即可收起。
    </div>
    <!-- 按钮留空时元素按展开态写入文案 -->
    <button data-xh-part="trigger"></button>
  </xh-truncate>
</div>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("truncate-expandable").translations = { expand: "展开", collapse: "收起" };
</script>
```

### 原生提示

仅在内容溢出时显示完整文本

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";
</script>

<template>
  <div style="inline-size: 240px; max-inline-size: 100%">
    <XhTruncate tooltip>浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室</XhTruncate>
  </div>
</template>
```

```html
<div style="inline-size: 240px; max-inline-size: 100%">
  <xh-truncate tooltip>
    <div data-xh-part="root">浙江省杭州市余杭区文一西路 969 号 3 号楼 12 层 1203 室</div>
  </xh-truncate>
</div>
```

### 中间省略

position="middle" 把单行文字的省略号收在中间，文件名的开头与扩展名都看得见

```vue
<script setup lang="ts">
import { XhTruncate } from "@xihan-ui/vue";

const files = [
  "2026-第三季度-经营分析报告-终稿-已审阅.pdf",
  "design-system-tokens-export-dark-theme-v2.json",
  "IMG_20260928_081530_HDR_panorama_edited.jpg",
];
</script>

<template>
  <div style="display: grid; gap: 8px; inline-size: 240px; max-inline-size: 100%">
    <XhTruncate v-for="file in files" :key="file" position="middle" tooltip>{{ file }}</XhTruncate>
  </div>
</template>
```

```html
<div style="display: grid; gap: 8px; inline-size: 240px; max-inline-size: 100%">
  <xh-truncate position="middle" tooltip>
    <div data-xh-part="root">2026-第三季度-经营分析报告-终稿-已审阅.pdf</div>
  </xh-truncate>
  <xh-truncate position="middle" tooltip>
    <div data-xh-part="root">design-system-tokens-export-dark-theme-v2.json</div>
  </xh-truncate>
  <xh-truncate position="middle" tooltip>
    <div data-xh-part="root">IMG_20260928_081530_HDR_panorama_edited.jpg</div>
  </xh-truncate>
</div>
```

## 设计指引

### 何时使用

- 表格单元格、列表项或面包屑中的长文本。
- 需要按一行或多行限制内容高度。

### 何时不用

- 价格、编号与错误原因等必须完整显示的内容。
- 长篇正文；使用[排印](./typography)组织阅读层级。

### 特性

- `lines` 控制单行或多行截断。
- 容器、内容与字体变化后自动重新测量。
- `expandable` 在文字旁放一颗展开 / 收起按钮（`trigger` 部件），真被裁了才出现；文字本身不变成按钮，照常可选中、可复制。
- `position="middle"` 把单行文字的省略号收在中间，首尾两段都留着，适合文件名与路径；读屏与原生提示读到的仍是整段文字。
- `tooltip` 仅在内容溢出时提供原生提示。

### 组合

- 使用 `onOverflowChange` 连接自定义[文字提示](./tooltip)。

### 最佳实践

- 仅在内容溢出时显示完整文本提示。
- 可展开内容必须允许再次收起。

### 反模式

- 不要按固定字符数截断文本。
- 不要省略用户完成任务所需的关键信息。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-truncate>` |
| Vue 组件 | `XhTruncate` |
| 组合式函数 | `useTruncate` |
| 状态机 | `truncateMachine` |
| 皮肤 | `@xihan-ui/styles/truncate.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `lines` | `number` |  | 截断行数，1 为单行，默认 1。 |
| `position` | `TruncatePosition` |  | 省略号落在哪，默认 end。middle 只对单行生效：首尾两段各占一半宽度，中间收一个省略号， 适合文件名、路径这类两头都要看得见的文字；多行时按 end 处理。 中间省略按整段纯文字排，盒内带标记的内容会被当成它的文字。 |
| `expandable` | `boolean` |  | 旁边放一颗展开 / 收起全文的按钮（trigger 部件），真被裁了才出现。 |
| `open` | `boolean` |  | 受控展开；未提供时非受控。 |
| `defaultOpen` | `boolean` |  | 非受控时的初始展开态。 |
| `tooltip` | `boolean` |  | 实际裁掉内容时才把整段文字交给平台的原生提示。 |
| `onOpenChange` | `(details: TruncateOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onOverflowChange` | `(details: TruncateOverflowChangeDetails) => void` |  | 测得的溢出结论翻转时回调。 |
| `translations` | `Partial<TruncateTranslations>` |  |  |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TruncateOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |
| `overflow-change` | `TruncateOverflowChangeDetails` | 溢出结论翻转；detail 为 `{ overflowing: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhTruncate` | `default` | `TruncateSlotProps` |  |
| `XhTruncate` | `trigger` | `TruncateTriggerSlotProps` | 展开按钮里的内容，缺省是随展开态切换的那一句文案。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhTruncate` | `trigger` | `SlotChildren<TruncateTriggerSlotProps>` |  | 展开按钮里的内容，缺省是随展开态切换的那一句文案。 |
| `XhTruncate` | `children` | `SlotChildren<TruncateSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' \| undefined |
| `trigger` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`closed` · `open`

**事件**：`MEASURE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 当前是否已展开全文。 |
| `overflowing` | `boolean` | 截断版本是否裁掉了内容。作者据此决定是否附加提示。 |
| `setOpen` | `(next: boolean) => void` | 程序化展开 / 收起，与点击走同一路径。 |
| `measure` | `() => void` | 手动测量一次，用于观察器无法感知的布局变化。 |
| `triggerLabel` | `string` | 展开按钮此刻该显示的文字：收着时是展开那一句，铺开时是收起那一句。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` | 展开 / 收起全文的按钮：没开 expandable 或没东西可展开时收起不占位。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | expandable，焦点在 trigger 上 | 铺开全文 / 收回夹住的那一版；原生按钮自带的激活行为 |
| `Tab` / `Shift+Tab` | expandable 且真被裁或已铺开 | 停到展开按钮上；没东西可展开时按钮收起，不在 Tab 序列里；文字盒子恒不停 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `root` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |

## 样式参考

### 皮肤

`@xihan-ui/styles/truncate.css` 按 `[data-scope="truncate"][data-part="root"]` 部件选择器书写，发布产物以挂载类 `.xh-scope-truncate` 代替其中的 data-scope（特异性相同），位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`，部件选择器照常可用。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-expandable` | ''（条件成立时才出现） |
| `root` | `data-lines` | String(lines) |
| `root` | `data-middle-text` | context.get('text') \| undefined |
| `root` | `data-multiline` | ''（条件成立时才出现） |
| `root` | `data-overflowing` | ''（条件成立时才出现） |
| `root` | `data-position` | 'middle' \| undefined |
| `root` | `data-state` | 'open' \| 'closed' \| undefined |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'sm' |
| `trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-truncate-lines` | `root` | `-webkit-line-clamp` | `multiline` | `--xh-_truncate-lines` | truncate 的 root 部件 -webkit-line-clamp 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
