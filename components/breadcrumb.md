来源：https://ui.docs.xihanfun.com/components/breadcrumb

# Breadcrumb 面包屑

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

`data-scope="breadcrumb"`：**`root`** · **`list`** · **`item`** · **`link`** · `link-icon` · `separator` · `ellipsis` · `ellipsis-trigger`

## 示例

### 折叠层级

收起过长路径的中间部分，按下省略位展开完整路径

```vue
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
      <li data-xh-part="ellipsis"><button data-xh-part="ellipsis-trigger"></button></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/docs">文档</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/docs/guides">指南</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" href="#/docs/guides/components">组件</a></li>
      <li data-xh-part="separator"></li>
      <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
    </ol>
  </nav>
</xh-breadcrumb>
```

### 自定义分隔符

替换层级之间的视觉标记

```vue
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
- `maxItems` 将过长路径的中间层折叠为一个省略位。省略位里的 `ellipsis-trigger` 是被折叠层级的入口：它是一枚按钮，键盘可达、读屏念出 `translations.ellipsis`（缺省 Show full path），按下即就地展开完整路径，省略位收起，焦点落到第一条展开出来的链接上；展开后不再折回。
- Vue / React 由 `collection` 铺开时自动折叠与展开；Web Components 把完整路径逐层写成部件，在首层之后放一个装着触发器的省略位，元素按 `max-items` 收起中间层，展开后放出来。
- 默认分隔符为箭头，可通过插槽或渲染函数替换。
- 当前页使用 `aria-current="page"`，不参与键盘导航。

### 组合

- 通常放在页头或正文标题之前。
- `ellipsis` 是路径里的一个列表项，里面放 `ellipsis-trigger`；触发器不写内容时由皮肤画一枚省略号字形，写了内容即换成作者的，可及名始终取 `translations.ellipsis`。被收起的层级与展开后的省略位带 `hidden`，紧跟在它后面的分隔符由皮肤一并收起。

### 接路由

- Vue / React 的 `link` 缺省渲染 `<a>`，`href` 由作者写或取自 `collection`。接客户端路由时给 `XhBreadcrumbLink` 加 `asChild`，把路由链接放进去当唯一的子节点：部件属性与按压接线合到它渲出的元素上，跳转交给路由；子节点不是恰好一个元素时直接报错。
- 当前页那条部件照样对点击 `preventDefault`、退出 Tab 序列；路由链接跳往当前路由本来也是空操作。
- Web Components 不需要 asChild：`link` 本来就是作者写的节点，元素只往它身上写属性与监听、不替换它。路由库自己的链接元素，或自行拦截点击的 `<a>`，直接标 `data-xh-part="link"` 即可。

```vue
<XhBreadcrumbItem>
  <XhBreadcrumbLink value="orders" as-child>
    <RouterLink to="/orders">订单</RouterLink>
  </XhBreadcrumbLink>
</XhBreadcrumbItem>
```

```tsx
<XhBreadcrumbItem>
  <XhBreadcrumbLink value="orders" asChild>
    <Link to="/orders">订单</Link>
  </XhBreadcrumbLink>
</XhBreadcrumbItem>;
```

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
| Vue 组件 | `XhBreadcrumbEllipsis` `XhBreadcrumbEllipsisTrigger` `XhBreadcrumbItem` `XhBreadcrumbLink` `XhBreadcrumbLinkIcon` `XhBreadcrumbList` `XhBreadcrumbRoot` `XhBreadcrumbSeparator` |
| 组合式函数 | `useBreadcrumb` |
| 状态机 | `breadcrumbMachine` |
| 皮肤 | `@xihan-ui/styles/breadcrumb.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `readonly BreadcrumbNode[]` |  | 层级数据，文字、链接与当前页的事实源。 未提供时回到层级逐个写成部件的方式。 |
| `maxItems` | `number` |  | 最多展开的层数，超出的中间层折叠为一个省略位；未提供时全部列出。 省略位里的触发器按下即展开完整路径，焦点落到第一条展开出来的链接上。 |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者未提供时不写入。 |
| `translations` | `Partial<BreadcrumbTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |

### BreadcrumbNode

`collection` 的元素。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 是 | 层级身份，写入 data-value。 |
| `label` | `string` |  | 显示文字；默认回退为 value。 |
| `href` | `string` |  | 链接地址；未提供时渲染为不带 href 的 a。 |
| `icon` | `string` |  | 图标文本，写入 link-icon 部件；需要放置图形时改用插槽。 |
| `current` | `boolean` |  | 当前页所在层级。 |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhBreadcrumbLink` | `value` | `string` |  | 链接身份，按压通道按它记住正被按住的那一条；未声明时派生一个实例内稳定的键。 |
| `XhBreadcrumbLink` | `current` | `boolean` |  | 当前页的条目。 |
| `XhBreadcrumbRoot` | `renderSeparator` | `() => ReactNode` |  | 分隔符的内容；未提供时由皮肤绘制默认箭头。 |
| `XhBreadcrumbRoot` | `renderEllipsis` | `(nodes: readonly BreadcrumbNodeMeta[]) => ReactNode` |  | 省略位的内容，可得到被折叠的层；未提供时为一个省略号。 |

### 状态

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`PRESS.START` · `PRESS.END` · `EXPAND`

**判据**：`canPress`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `collection` | `readonly BreadcrumbNodeMeta[]` | 由 collection 推导的层级元信息，按数据顺序排列；未提供 collection 时为空数组。 |
| `items` | `readonly BreadcrumbItem[]` | 按 maxItems 折叠后的序列，省略位自带被折叠的层级；展开后即完整路径；未提供 collection 时为空数组。 |
| `expanded` | `boolean` | 省略位已被展开。 |
| `expand` | `() => void` | 展开折叠的路径；焦点不动。 |
| `collapsedRange` | `(count: number) => BreadcrumbCollapsedRange \| null` | 一条 count 层的路径按 maxItems 折掉的那一段；不折或已展开时为 null。 层级由作者逐个写成部件时（Web Components）据它收起被折叠的层级。 |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getLinkProps` | `(props: BreadcrumbLinkProps) => T['element']` |  |
| `getLinkIconProps` | `() => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |
| `getEllipsisProps` | `() => T['element']` | 省略位：列表项，展开后 hidden。 |
| `getEllipsisTriggerProps` | `() => T['button']` | 省略位里的触发器：按下展开完整路径，焦点落到第一条展开出来的链接上。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` | focus in link, 非当前页 | 跟随链接（原生 &lt;a href&gt; 的激活行为，面包屑自己不监听按键） |
| `Enter` / `Space` | held in link, 非当前页 | 按住期间该链接投影 data-pressed，与指针 :active 同一副按压面；抬起或失焦撤下。跟随链接照旧由这一次按键（原生 &lt;a href&gt;）承担，当前页那条不进 |
| `Enter` / `Space` | focus in ellipsis-trigger | 展开被折叠的层级（原生 &lt;button&gt; 的激活行为），省略位收起，焦点落到第一条展开出来的链接上 |
| `Tab` / `Shift+Tab` | focus in root | 逐条走过可点的链接与省略位触发器；面包屑不做 roving tabindex，当前页那条带 tabindex=-1 自动脱序 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `link` | `aria-current` | 'page' \| undefined |
| `link` | `aria-disabled` | 'true' \| 'false' |
| `link-icon` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |
| `ellipsis-trigger` | `aria-label` | props.translations.ellipsis |

## 样式参考

### 皮肤

`@xihan-ui/styles/breadcrumb.css` 使用 `[data-scope="breadcrumb"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `link` | `data-current` | ''（条件成立时才出现） |
| `link` | `data-pressed` | ''（条件成立时才出现） |
| `link` | `data-xh-collection-context` | 'nav' |
| `link` | `data-xh-collection-item` | '' |
| `link` | `data-xh-collection-size` | props.size |
| `link` | `data-xh-collection-terminal` | ''（条件成立时才出现） |
| `ellipsis-trigger` | `data-xh-collection-context` | 'nav' |
| `ellipsis-trigger` | `data-xh-collection-item` | '' |
| `ellipsis-trigger` | `data-xh-collection-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-breadcrumb-ellipsis-size` | `ellipsis` | `min-inline-size` | `default` | `--xh-space-5` | breadcrumb 的 ellipsis 部件 min-inline-size 覆盖槽。 |
| `--xh-breadcrumb-fg` | `ellipsis-trigger`<br>`link`<br>`root` | `color` | `default`<br>`xh-collection-context=nav` | `--xh-fg-muted` | breadcrumb 的 ellipsis-trigger、link、root 部件 color 覆盖槽。 |
| `--xh-breadcrumb-font-size` | `ellipsis-trigger`<br>`link`<br>`root` | `font-size` | `default` | `--xh-_breadcrumb-font-size` | breadcrumb 的 ellipsis-trigger、link、root 部件 font-size 覆盖槽。 |
| `--xh-breadcrumb-gap` | `list` | `gap` | `default` | `--xh-_breadcrumb-gap` | breadcrumb 的 list 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-icon-size` | `ellipsis-trigger`<br>`link`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 ellipsis-trigger、link、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-breadcrumb-leading` | `ellipsis-trigger`<br>`link`<br>`root` | `line-height` | `default` | `--xh-leading-tight` | breadcrumb 的 ellipsis-trigger、link、root 部件 line-height 覆盖槽。 |
| `--xh-breadcrumb-link-bg-hover` | `link` | `background-color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-bg-subtle` | breadcrumb 的 link 部件 background-color 覆盖槽。 |
| `--xh-breadcrumb-link-bg-pressed` | `link` | `background-color` | `disabled`<br>`error`<br>`is(:active, [data-pressed])`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`pressed`<br>`xh-collection-context=nav` | `--xh-bg-subtle-hover` | breadcrumb 的 link 部件 background-color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-current` | `link` | `color` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-fg-hover` | `link` | `color` | `disabled`<br>`error`<br>`hover`<br>`not([aria-disabled='true'], [data-disabled], [aria-busy='true'], [data-error])`<br>`xh-collection-context=nav` | `--xh-_breadcrumb-accent-text` | breadcrumb 的 link 部件 color 覆盖槽。 |
| `--xh-breadcrumb-link-font-weight-current` | `link` | `font-weight` | `current`<br>`xh-collection-context=nav`<br>`xh-collection-terminal` | `--xh-font-weight-medium` | breadcrumb 的 link 部件 font-weight 覆盖槽。 |
| `--xh-breadcrumb-link-gap` | `link` | `gap` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 gap 覆盖槽。 |
| `--xh-breadcrumb-link-icon-size` | `link-icon` | `block-size`<br>`inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 link-icon 部件 block-size、inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-max-w` | `link` | `max-inline-size` | `default` | `--xh-nav-link-max-w` | breadcrumb 的 link 部件 max-inline-size 覆盖槽。 |
| `--xh-breadcrumb-link-px` | `link` | `padding-inline` | `default` | `--xh-space-1` | breadcrumb 的 link 部件 padding-inline 覆盖槽。 |
| `--xh-breadcrumb-link-radius` | `link` | `border-radius` | `default` | `--xh-shape-control` | breadcrumb 的 link 部件 border-radius 覆盖槽。 |
| `--xh-breadcrumb-separator-fg` | `ellipsis`<br>`separator` | `color` | `default` | `--xh-fg-subtle` | breadcrumb 的 ellipsis、separator 部件 color 覆盖槽。 |
| `--xh-breadcrumb-separator-size` | `separator` | `inline-size` | `default` | `--xh-glyph-size-text` | breadcrumb 的 separator 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

动效角色：按压 · 状态（见[动效规范](../design/motion#角色)）。

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

另有按 `dir` 分支的规则。
