来源：https://ui.docs.xihanfun.com/components/descriptions

# Descriptions `描述列表`

成对的标签与值，按列排开。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/descriptions" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/descriptions.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/descriptions" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/descriptions" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/descriptions.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

标签与取值的配对靠 dl / dt / dd 表达，组件只给身份与排版；不传 columns 即每行一组

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const order = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
  { label: "支付方式", value: "余额支付" },
];
</script>

<template>
  <XhDescriptionsRoot style="max-inline-size: 420px">
    <XhDescriptionsItem v-for="row in order" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
```

```html
<xh-descriptions>
  <dl data-xh-part="root" style="max-inline-size: 420px">
    <div data-xh-part="item">
      <dt data-xh-part="label">订单号</dt>
      <dd data-xh-part="value">XH-20260810-0042</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">下单时间</dt>
      <dd data-xh-part="value">2026-08-10 09:31</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">支付方式</dt>
      <dd data-xh-part="value">余额支付</dd>
    </div>
  </dl>
</xh-descriptions>
```

## 示例

### 列数

columns 决定每行摆几组，一到六列；排版走 CSS Grid，不用表格

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "姓名", value: "张三" },
  { label: "工号", value: "A-1024" },
  { label: "部门", value: "技术部" },
  { label: "岗位", value: "前端工程师" },
  { label: "入职", value: "2024-03-01" },
  { label: "座机", value: "8021" },
];
</script>

<template>
  <XhDescriptionsRoot :columns="3">
    <XhDescriptionsItem v-for="row in rows" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
```

```html
<xh-descriptions columns="3">
  <dl data-xh-part="root">
    <div data-xh-part="item">
      <dt data-xh-part="label">姓名</dt>
      <dd data-xh-part="value">张三</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">工号</dt>
      <dd data-xh-part="value">A-1024</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">部门</dt>
      <dd data-xh-part="value">技术部</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">岗位</dt>
      <dd data-xh-part="value">前端工程师</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">入职</dt>
      <dd data-xh-part="value">2024-03-01</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">座机</dt>
      <dd data-xh-part="value">8021</dd>
    </div>
  </dl>
</xh-descriptions>
```

### 标签位置

placement 决定标签在上还是在左，不传即在上

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "订单号", value: "XH-20260810-0042" },
  { label: "下单时间", value: "2026-08-10 09:31" },
];

// 上面那一档不写 placement，用 undefined 表达
const placements = [
  { placement: undefined, caption: "标签在上（默认）" },
  { placement: "left", caption: "标签在左" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 24px">
    <div v-for="p in placements" :key="p.caption" style="inline-size: 260px">
      <p>{{ p.caption }}</p>
      <XhDescriptionsRoot :placement="p.placement">
        <XhDescriptionsItem v-for="row in rows" :key="row.label">
          <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
          <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
        </XhDescriptionsItem>
      </XhDescriptionsRoot>
    </div>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <div style="inline-size: 260px">
    <p>标签在上（默认）</p>
    <xh-descriptions>
      <dl data-xh-part="root">
        <div data-xh-part="item">
          <dt data-xh-part="label">订单号</dt>
          <dd data-xh-part="value">XH-20260810-0042</dd>
        </div>
        <div data-xh-part="item">
          <dt data-xh-part="label">下单时间</dt>
          <dd data-xh-part="value">2026-08-10 09:31</dd>
        </div>
      </dl>
    </xh-descriptions>
  </div>

  <div style="inline-size: 260px">
    <p>标签在左</p>
    <xh-descriptions placement="left">
      <dl data-xh-part="root">
        <div data-xh-part="item">
          <dt data-xh-part="label">订单号</dt>
          <dd data-xh-part="value">XH-20260810-0042</dd>
        </div>
        <div data-xh-part="item">
          <dt data-xh-part="label">下单时间</dt>
          <dd data-xh-part="value">2026-08-10 09:31</dd>
        </div>
      </dl>
    </xh-descriptions>
  </div>
</div>
```

### 外框

bordered 画一圈描边，并在格与格之间补上网格线

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "商品", value: "机械键盘" },
  { label: "单价", value: "￥499.00" },
  { label: "数量", value: "2" },
  { label: "小计", value: "￥998.00" },
];
</script>

<template>
  <XhDescriptionsRoot bordered :columns="2" placement="left">
    <XhDescriptionsItem v-for="row in rows" :key="row.label">
      <XhDescriptionsLabel>{{ row.label }}</XhDescriptionsLabel>
      <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
```

```html
<xh-descriptions bordered columns="2" placement="left">
  <dl data-xh-part="root">
    <div data-xh-part="item">
      <dt data-xh-part="label">商品</dt>
      <dd data-xh-part="value">机械键盘</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">单价</dt>
      <dd data-xh-part="value">￥499.00</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">数量</dt>
      <dd data-xh-part="value">2</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">小计</dt>
      <dd data-xh-part="value">￥998.00</dd>
    </div>
  </dl>
</xh-descriptions>
```

### 尺寸

size 换的是每格的内边距、组与组的间距与整体字号，不传 size 即默认档

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";

const rows = [
  { label: "状态", value: "已发货" },
  { label: "承运商", value: "顺丰速运" },
];

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <XhDescriptionsRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      bordered
      :columns="2"
      placement="left"
    >
      <XhDescriptionsItem v-for="row in rows" :key="row.label">
        <XhDescriptionsLabel>{{ s.label }} · {{ row.label }}</XhDescriptionsLabel>
        <XhDescriptionsValue>{{ row.value }}</XhDescriptionsValue>
      </XhDescriptionsItem>
    </XhDescriptionsRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-direction: column; gap: 16px">
  <xh-descriptions size="sm" bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">小 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">小 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>

  <!-- 中间这一档不写 size -->
  <xh-descriptions bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">默认 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">默认 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>

  <xh-descriptions size="lg" bordered columns="2" placement="left">
    <dl data-xh-part="root">
      <div data-xh-part="item">
        <dt data-xh-part="label">大 · 状态</dt>
        <dd data-xh-part="value">已发货</dd>
      </div>
      <div data-xh-part="item">
        <dt data-xh-part="label">大 · 承运商</dt>
        <dd data-xh-part="value">顺丰速运</dd>
      </div>
    </dl>
  </xh-descriptions>
</div>
```

### 跨列

一格写 span 横跨几列，上限是当前列数；长文本字段因此不必另开一份描述列表

```vue
<script setup lang="ts">
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from "@xihan-ui/vue";
</script>

<template>
  <XhDescriptionsRoot :columns="3" bordered style="max-inline-size: 720px">
    <XhDescriptionsItem>
      <XhDescriptionsLabel>订单号</XhDescriptionsLabel>
      <XhDescriptionsValue>XH-20260810-0042</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>下单时间</XhDescriptionsLabel>
      <XhDescriptionsValue>2026-08-10 09:31</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>支付方式</XhDescriptionsLabel>
      <XhDescriptionsValue>余额支付</XhDescriptionsValue>
    </XhDescriptionsItem>

    <XhDescriptionsItem :span="2">
      <XhDescriptionsLabel>收货地址</XhDescriptionsLabel>
      <XhDescriptionsValue>浙江省杭州市余杭区文一西路 969 号</XhDescriptionsValue>
    </XhDescriptionsItem>
    <XhDescriptionsItem>
      <XhDescriptionsLabel>联系电话</XhDescriptionsLabel>
      <XhDescriptionsValue>138 0000 0000</XhDescriptionsValue>
    </XhDescriptionsItem>

    <!-- 超过 columns 时按 columns 算，不会跨出网格另起一行 -->
    <XhDescriptionsItem :span="9">
      <XhDescriptionsLabel>备注</XhDescriptionsLabel>
      <XhDescriptionsValue>工作日 09:00–18:00 送达，到前电联。</XhDescriptionsValue>
    </XhDescriptionsItem>
  </XhDescriptionsRoot>
</template>
```

```html
<xh-descriptions columns="3" bordered>
  <dl data-xh-part="root" style="max-inline-size: 720px">
    <div data-xh-part="item">
      <dt data-xh-part="label">订单号</dt>
      <dd data-xh-part="value">XH-20260810-0042</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">下单时间</dt>
      <dd data-xh-part="value">2026-08-10 09:31</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">支付方式</dt>
      <dd data-xh-part="value">余额支付</dd>
    </div>

    <div data-xh-part="item" span="2">
      <dt data-xh-part="label">收货地址</dt>
      <dd data-xh-part="value">浙江省杭州市余杭区文一西路 969 号</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">联系电话</dt>
      <dd data-xh-part="value">138 0000 0000</dd>
    </div>

    <!-- 超过 columns 时按 columns 算，不会跨出网格另起一行 -->
    <div data-xh-part="item" span="9">
      <dt data-xh-part="label">备注</dt>
      <dd data-xh-part="value">工作日 09:00–18:00 送达，到前电联。</dd>
    </div>
  </dl>
</xh-descriptions>
```

## 设计指引

### 何时使用

- 详情页的属性列表：订单信息、设备参数、用户资料。

### 何时不用

- 数据是多行同构的记录：用[表格](./table)。
- 只有一两对：直接写。

### 特性

- 语义是 `dt` / `dd`，组件只给身份与排版。
- `columns` 决定每行几组，不传即每行一组。
- 标签位置可以在值的上方或左侧；`bordered` 给出外框。
- 每一格可以写 `span` 横跨几列，上限是当前列数；窄档一行只摆一组时不认这个数。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-descriptions>` |
| Vue 组件 | `XhDescriptionsItem` `XhDescriptionsLabel` `XhDescriptionsRoot` `XhDescriptionsValue` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/descriptions.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="descriptions"`：**`root`** · `item` · `label` · `value`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bordered` | `boolean` |  | 外框：给整份描述画一圈描边，并在格与格之间画网格线。 |
| `columns` | `DescriptionsColumns` |  | 每行摆几组，一到六列；不写即每行一组。 |
| `placement` | `DescriptionsPlacement` |  | 标签的位置：top / left；不写即标签在上。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props?: DescriptionsItemProps) => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getValueProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/descriptions.css` 按部件选择：`[data-scope="descriptions"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-descriptions-bg` | `root` | `background` | `bordered` | `--xh-bg-surface` | descriptions 的 root 部件 background 覆盖槽。 |
| `--xh-descriptions-border` | `root` | `border` | `bordered` | `--xh-border-default` | descriptions 的 root 部件 border 覆盖槽。 |
| `--xh-descriptions-divider` | `item`<br>`root` | `border-block-start`<br>`border-inline-start` | `bordered` | `--xh-border-subtle` | descriptions 的 item、root 部件 border-block-start、border-inline-start 覆盖槽。 |
| `--xh-descriptions-fg` | `root` | `color` | `default` | `--xh-fg-default` | descriptions 的 root 部件 color 覆盖槽。 |
| `--xh-descriptions-font-size` | `root` | `font-size` | `default` | `--xh-_descriptions-font-size` | descriptions 的 root 部件 font-size 覆盖槽。 |
| `--xh-descriptions-gap` | `root` | `gap` | `default` | `--xh-_descriptions-gap` | descriptions 的 root 部件 gap 覆盖槽。 |
| `--xh-descriptions-item-px` | `item`<br>`root` | `padding-inline` | `bordered` | `--xh-_descriptions-px` | descriptions 的 item、root 部件 padding-inline 覆盖槽。 |
| `--xh-descriptions-item-py` | `item`<br>`root` | `padding-block` | `bordered` | `--xh-_descriptions-py` | descriptions 的 item、root 部件 padding-block 覆盖槽。 |
| `--xh-descriptions-label-fg` | `label` | `color` | `default` | `--xh-fg-muted` | descriptions 的 label 部件 color 覆盖槽。 |
| `--xh-descriptions-label-font-weight` | `label` | `font-weight` | `default` | `--xh-text-label-weight` | descriptions 的 label 部件 font-weight 覆盖槽。 |
| `--xh-descriptions-label-gap` | `item`<br>`root` | `column-gap` | `@media (min-width: 768px)`<br>`placement=left` | `--xh-_descriptions-label-gap` | descriptions 的 item、root 部件 column-gap 覆盖槽。 |
| `--xh-descriptions-label-w` | `item`<br>`root` | `grid-template-columns` | `@media (min-width: 768px)`<br>`placement=left` | `--xh-_descriptions-label-w` | descriptions 的 item、root 部件 grid-template-columns 覆盖槽。 |
| `--xh-descriptions-pair-gap` | `item` | `gap` | `default` | `--xh-_descriptions-pair-gap` | descriptions 的 item 部件 gap 覆盖槽。 |
| `--xh-descriptions-radius` | `root` | `border-radius` | `bordered` | `--xh-shape-surface` | descriptions 的 root 部件 border-radius 覆盖槽。 |
| `--xh-descriptions-value-fg` | `value` | `color` | `default` | `--xh-fg-default` | descriptions 的 value 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 768px`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[卡片](./card)或[页头](./page-header)的页脚。

## 最佳实践

- 值为空时写"—"，别留空白——用户分不清是没有还是没加载出来。
- 标签左置时给它们统一宽度，值才对得齐。
- 长文本字段写 `span` 占满整行，别为它另开一份描述列表。

## 反模式

- 用它排版一张表格。
- 标签写得比值还长。
