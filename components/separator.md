来源：https://ui.docs.xihanfun.com/components/separator

# 分隔线 `separator`

在两组内容之间画一条线，并说清楚这条线是语义分隔还是纯装饰。

## 何时使用

- 菜单、列表、工具栏里切开两组不同性质的条目。
- 一行里放两条线、中间留出分节标题。

## 何时不用

- 只是想拉开距离：用间距，别用线。线是"这两边不是一回事"的声明。
- 每一项之间都要线：那通常说明列表本身该换成分组结构。

## 特性

- `decorative` 开启后读屏跳过它（`role="none"`，不出 `aria-orientation`）；只是排版用的横线应该这么写。
- 给了 `content` 就自动排成「线 · 文字 · 线」三段：间距、字号与线长都走令牌，不必在外层手搓。
- `align` 把分节文字挪到靠左或靠右，那一侧的线收成一小截。
- `variant` 三档只换线的深浅：默认线 / 弱线 / 强线。
- `dashed` 画虚线，横竖两个朝向各自成立；段长走 `--xh-separator-dash-length` / `-dash-gap`。
- 线是拿背景画出来的：颜色槽位收的是背景值，粗细是另一个槽位。
- 竖向分隔线需要父容器有确定高度。

## 示例

### 方向

竖向分隔线需要父容器有确定高度

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%">
    <p>上一段</p>
    <XhSeparator />
    <p>下一段</p>
  </div>
  <div style="display: flex; align-items: center; gap: 12px; height: 24px">
    <span>左</span>
    <XhSeparator orientation="vertical" />
    <span>右</span>
  </div>
</template>
```

```html
<div style="width: 100%">
  <p>上一段</p>
  <!-- 宿主不占布局，分隔线本体直接落进外层排版 -->
  <xh-separator style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <p>下一段</p>
</div>
<div style="display: flex; align-items: center; gap: 12px; height: 24px">
  <span>左</span>
  <xh-separator orientation="vertical" style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <span>右</span>
</div>
```

### 纯装饰

decorative 开启后读屏跳过它；只是排版用的横线应该这么写

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%">
    <p>语义分隔：读屏会念出一条分隔线</p>
    <XhSeparator />
    <p>装饰分隔：读屏跳过</p>
    <XhSeparator decorative />
    <p>末段</p>
  </div>
</template>
```

```html
<div style="width: 100%">
  <p>语义分隔：读屏会念出一条分隔线</p>
  <!-- 宿主不占布局，分隔线本体直接落进外层排版 -->
  <xh-separator style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <p>装饰分隔：读屏跳过</p>
  <xh-separator decorative style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <p>末段</p>
</div>
```

### 分节标题

分隔线自己排成「线 · 文字 · 线」三段；align 把文字挪到一侧，那一侧的线收成一小截

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 标题居中：两侧各一条，等分剩下的宽度 -->
    <XhSeparator decorative>基本信息</XhSeparator>

    <p style="margin: 0">姓名、部门、入职时间</p>

    <!-- 标题靠左：左边那条收成一小截 -->
    <XhSeparator decorative align="start">联系方式</XhSeparator>

    <p style="margin: 0">邮箱、电话</p>

    <!-- 标题靠右 -->
    <XhSeparator decorative align="end">备注</XhSeparator>

    <p style="margin: 0">其他补充说明</p>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 12px">
  <!-- 标题居中：两侧各一条，等分剩下的宽度 -->
  <xh-separator decorative style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="line"></div>
      <span data-xh-part="content">基本信息</span>
      <div data-xh-part="line"></div>
    </div>
  </xh-separator>

  <p style="margin: 0">姓名、部门、入职时间</p>

  <!-- 标题靠左：左边那条收成一小截 -->
  <xh-separator decorative align="start" style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="line"></div>
      <span data-xh-part="content">联系方式</span>
      <div data-xh-part="line"></div>
    </div>
  </xh-separator>

  <p style="margin: 0">邮箱、电话</p>

  <!-- 标题靠右 -->
  <xh-separator decorative align="end" style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="line"></div>
      <span data-xh-part="content">备注</span>
      <div data-xh-part="line"></div>
    </div>
  </xh-separator>

  <p style="margin: 0">其他补充说明</p>
</div>
```

### 线型、粗细与颜色

variant 三档换深浅，dashed 画虚线（横竖各自成立），粗细与颜色仍是两个槽位

```vue
<script setup lang="ts">
import { XhSeparator } from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 10px">
    <span style="font-size: 13px">实线（缺省）</span>
    <XhSeparator decorative />

    <span style="font-size: 13px">弱线 / 强线</span>
    <XhSeparator decorative variant="subtle" />
    <XhSeparator decorative variant="strong" />

    <span style="font-size: 13px">虚线</span>
    <XhSeparator decorative dashed />

    <span style="font-size: 13px">虚线段拉长、空白收窄</span>
    <XhSeparator
      decorative
      dashed
      style="--xh-separator-dash-length: 12px; --xh-separator-dash-gap: 4px"
    />

    <span style="font-size: 13px">加粗并换色</span>
    <XhSeparator
      decorative
      style="--xh-separator-thickness: 3px; --xh-separator-color: var(--xh-color-brand-500)"
    />

    <!-- 竖向同样成立：虚线的方向由 data-orientation 决定，不用另写表达式 -->
    <div style="display: flex; align-items: center; gap: 12px; height: 32px">
      <span style="font-size: 13px">左</span>
      <XhSeparator orientation="vertical" decorative dashed />
      <span style="font-size: 13px">右</span>
    </div>
  </div>
</template>
```

```html
<div style="width: 100%; display: grid; gap: 10px">
  <span style="font-size: 13px">实线（缺省）</span>
  <!-- 宿主不占布局，分隔线本体直接落进外层排版 -->
  <xh-separator decorative style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">弱线 / 强线</span>
  <xh-separator decorative variant="subtle" style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>
  <xh-separator decorative variant="strong" style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">虚线</span>
  <xh-separator decorative dashed style="display: contents">
    <div data-xh-part="root"></div>
  </xh-separator>

  <span style="font-size: 13px">虚线段拉长、空白收窄</span>
  <xh-separator decorative dashed style="display: contents">
    <div
      data-xh-part="root"
      style="--xh-separator-dash-length: 12px; --xh-separator-dash-gap: 4px"
    ></div>
  </xh-separator>

  <span style="font-size: 13px">加粗并换色</span>
  <xh-separator decorative style="display: contents">
    <div
      data-xh-part="root"
      style="--xh-separator-thickness: 3px; --xh-separator-color: var(--xh-color-brand-500)"
    ></div>
  </xh-separator>

  <!-- 竖向同样成立：虚线的方向由 data-orientation 决定，不用另写表达式 -->
  <div style="display: flex; align-items: center; gap: 12px; height: 32px">
    <span style="font-size: 13px">左</span>
    <xh-separator orientation="vertical" decorative dashed style="display: contents">
      <div data-xh-part="root"></div>
    </xh-separator>
    <span style="font-size: 13px">右</span>
  </div>
</div>
```

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-separator>` |
| Vue 组件 | `XhSeparator` `XhSeparatorContent` `XhSeparatorLine` `XhSeparatorRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/separator.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="separator"`：**`root`** · `line` · `content`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `align` | `SeparatorAlign` |  | 分节文字落在哪一侧，缺省居中；缺省档不输出 data-align。 |
| `dashed` | `boolean` |  | 画成虚线；实线段与空白段的长度走 --xh-separator-dash-length / -dash-gap 两个槽。 |
| `decorative` | `boolean` |  | 装饰性分隔：仅视觉分组，不进无障碍树（role=none，无 aria-orientation）。 |
| `orientation` | `'horizontal' \| 'vertical'` |  |  |
| `variant` | `SeparatorVariant` |  | 线怎么画，缺省 default；缺省档不输出 data-variant。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getLineProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/separator/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | 'vertical' \| undefined |
| `root` | `role` | 'none' \| 'separator' |
| `line` | `role` | 'none' |

## 样式

默认皮肤 `@xihan-ui/styles/separator.css` 按部件选择：`[data-scope="separator"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-align` | props.align |
| `root` | `data-dashed` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-variant` | props.variant |
| `line` | `data-orientation` | props.orientation |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-separator-align-length` · `--xh-separator-color` · `--xh-separator-content-fg` · `--xh-separator-content-font-size` · `--xh-separator-dash-gap` · `--xh-separator-dash-length` · `--xh-separator-gap` · `--xh-separator-thickness`

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 放进[菜单](./menu)、[工具栏](./toolbar)、[面包屑](./breadcrumb)的条目之间。

## 最佳实践

- 排版用的线一律开 `decorative`：读屏用户不需要听见一条视觉分隔。
- 竖线记得给父容器高度，否则它量不出来、什么都不画。

## 反模式

- 拿分隔线代替标题做分组：分组的语义要由标题给，线只是视觉。
- 一个界面里线太多，每一条都失去分量。
