来源：https://ui.docs.xihanfun.com/components/breadcrumb

# Breadcrumb 面包屑 `alpha`

显示当前页面在信息层级中的位置。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/breadcrumb" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/breadcrumb.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/breadcrumb" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/breadcrumb" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/breadcrumb.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示当前页面的层级路径

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "navigation", label: "导航", href: "#/components#navigation" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
</script>

<template>
  <XhBreadcrumbRoot :collection="items" />
</template>
```

```html
<xh-breadcrumb>
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/components#navigation">导航</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
    </ol>
  </nav>
</xh-breadcrumb>
```

## 组件结构

加粗的是必需部件。

`data-scope="breadcrumb"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-icon` · `separator` · `ellipsis`

## 示例

### 折叠层级

收起过长路径的中间部分

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "docs", label: "文档", href: "#/docs" },
  { value: "guides", label: "指南", href: "#/docs/guides" },
  { value: "components", label: "组件", href: "#/docs/guides/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
</script>

<template>
  <XhBreadcrumbRoot :collection="items" :max-items="3" />
</template>
```

```html
<xh-breadcrumb max-items="3">
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="ellipsis">…</li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
    </ol>
  </nav>
</xh-breadcrumb>
```

### 自定义分隔符

替换层级之间的视觉标记

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "workspace", label: "工作台", href: "#/workspace" },
  { value: "projects", label: "项目", href: "#/workspace/projects" },
  { value: "xihan-ui", label: "XiHan.UI", current: true },
];
</script>

<template>
  <XhBreadcrumbRoot :collection="items">
    <template #separator>•</template>
  </XhBreadcrumbRoot>
</template>
```

```html
<xh-breadcrumb>
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item"><a data-xh-part="link" href="#/workspace">工作台</a></li>
      <li data-xh-part="separator">•</li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/workspace/projects">项目</a></li>
      <li data-xh-part="separator">•</li>
      <li data-xh-part="item"><a data-xh-part="link" current>XiHan.UI</a></li>
    </ol>
  </nav>
</xh-breadcrumb>
```

### 尺寸

适配不同的信息密度

```vue
<!--
  Copyright (c) 2021-Present XiHanFun and contributors.
  Licensed under the MIT License. See LICENSE in the project root for license information.
-->

<script setup lang="ts">
import { XhBreadcrumbRoot } from "@xihan-ui/vue";

const items = [
  { value: "home", label: "首页", href: "#/" },
  { value: "components", label: "组件", href: "#/components" },
  { value: "breadcrumb", label: "面包屑", current: true },
];
const sizes = [
  { label: "小", value: "sm" },
  { label: "中", value: undefined },
  { label: "大", value: "lg" },
] as const;
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <div v-for="item in sizes" :key="item.label" style="display: flex; align-items: center; gap: 16px">
      <span style="inline-size: 24px; color: var(--xh-fg-muted)">{{ item.label }}</span>
      <XhBreadcrumbRoot :collection="items" :size="item.value" />
    </div>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">小</span>
    <xh-breadcrumb size="sm">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">中</span>
    <xh-breadcrumb>
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">大</span>
    <xh-breadcrumb size="lg">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
</div>
```

## 设计指引

### 何时使用

- 页面具有明确的父子层级。
- 用户可能从搜索或外链直接进入深层页面。

### 何时不用

- 扁平页面不需要面包屑。
- 流程进度使用[步骤条](./steps)。

### 特性

- `collection` 可直接生成完整路径，也支持手写部件。
- `maxItems` 将过长路径的中间层折叠为省略号。
- 默认分隔符为箭头，可通过插槽或渲染函数替换。
- 当前页使用 `aria-current="page"`，不参与键盘导航。

### 组合

- 通常放在页头或正文标题之前。

### 最佳实践

- 当前项使用清晰的页面标题，避免“详情”等泛化名称。
- 同页有多个 `nav` 地标时给面包屑单独的 `aria-label`。

### 反模式

- 不要用面包屑表示浏览历史。
- 当前项不要链接到自身。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-breadcrumb>` |
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbLinkIcon` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/breadcrumb.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly BreadcrumbNode[]` |  | 层级数据，文字、链接与当前页的事实源。 缺省即回到「层级逐个写成部件」的老路。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `maxItems` | `number` |  | 最多展开几层，超出的中间层折成一个省略位；不给即全列。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `translations` | `Partial<BreadcrumbTranslations>` |  |  |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly BreadcrumbNodeMeta[]` | collection 推出的层级元信息，按数据顺序排列；没给 collection 即空数组。 |
| `items` | `readonly BreadcrumbItem[]` | 按 maxItems 折叠后的序列，省略位自带被折叠的那几层；没给 collection 即空数组。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |  |
| `getLinkIconProps` | `() => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getEllipsisProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `link-icon` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/breadcrumb.css` 使用 `[data-scope="breadcrumb"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-breadcrumb-ellipsis-size` | `ellipsis` | `inline-size` | `default` | `--xh-space-5` | breadcrumb 的 ellipsis 部件 inline-size 覆盖槽。 |
| `--xh-breadcrumb-fg` | `root` | `color` | `default` | `--xh-fg-muted` | breadcrumb 的 root 部件 color 覆盖槽。 |
| `--xh-breadcrumb-font-size` | `root` | `font-size` | `default` | `--xh-_breadcrumb-font-size` | breadcrumb 的 root 部件 font-size 覆盖槽。 |
| `--xh-breadcrumb-gap` | `list` | `gap` | `default` | `--xh-_breadcrumb-gap` | breadcrumb 的 list 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-breadcrumb-leading` | `root` | `line-height` | `default` | `--xh-leading-tight` | breadcrumb 的 root 部件 line-height 覆盖槽。 |
| `--xh-breadcrumb-link-bg-hover` | `link` | `background` | `current`<br>`hover`<br>`not([data-current])` | `--xh-bg-subtle-hover` | breadcrumb 的 link 部件 background 覆盖槽。 |
| `--xh-breadcrumb-link-fg-current` | `link` | `color` | `current` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-hover` | `link` | `color` | `current`<br>`hover`<br>`not([data-current])` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-font-weight-current` | `link` | `font-weight` | `current` | `--xh-font-weight-medium` | breadcrumb 的 link 部件 font-weight 覆盖槽。 |
| `--xh-breadcrumb-link-gap` | `link` | `gap` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-link-icon-size` | `link-icon` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 link-icon 部件 block-size、inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | breadcrumb 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-px` | `link` | `padding-inline` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-breadcrumb-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | breadcrumb 的 link 部件 border-radius 覆盖槽。 |
| `--xh-breadcrumb-separator-fg` | `ellipsis`<br>`separator` | `color` | `default` | `--xh-fg-subtle` | breadcrumb 的 ellipsis、separator 部件 color 覆盖槽。 |
| `--xh-breadcrumb-separator-size` | `separator` | `inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 separator 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `color` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
