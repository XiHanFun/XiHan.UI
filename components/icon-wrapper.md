来源：https://ui.docs.xihanfun.com/components/icon-wrapper

# IconWrapper `图标块`

给图元配一个定直径的底座：圆形或圆角方形，图元恒在正中。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/icon-wrapper" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/icon-wrapper.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/icon-wrapper" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/icon-wrapper" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/icon-wrapper.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

定直径的圆底座，图元在正中；底座换档时里面的图元跟着一起换

```vue
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const BellIcon = {
  name: "bell",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M6 9a6 6 0 0 1 12 0c0 4 1 5.5 2 6.5H4c1-1 2-2.5 2-6.5Z" } },
    { tag: "path", attrs: { d: "M10 19a2 2 0 0 0 4 0" } },
  ],
} as const;
</script>

<template>
  <XhIconWrapper>
    <XhIcon :icon="BellIcon" />
  </XhIconWrapper>
</template>
```

```html
<xh-icon-wrapper>
  <span data-xh-part="root">
    <xh-icon id="icon-wrapper-basic-glyph">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
  </span>
</xh-icon-wrapper>

<script type="module">
  // 图标记录是对象，只走 property
  const bell = {
    name: "bell",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M6 9a6 6 0 0 1 12 0c0 4 1 5.5 2 6.5H4c1-1 2-2.5 2-6.5Z" } },
      { tag: "path", attrs: { d: "M10 19a2 2 0 0 0 4 0" } },
    ],
  };
  document.getElementById("icon-wrapper-basic-glyph").icon = bell;
</script>
```

## 示例

### 形态

四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动

```vue
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const variants = ["solid", "subtle", "outline", "ghost"];

const CheckIcon = {
  name: "check",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6.5" } }],
} as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="v in variants" :key="v" :variant="v">
      <XhIcon :icon="CheckIcon" />
    </XhIconWrapper>
  </div>
</template>
```

```html
<div id="icon-wrapper-variant" style="display: flex; align-items: center; gap: 12px">
  <xh-icon-wrapper variant="solid">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <xh-icon-wrapper variant="subtle">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <xh-icon-wrapper variant="outline">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <xh-icon-wrapper variant="ghost">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>
</div>

<script type="module">
  // 图标记录是对象，只走 property
  const check = {
    name: "check",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6.5" } }],
  };
  for (const icon of document.getElementById("icon-wrapper-variant").querySelectorAll("xh-icon")) {
    icon.icon = check;
  }
</script>
```

### 语气

换一族颜色只改 tone，形态那一轴一个字不动

```vue
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"];

const StarIcon = {
  name: "star",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M12 3.5L14.7 9.2L21 10.1L16.5 14.5L17.6 20.7L12 17.8L6.4 20.7L7.5 14.5L3 10.1L9.3 9.2Z" } },
  ],
} as const;
</script>

<template>
  <div style="display: grid; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px">
      <XhIconWrapper v-for="t in tones" :key="t" variant="solid" :tone="t">
        <XhIcon :icon="StarIcon" />
      </XhIconWrapper>
    </div>

    <div style="display: flex; align-items: center; gap: 12px">
      <XhIconWrapper v-for="t in tones" :key="t" variant="subtle" :tone="t">
        <XhIcon :icon="StarIcon" />
      </XhIconWrapper>
    </div>
  </div>
</template>
```

```html
<div id="icon-wrapper-tone" style="display: grid; gap: 12px">
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-icon-wrapper variant="solid" tone="brand">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="neutral">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="success">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="warning">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="danger">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="solid" tone="info">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>
  </div>

  <div style="display: flex; align-items: center; gap: 12px">
    <xh-icon-wrapper variant="subtle" tone="brand">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="neutral">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="success">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="warning">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="danger">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>

    <xh-icon-wrapper variant="subtle" tone="info">
      <span data-xh-part="root">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </xh-icon-wrapper>
  </div>
</div>

<script type="module">
  // 图标记录是对象，只走 property
  const star = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M12 3.5L14.7 9.2L21 10.1L16.5 14.5L17.6 20.7L12 17.8L6.4 20.7L7.5 14.5L3 10.1L9.3 9.2Z" } },
    ],
  };
  for (const icon of document.getElementById("icon-wrapper-tone").querySelectorAll("xh-icon")) {
    icon.icon = star;
  }
</script>
```

### 尺寸

三档同时换底座直径与图元直径；改形状、改直径都留了槽位

```vue
<script setup lang="ts">
import { XhIcon, XhIconWrapper } from "@xihan-ui/vue";

const sizes = ["sm", "md", "lg"];

const FolderIcon = {
  name: "folder",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2.5h8.5A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" } },
  ],
} as const;
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <XhIconWrapper v-for="s in sizes" :key="s" :size="s" variant="subtle" tone="brand">
      <XhIcon :icon="FolderIcon" />
    </XhIconWrapper>

    <!-- 方底座：形状与直径各留了一个槽位，写在节点上就换掉 -->
    <XhIconWrapper
      variant="subtle"
      tone="brand"
      style="--xh-icon-wrapper-radius: var(--xh-radius-lg); --xh-icon-wrapper-size: 48px; --xh-icon-wrapper-glyph-size: 24px"
    >
      <XhIcon :icon="FolderIcon" />
    </XhIconWrapper>
  </div>
</template>
```

```html
<div id="icon-wrapper-size" style="display: flex; align-items: center; gap: 12px">
  <xh-icon-wrapper size="sm" variant="subtle" tone="brand">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <xh-icon-wrapper size="md" variant="subtle" tone="brand">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <xh-icon-wrapper size="lg" variant="subtle" tone="brand">
    <span data-xh-part="root">
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>

  <!-- 方底座：形状与直径各留了一个槽位，写在节点上就换掉 -->
  <xh-icon-wrapper variant="subtle" tone="brand">
    <span
      data-xh-part="root"
      style="--xh-icon-wrapper-radius: var(--xh-radius-lg); --xh-icon-wrapper-size: 48px; --xh-icon-wrapper-glyph-size: 24px"
    >
      <xh-icon>
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </xh-icon-wrapper>
</div>

<script type="module">
  // 图标记录是对象，只走 property
  const folder = {
    name: "folder",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2.5h8.5A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5Z" } },
    ],
  };
  for (const icon of document.getElementById("icon-wrapper-size").querySelectorAll("xh-icon")) {
    icon.icon = folder;
  }
</script>
```

## 设计指引

### 何时使用

- 需要把图标从背景里托出来：功能入口、结果页的状态徽记、列表项的分类标记。
- 一组图标要在视觉上等宽等高，不受各自图形轮廓影响。

### 何时不用

- 只要一枚裸图元：直接用[图标](./icon)。
- 底座里放的是人或组织的形象：用[头像](./avatar)。

### 特性

- 底座直径与里面图元的直径同一个 `size` 档一起换。
- 四种形态只决定底色、描边与前景怎么用，直径与形状一个字不动。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-icon-wrapper>` |
| Vue 组件 | `XhIconWrapper` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/icon-wrapper.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="icon-wrapper"`：**`root`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定底座直径与里面图元的直径。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定底色、描边与前景怎么用。 |

## connect API

`connect` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `getRootProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

## 样式

默认皮肤 `@xihan-ui/styles/icon-wrapper.css` 按部件选择：`[data-scope="icon-wrapper"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
## CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-icon-wrapper-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | icon-wrapper 的 root 部件 background 覆盖槽。 |
| `--xh-icon-wrapper-fg` | `root` | `color` | `default` | `--xh-fg-default` | icon-wrapper 的 root 部件 color 覆盖槽。 |
| `--xh-icon-wrapper-glyph-size` | `root` | `--xh-icon-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-glyph-size-lg`<br>`--xh-glyph-size-md`<br>`--xh-glyph-size-sm` | icon-wrapper 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-icon-wrapper-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | icon-wrapper 的 root 部件 border-radius 覆盖槽。 |
| `--xh-icon-wrapper-shadow` | `root` | `box-shadow` | `variant=solid` | `--xh-_icon-wrapper-highlight` | icon-wrapper 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-icon-wrapper-size` | `root` | `block-size`<br>`inline-size` | `default`<br>`size=lg`<br>`size=sm` | `--xh-control-h-lg`<br>`--xh-control-h-md`<br>`--xh-control-h-sm` | icon-wrapper 的 root 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

## 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

## 组合

- 里面放[图标](./icon)；外面常与[空状态](./empty-state)、[列表](./list)一起用。

## 最佳实践

- 一组图标块保持同一档尺寸与同一种形态，只让语气变化。
- 它本身不可点：要点击就把它放进[按钮](./button)里，别给底座挂事件。

## 反模式

- 用它替代[徽标](./badge)表达计数：底座是容器，不是数值载体。
