来源：https://ui.docs.xihanfun.com/components/affix

# Affix 固钉 `alpha`

在滚动超过指定位置后固定内容。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/affix" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/affix.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/affix" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/affix" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/affix.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

滚动后固定工具栏

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div style="block-size: 120px; padding: 8px">项目概览</div>

    <XhAffixRoot :target="scrollEl">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-brand-subtle);
          color: var(--xh-fg-brand);
        "
      >
        筛选与操作
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px; padding: 12px">项目动态<br><br>最近访问<br><br>团队成员</div>
  </div>
</template>
```

```html
<div
  id="affix-basic-scroll"
  style="
    block-size: 240px;
    inline-size: min(420px, 100%);
    overflow: auto;
    padding: 12px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  "
>
  <div style="block-size: 120px; padding: 8px">项目概览</div>

  <template id="affix-basic-tpl">
    <xh-affix style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            padding: 8px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-brand-subtle);
            color: var(--xh-fg-brand);
          "
        >
          筛选与操作
        </div>
      </div>
    </xh-affix>
  </template>

  <div style="block-size: 600px; padding: 12px">项目动态<br><br>最近访问<br><br>团队成员</div>
</div>

<script type="module">
  const template = document.getElementById("affix-basic-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-basic-scroll");
  template.replaceWith(affix);
</script>
```

## 组件结构

加粗的是必需部件。

`data-scope="affix"`：**`root`** · **`content`**

## 示例

### 顶部偏移

避让固定页头

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      position: relative;
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div
      style="
        position: sticky;
        inset-block-start: 0;
        z-index: 1;
        block-size: 40px;
        display: flex;
        align-items: center;
        padding-inline: 8px;
        background: var(--xh-bg-subtle);
      "
    >
      吸顶栏
    </div>

    <div style="block-size: 120px" />

    <XhAffixRoot :target="scrollEl" :offset-top="40">
      <XhAffixContent
        style="
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-brand-subtle);
          color: var(--xh-fg-brand);
        "
      >
        二级工具栏
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px" />
  </div>
</template>
```

```html
<div
  id="affix-offset-top-scroll"
  style="
    position: relative;
    block-size: 240px;
    inline-size: min(420px, 100%);
    overflow: auto;
    padding: 12px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  "
>
  <div
    style="
      position: sticky;
      inset-block-start: 0;
      z-index: 1;
      block-size: 40px;
      display: flex;
      align-items: center;
      padding-inline: 8px;
      background: var(--xh-bg-subtle);
    "
  >
    吸顶栏
  </div>

  <div style="block-size: 120px"></div>

  <template id="affix-offset-top-tpl">
    <xh-affix offset-top="40" style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            padding: 8px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-brand-subtle);
            color: var(--xh-fg-brand);
          "
        >
          二级工具栏
        </div>
      </div>
    </xh-affix>
  </template>

  <div style="block-size: 600px"></div>
</div>

<script type="module">
  const template = document.getElementById("affix-offset-top-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-offset-top-scroll");
  template.replaceWith(affix);
</script>
```

### 底部固定

将操作栏固定在底部

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 240px;
      inline-size: min(420px, 100%);
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div style="block-size: 80px">订单列表</div>

    <XhAffixRoot :target="scrollEl" :offset-bottom="12">
      <XhAffixContent
        style="
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-surface-raised);
          box-shadow: var(--xh-elevation-floating);
        "
      >
        <span>共 42 项</span>
        <span>已选 3 项</span>
      </XhAffixContent>
    </XhAffixRoot>

    <div style="block-size: 600px" />
  </div>
</template>
```

```html
<div
  id="affix-offset-bottom-scroll"
  style="
    block-size: 240px;
    inline-size: min(420px, 100%);
    overflow: auto;
    padding: 12px;
    border-radius: var(--xh-shape-surface);
    background: var(--xh-bg-subtle);
  "
>
  <div style="block-size: 80px">订单列表</div>

  <template id="affix-offset-bottom-tpl">
    <xh-affix offset-bottom="12" style="display: block">
      <div data-xh-part="root">
        <div
          data-xh-part="content"
          style="
            display: flex;
            gap: 8px;
            padding: 8px 12px;
            border-radius: var(--xh-shape-control);
            background: var(--xh-bg-surface-raised);
            box-shadow: var(--xh-elevation-floating);
          "
        >
          <span>共 42 项</span>
          <span>已选 3 项</span>
        </div>
      </div>
    </xh-affix>
  </template>

  <div style="block-size: 600px"></div>
</div>

<script type="module">
  const template = document.getElementById("affix-offset-bottom-tpl");
  const affix = template.content.firstElementChild;
  affix.target = document.getElementById("affix-offset-bottom-scroll");
  template.replaceWith(affix);
</script>
```

### 吸附状态

根据当前状态更新内容

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhAffixContent, XhAffixRoot } from "@xihan-ui/vue";
import { ref } from "vue";

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div style="display: grid; gap: 12px; inline-size: min(420px, 100%)">
    <div
      ref="scrollEl"
      style="
        block-size: 220px;
        overflow: auto;
        padding: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div style="block-size: 120px" />

      <XhAffixRoot v-slot="{ affixed: pinned }" :target="scrollEl">
        <XhAffixContent
          style="padding: 8px 12px; border-radius: 6px; background: var(--xh-bg-subtle)"
        >
          {{ pinned ? "已固定" : "工具栏" }}
        </XhAffixContent>
      </XhAffixRoot>

      <div style="block-size: 600px" />
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 12px; inline-size: min(420px, 100%)">
  <div
    id="affix-change-scroll"
    style="
      block-size: 220px;
      overflow: auto;
      padding: 12px;
      border-radius: var(--xh-shape-surface);
      background: var(--xh-bg-subtle);
    "
  >
    <div style="block-size: 120px"></div>

    <template id="affix-change-tpl">
      <xh-affix style="display: block">
        <div data-xh-part="root">
          <div
            data-xh-part="content"
            style="padding: 8px 12px; border-radius: var(--xh-shape-control); background: var(--xh-bg-surface-raised)"
          >
            工具栏
          </div>
        </div>
      </xh-affix>
    </template>

    <div style="block-size: 600px"></div>
  </div>
</div>

<script type="module">
  const template = document.getElementById("affix-change-tpl");
  const affix = template.content.firstElementChild;
  const content = affix.querySelector('[data-xh-part="content"]');
  affix.target = document.getElementById("affix-change-scroll");
  template.replaceWith(affix);

  affix.addEventListener("affix-change", (event) => {
    const { affixed } = event.detail;
    content.textContent = affixed ? "已固定" : "工具栏";
  });
</script>
```

## 设计指引

### 何时使用

- 固定表格操作栏、表单提交栏或文章目录。

### 何时不用

- 始终固定的元素直接使用 `position: sticky`。
- 页面骨架使用[布局](./layout)的固定能力。
- 返回顶部操作使用[回到顶部](./back-top)。

### 特性

- 固定时保留原始占位，避免页面跳动。
- 支持顶部、底部和偏移位置。
- 提供吸附状态和变化事件。

### 组合

- 可与[锚点](./anchor)或[工具栏](./toolbar)组合使用。

### 最佳实践

- 页面已有固定页头时设置对应的顶部偏移。
- 固定后使用轻微阴影或背景变化提示状态。

### 反模式

- 不要在同一视口固定过多内容。
- 移动端避免固定过高的区域。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-affix>` |
| Vue 组件 | `XhAffixContent` `XhAffixRoot` |
| 组合式函数 | `useAffix` |
| 状态机 | `affixMachine` |
| 皮肤 | `@xihan-ui/styles/affix.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `offsetTop` | `number` |  | 吸住后距滚动容器可视区上边的距离（px）。 |
| `offsetBottom` | `number` |  | 吸住后距滚动容器可视区下边的距离（px）；给了它就改贴下边。 |
| `onAffixChange` | `(details: AffixChangeDetails) => void` |  | 吸附状态变化回调。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `affix-change` | `AffixChangeDetails` | 吸附状态变化；detail 为 `{ affixed: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhAffixRoot` | `default` | `AffixRootSlotProps` |  |

### 状态

以下名称仅用于内部状态机。

**状态**：`released` · `affixed`

**事件**：`SCROLL.RESOLVE`

**判据**：`shouldAffix` · `shouldRelease`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `affixed` | `boolean` | 此刻是不是吸住了。 |
| `getRootProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式参考

### 皮肤

`@xihan-ui/styles/affix.css` 使用 `[data-scope="affix"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `content` | `data-fixed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-affix-layer` | `content` | `z-index` | `fixed` | `--xh-layer-sticky` | affix 的 content 部件 z-index 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。
