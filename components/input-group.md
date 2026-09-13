来源：https://ui.docs.xihanfun.com/components/input-group

# InputGroup 输入组 `alpha`

用于在同一输入表面中组合前缀、输入控件和后缀。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/input-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/input-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/input-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/input-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/input-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

为输入框添加固定前缀

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhInputGroupRoot>
    <XhInputGroupItem>
      <svg aria-hidden="true" viewBox="0 0 20 20" style="inline-size: 1em; block-size: 1em">
        <path d="M2.5 5.5 10 10.75 17.5 5.5M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
      </svg>
    </XhInputGroupItem>
    <XhTextFieldRoot type="email" placeholder="name@example.com">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="邮箱地址" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
  </XhInputGroupRoot>
</template>
```

```html
<xh-input-group>
  <div data-xh-part="root">
    <span data-xh-part="item">
      <svg aria-hidden="true" viewBox="0 0 20 20" style="inline-size: 1em; block-size: 1em">
        <path d="M2.5 5.5 10 10.75 17.5 5.5M4 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
      </svg>
    </span>
    <xh-text-field type="email" placeholder="name@example.com">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <input data-xh-part="input" aria-label="邮箱地址" />
        </div>
      </div>
    </xh-text-field>
  </div>
</xh-input-group>
```

## 组件结构

加粗的是必需部件。

`data-scope="input-group"`：**`root`** · `item`

## 示例

### 动作

将关联操作放在输入框末端

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhButton,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhInputGroupRoot>
    <XhTextFieldRoot placeholder="搜索文档">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="搜索文档" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhButton variant="solid">搜索</XhButton>
  </XhInputGroupRoot>
</template>
```

```html
<xh-input-group>
  <div data-xh-part="root">
    <xh-text-field placeholder="搜索文档">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <input data-xh-part="input" aria-label="搜索文档" />
        </div>
      </div>
    </xh-text-field>
    <xh-button variant="solid">
      <button data-xh-part="root">搜索</button>
    </xh-button>
  </div>
</xh-input-group>
```

### 变体

使用主要或次级输入表面

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 12px">
    <XhInputGroupRoot variant="primary">
      <XhInputGroupItem>¥</XhInputGroupItem>
      <XhTextFieldRoot placeholder="主要表面">
        <XhTextFieldControl>
          <XhTextFieldInput inputmode="decimal" aria-label="主要金额" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>

    <XhInputGroupRoot variant="secondary">
      <XhInputGroupItem>¥</XhInputGroupItem>
      <XhTextFieldRoot placeholder="次级表面">
        <XhTextFieldControl>
          <XhTextFieldInput inputmode="decimal" aria-label="次要金额" />
        </XhTextFieldControl>
      </XhTextFieldRoot>
    </XhInputGroupRoot>
  </div>
</template>
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-input-group variant="primary">
    <div data-xh-part="root">
      <span data-xh-part="item">¥</span>
      <xh-text-field placeholder="主要表面">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" inputmode="decimal" aria-label="主要金额" />
          </div>
        </div>
      </xh-text-field>
    </div>
  </xh-input-group>

  <xh-input-group variant="secondary">
    <div data-xh-part="root">
      <span data-xh-part="item">¥</span>
      <xh-text-field placeholder="次级表面">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" inputmode="decimal" aria-label="次要金额" />
          </div>
        </div>
      </xh-text-field>
    </div>
  </xh-input-group>
</div>
```

### 文本前后缀

添加协议和域名后缀

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from "@xihan-ui/vue";
</script>

<template>
  <XhInputGroupRoot>
    <XhInputGroupItem>https://</XhInputGroupItem>
    <XhTextFieldRoot placeholder="xihan">
      <XhTextFieldControl>
        <XhTextFieldInput aria-label="站点地址" />
      </XhTextFieldControl>
    </XhTextFieldRoot>
    <XhInputGroupItem>.dev</XhInputGroupItem>
  </XhInputGroupRoot>
</template>
```

```html
<xh-input-group>
  <div data-xh-part="root">
    <span data-xh-part="item">https://</span>
    <xh-text-field placeholder="xihan">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <input data-xh-part="input" aria-label="站点地址" />
        </div>
      </div>
    </xh-text-field>
    <span data-xh-part="item">.dev</span>
  </div>
</xh-input-group>
```

## 设计指引

### 何时使用

- 输入框需要图标、单位或固定文本。
- 输入框需要紧邻的搜索、复制或提交动作。

### 何时不用

- 组合并列操作：使用[按钮组](./button-group)。
- 仅用于排列控件：使用布局组件。

### 特性

- 所有内容共享一个背景、外轮廓和焦点环。
- 支持 `primary` 与 `secondary` 两种视觉变体。
- 前后缀不参与交互，控件保留自身语义。
- 支持 `sm`、`md` 和 `lg` 三种尺寸。

### 最佳实践

- 前后缀保持简短，并使用静态内容。
- 可交互内容使用对应控件，不要放进 `item`。
- 组内控件使用相同尺寸。

### 反模式

- 使用过多前后缀，让输入区域难以识别。
- 用 `item` 承载按钮或链接。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-input-group>` |
| Vue 组件 | `XhInputGroupItem` `XhInputGroupRoot` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/input-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，落到根上供皮肤写进 item 的高度、内衬与字号槽位。 不写时档位由组内控件自己的 data-size 决定，组里没有带档的控件就走 md。 |
| `variant` | `InputGroupVariant` |  | 视觉变体：primary / secondary。缺省 primary。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/input-group.css` 使用 `[data-scope="input-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-input-group-bg` | `root` | `background` | `default` | `--xh-_input-group-bg` | input-group 的 root 部件 background 覆盖槽。 |
| `--xh-input-group-bg-hover` | `root` | `background` | `disabled`<br>`hover`<br>`not(:has([data-disabled])` | `--xh-_input-group-bg-hover` | input-group 的 root 部件 background 覆盖槽。 |
| `--xh-input-group-border` | `root` | `border` | `default` | `--xh-_input-group-border` | input-group 的 root 部件 border 覆盖槽。 |
| `--xh-input-group-border-focus` | `root` | `border-color` | `focus-within` | `--xh-_input-group-border-focus` | input-group 的 root 部件 border-color 覆盖槽。 |
| `--xh-input-group-border-hover` | `root` | `border-color` | `disabled`<br>`hover`<br>`not(:has([data-disabled])` | `--xh-_input-group-border-hover` | input-group 的 root 部件 border-color 覆盖槽。 |
| `--xh-input-group-border-invalid` | `root` | `border-color` | `has([data-invalid], [aria-invalid='true'])`<br>`invalid` | `--xh-border-invalid` | input-group 的 root 部件 border-color 覆盖槽。 |
| `--xh-input-group-item-fg` | `item` | `color` | `default` | `--xh-fg-muted` | input-group 的 item 部件 color 覆盖槽。 |
| `--xh-input-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_input-group-font-size` | input-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-input-group-item-h` | `item` | `block-size` | `default` | `--xh-_input-group-h` | input-group 的 item 部件 block-size 覆盖槽。 |
| `--xh-input-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_input-group-px` | input-group 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-input-group-radius` | `control`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `default`<br>`first-child`<br>`is(*, [data-part='control'], [data-part='root'])`<br>`is([data-part='control'], [data-part='root'])`<br>`last-child` | `--xh-shape-control`<br>`--xh-shape-surface` | input-group 的 control、root 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-input-group-ring-focus` | `root` | `outline` | `focus-within` | `--xh-ring-focus` | input-group 的 root 部件 outline 覆盖槽。 |
| `--xh-input-group-ring-invalid` | `root` | `outline-color` | `focus-within`<br>`has([data-invalid], [aria-invalid='true'])`<br>`invalid` | `--xh-ring-invalid` | input-group 的 root 部件 outline-color 覆盖槽。 |
| `--xh-input-group-shadow` | `root` | `box-shadow` | `default` | `--xh-_input-group-shadow` | input-group 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `box-shadow` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
