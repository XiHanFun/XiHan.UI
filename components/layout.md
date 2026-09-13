来源：https://ui.docs.xihanfun.com/components/layout

# Layout 布局

用于构建带页头、侧栏、内容和页脚的页面骨架。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/layout" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/layout.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/layout" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/layout" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/layout.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

构建应用页面骨架

```vue
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot bordered sider-breakpoint="sm" style="inline-size: min(720px, 100%); block-size: 280px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader><strong>XiHan Admin</strong></XhLayoutHeader>
    <XhLayoutSider>
      <div style="display: grid; gap: 12px"><span>概览</span><span>用户</span><span>设置</span></div>
    </XhLayoutSider>
    <XhLayoutContent>
      <strong>欢迎回来</strong>
      <p style="color: var(--xh-fg-muted)">这里是今日的项目概览。</p>
    </XhLayoutContent>
    <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout bordered sider-breakpoint="sm" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(720px, 100%); block-size: 280px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <div data-xh-part="header"><strong>XiHan Admin</strong></div>
    <div data-xh-part="sider"><div style="display: grid; gap: 12px"><span>概览</span><span>用户</span><span>设置</span></div></div>
    <div data-xh-part="content"><strong>欢迎回来</strong><p style="color: var(--xh-fg-muted)">这里是今日的项目概览。</p></div>
    <div data-xh-part="footer">© 2026 XiHan.UI</div>
  </div>
</xh-layout>
```

## 组件结构

加粗的是必需部件。

`data-scope="layout"`：**`root`** · `header` · `sider-backdrop` · `sider` · `content` · `footer` · `sider-trigger`

## 示例

### 折叠侧栏

保留侧栏节点并切换宽度

```vue
<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider, XhLayoutSiderTrigger } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot bordered style="inline-size: min(640px, 100%); block-size: 240px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader><XhLayoutSiderTrigger>菜单</XhLayoutSiderTrigger><strong>控制台</strong></XhLayoutHeader>
    <XhLayoutSider><div style="display: grid; gap: 12px"><span>概览</span><span>收藏</span><span>回收站</span></div></XhLayoutSider>
    <XhLayoutContent>项目动态</XhLayoutContent>
  </XhLayoutRoot>
</template>
```

```html
<xh-layout bordered style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%); block-size: 240px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <div data-xh-part="header"><button data-xh-part="sider-trigger">菜单</button><strong>控制台</strong></div>
    <div data-xh-part="sider"><div style="display: grid; gap: 12px"><span>概览</span><span>收藏</span><span>回收站</span></div></div>
    <div data-xh-part="content">项目动态</div>
  </div>
</xh-layout>
```

### 侧栏位置

将侧栏放在行首或行尾

```vue
<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
    <XhLayoutRoot bordered style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader>行首侧栏</XhLayoutHeader><XhLayoutSider>导航</XhLayoutSider><XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
    <XhLayoutRoot sider-placement="end" bordered style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden">
      <XhLayoutHeader>行尾侧栏</XhLayoutHeader><XhLayoutSider>属性</XhLayoutSider><XhLayoutContent>正文</XhLayoutContent>
    </XhLayoutRoot>
  </div>
</template>
```

```html
<div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
  <xh-layout bordered style="display: contents"><div data-xh-part="root" style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden"><div data-xh-part="header">行首侧栏</div><div data-xh-part="sider">导航</div><div data-xh-part="content">正文</div></div></xh-layout>
  <xh-layout sider-placement="end" bordered style="display: contents"><div data-xh-part="root" style="block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden"><div data-xh-part="header">行尾侧栏</div><div data-xh-part="sider">属性</div><div data-xh-part="content">正文</div></div></xh-layout>
</div>
```

### 固定区域

固定页头和侧栏

```vue
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";

const rows = Array.from({ length: 12 }, (_, index) => `内容区 ${String(index + 1).padStart(2, "0")}`);
</script>

<template>
  <div style="inline-size: min(640px, 100%); block-size: 260px; overflow: auto; border-radius: var(--xh-shape-surface); background: var(--xh-bg-page)">
    <XhLayoutRoot header-fixed sider-fixed bordered style="--xh-layout-scrollport-h: 260px">
      <XhLayoutHeader><strong>控制台</strong></XhLayoutHeader>
      <XhLayoutSider>导航</XhLayoutSider>
      <XhLayoutContent><p v-for="row in rows" :key="row" style="margin-block: 0 16px">{{ row }}</p></XhLayoutContent>
      <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
    </XhLayoutRoot>
  </div>
</template>
```

```html
<div style="inline-size: min(640px, 100%); block-size: 260px; overflow: auto; border-radius: var(--xh-shape-surface); background: var(--xh-bg-page)">
  <xh-layout header-fixed sider-fixed bordered style="display: contents">
    <div data-xh-part="root" style="--xh-layout-scrollport-h: 260px">
      <div data-xh-part="header"><strong>控制台</strong></div>
      <div data-xh-part="sider">导航</div>
      <div data-xh-part="content">
        <p>内容区 01</p><p>内容区 02</p><p>内容区 03</p><p>内容区 04</p><p>内容区 05</p><p>内容区 06</p>
        <p>内容区 07</p><p>内容区 08</p><p>内容区 09</p><p>内容区 10</p><p>内容区 11</p><p>内容区 12</p>
      </div>
      <div data-xh-part="footer">© 2026 XiHan.UI</div>
    </div>
  </xh-layout>
</div>
```

## 设计指引

### 何时使用

- 构建管理后台、控制台或文档站。
- 页面需要可折叠或响应式侧栏。

### 何时不用

- 局部排列使用[弹性布局](./flex)或[栅格](./grid)。
- 可拖动分栏使用[分栏](./splitter)。
- 侧栏导航内容使用[侧栏导航](./side-nav)。

### 特性

- 页头、侧栏、内容和页脚均可选。
- 侧栏折叠时保留节点和内部状态。
- 支持自定义侧栏宽度、位置和断点。
- 页头和侧栏可独立固定。

### 组合

- 侧栏可放[侧栏导航](./side-nav)，页头可放[菜单栏](./menubar)或[工具栏](./toolbar)。

### 最佳实践

- 固定页头或侧栏时，将滚动容器放在布局根外层。
- 折叠宽度应容纳图标和内边距。

### 反模式

- 不要通过卸载侧栏实现折叠。
- 不要绕过固定属性直接覆盖定位方式。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-layout>` |
| Vue 组件 | `XhLayoutContent` `XhLayoutFooter` `XhLayoutHeader` `XhLayoutRoot` `XhLayoutSider` `XhLayoutSiderBackdrop` `XhLayoutSiderTrigger` |
| 组合式函数 | `useLayout` |
| 状态机 | `layoutMachine` |
| 皮肤 | `@xihan-ui/styles/layout.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `siderCollapsed` | `boolean` |  | 受控折叠态：给了值就由宿主说了算。 |
| `defaultSiderCollapsed` | `boolean` |  | 非受控初始折叠态。 |
| `siderWidth` | `string` |  | 展开时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderCollapsedWidth` | `string` |  | 折叠时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderPlacement` | `LayoutSiderPlacement` |  | 侧栏挂在行首还是行尾，缺省 start。 |
| `siderBreakpoint` | `LayoutBreakpoint` |  | 侧栏的自适应断点：视口窄于这一档时侧栏按折叠宽显示。 只换宽度不改折叠态——折叠态归 siderCollapsed 那条通道，两者互不干扰。 运行期换档会重绑媒体查询；需要所属 Window.matchMedia 与对应断点令牌。 |
| `siderPresentation` | `LayoutSiderPresentation` |  | 侧栏呈现形态，缺省 inline（在骨架里占一列）。 sheet 是覆盖档：侧栏移出画外，展开时盖在内容之上并铺一层遮罩，内容因此占满整宽。 同时写了 siderBreakpoint 时它只在未达那一档时成立——宽屏照旧占一列，窄屏才覆盖， 且跨档时侧栏跟着开合（进覆盖档收起、回占位档展开），走的是 siderCollapsed 那条通道。 覆盖档不锁焦点、不把背后的内容标成惰性：它是骨架里的一段，不是模态浮层。 |
| `headerFixed` | `boolean` |  | 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 |
| `siderFixed` | `boolean` |  | 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 |
| `bordered` | `boolean` |  | 在头、侧栏、脚与内容之间画分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `onSiderBreakpoint` | `(details: LayoutSiderBreakpointDetails) => void` |  | 断点跨过去时发一次，挂载或更换档位时也发一次当前值。 窄屏要把侧栏换成抽屉的，接这条：组件自己只换宽度。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sider-collapsed-change` | `LayoutSiderCollapsedChangeDetails` | 折叠态变化；detail 为 `{ collapsed: boolean }` |
| `sider-breakpoint` | `LayoutSiderBreakpointDetails` | 断点跨过去时发，挂载时也发一次当前值；detail 为 `{ matched: boolean }` |

### 状态

以下名称仅用于内部状态机。

**状态**：`expanded` · `collapsed`

**事件**：`SIDER.COLLAPSE` · `SIDER.EXPAND` · `SIDER.TOGGLE` · `CONTROLLED.COLLAPSE` · `CONTROLLED.EXPAND`

**判据**：`isSiderCollapsedControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `siderCollapsed` | `boolean` | 侧栏当前是否折叠。 |
| `siderPresentation` | `LayoutSiderPresentation` | 已解析的侧栏呈现形态：写了断点时，覆盖档只在未达那一档时成立。 |
| `setSiderCollapsed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSiderBackdropProps` | `() => T['element']` | 覆盖档铺在内容之上的那一层遮罩：点它收起侧栏。 占位档下它带 hidden，不占位也不吃指针。渲染时排在侧栏之前——两层同一个层号，谁盖谁看文档序。 |
| `getSiderProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getSiderTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in sider-trigger | 折叠/展开 sider |
| `Escape` | sider 按覆盖档盖在内容之上 | 收起 sider |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `sider-backdrop` | `aria-hidden` | 'true' |
| `sider-trigger` | `aria-controls` | `sider` 部件的 id |
| `sider-trigger` | `aria-expanded` | 'false' \| 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/layout.css` 使用 `[data-scope="layout"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-header-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-breakpoint` | props.siderBreakpoint |
| `root` | `data-sider-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-placement` | props.siderPlacement |
| `root` | `data-sider-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `sider-backdrop` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-fixed` | ''（条件成立时才出现） |
| `sider` | `data-placement` | props.siderPlacement |
| `sider` | `data-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `sider-trigger` | `data-collapsed` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-layout-bg` | `root` | `background` | `default` | `--xh-bg-page` | layout 的 root 部件 background 覆盖槽。 |
| `--xh-layout-border` | `footer`<br>`header`<br>`root`<br>`sider` | `border-block-end`<br>`border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `bordered`<br>`placement=end`<br>`placement=start` | `--xh-border-default` | layout 的 footer、header、root、sider 部件 border-block-end、border-block-start、border-inline-end、border-inline-start 覆盖槽。 |
| `--xh-layout-content-padding` | `content` | `padding` | `default` | `--xh-space-4` | layout 的 content 部件 padding 覆盖槽。 |
| `--xh-layout-fg` | `root` | `color` | `default` | `--xh-fg-default` | layout 的 root 部件 color 覆盖槽。 |
| `--xh-layout-footer-bg` | `footer` | `background` | `default` | `--xh-bg-surface` | layout 的 footer 部件 background 覆盖槽。 |
| `--xh-layout-footer-padding` | `footer` | `padding` | `default` | `--xh-space-3` | layout 的 footer 部件 padding 覆盖槽。 |
| `--xh-layout-header-bg` | `header` | `background` | `default` | `--xh-bg-surface` | layout 的 header 部件 background 覆盖槽。 |
| `--xh-layout-header-gap` | `header` | `gap` | `default` | `--xh-space-3` | layout 的 header 部件 gap 覆盖槽。 |
| `--xh-layout-header-h` | `header`<br>`root`<br>`sider` | `block-size`<br>`grid-template-rows`<br>`inset-block-start`<br>`max-block-size` | `default`<br>`fixed`<br>`header-fixed`<br>`sider-fixed` | `3.5rem` | layout 的 header、root、sider 部件 block-size、grid-template-rows、inset-block-start、max-block-size 覆盖槽。 |
| `--xh-layout-header-layer` | `header` | `z-index` | `fixed` | `--xh-layer-sticky` | layout 的 header 部件 z-index 覆盖槽。 |
| `--xh-layout-header-px` | `header` | `padding-inline` | `default` | `--xh-space-4` | layout 的 header 部件 padding-inline 覆盖槽。 |
| `--xh-layout-scrollport-h` | `sider` | `max-block-size` | `fixed`<br>`presentation=sheet` | `100dvh`<br>`100vh` | layout 的 sider 部件 max-block-size 覆盖槽。 |
| `--xh-layout-sider-backdrop-bg` | `sider-backdrop` | `background` | `default` | `--xh-bg-overlay` | layout 的 sider-backdrop 部件 background 覆盖槽。 |
| `--xh-layout-sider-backdrop-layer` | `sider-backdrop` | `z-index` | `default` | `--xh-layer-drawer` | layout 的 sider-backdrop 部件 z-index 覆盖槽。 |
| `--xh-layout-sider-bg` | `sider` | `background` | `default` | `--xh-bg-subtle` | layout 的 sider 部件 background 覆盖槽。 |
| `--xh-layout-sider-collapsed-w` | `root`<br>`sider` | `inline-size` | `collapsed`<br>`sider-breakpoint` | `4rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
| `--xh-layout-sider-layer` | `sider` | `z-index` | `presentation=sheet` | `--xh-layer-drawer` | layout 的 sider 部件 z-index 覆盖槽。 |
| `--xh-layout-sider-padding` | `sider` | `padding`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`presentation=sheet` | `--xh-space-3` | layout 的 sider 部件 padding、padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-layout-sider-shadow` | `sider` | `box-shadow` | `presentation=sheet` | `--xh-elevation-sheet` | layout 的 sider 部件 box-shadow 覆盖槽。 |
| `--xh-layout-sider-trigger-bg` | `sider-trigger` | `background` | `default` | `transparent` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-active` | `sider-trigger` | `background` | `active` | `--xh-bg-subtle-active` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-hover` | `sider-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | layout 的 sider-trigger 部件 background 覆盖槽。 |
| `--xh-layout-sider-trigger-fg` | `sider-trigger` | `color` | `default` | `--xh-fg-default` | layout 的 sider-trigger 部件 color 覆盖槽。 |
| `--xh-layout-sider-trigger-gap` | `sider-trigger` | `gap` | `default` | `--xh-control-gap-sm` | layout 的 sider-trigger 部件 gap 覆盖槽。 |
| `--xh-layout-sider-trigger-px` | `sider-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | layout 的 sider-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-layout-sider-trigger-radius` | `sider-trigger` | `border-radius` | `default` | `--xh-shape-control` | layout 的 sider-trigger 部件 border-radius 覆盖槽。 |
| `--xh-layout-sider-w` | `root`<br>`sider` | `inline-size` | `@media (min-width: 1024px)`<br>`@media (min-width: 1280px)`<br>`@media (min-width: 640px)`<br>`@media (min-width: 768px)`<br>`default`<br>`presentation=sheet`<br>`sider-breakpoint=lg`<br>`sider-breakpoint=md`<br>`sider-breakpoint=sm`<br>`sider-breakpoint=xl` | `15rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `inline-size` · `opacity` · `scale` · `translate` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

- `siderBreakpoint` 在指定断点以下折叠侧栏。
- `siderPresentation="sheet"` 在窄屏以覆盖层显示侧栏。
- 覆盖侧栏可通过遮罩或 Escape 收起。
- 覆盖侧栏不是模态内容；模态导航使用[抽屉](./drawer)。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
