# Layout 布局 <Badge type="info" text="alpha" />

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

<XhDemo src="layout/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="layout"`：**`root`** · `header` · `sider-backdrop` · `sider` · `content` · `footer` · `sider-trigger`

## 示例

### 折叠侧栏

保留侧栏节点并切换宽度

<XhDemo src="layout/02-sider-collapse" />

### 侧栏位置

将侧栏放在行首或行尾

<XhDemo src="layout/03-sider-placement" />

### 固定区域

固定页头和侧栏

<XhDemo src="layout/04-fixed" />

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
| `siderCollapsed` | `boolean` |  | 受控折叠态：提供后由宿主决定。 |
| `defaultSiderCollapsed` | `boolean` |  | 非受控初始折叠态。 |
| `siderWidth` | `string` |  | 展开时侧栏的宽度，任意 CSS 长度；未提供时使用皮肤中的档位。 |
| `siderCollapsedWidth` | `string` |  | 折叠时侧栏的宽度，任意 CSS 长度；未提供时使用皮肤中的档位。 |
| `siderPlacement` | `LayoutSiderPlacement` |  | 侧栏挂在行首还是行尾，默认 start。 |
| `siderBreakpoint` | `LayoutBreakpoint` |  | 侧栏的自适应断点：视口窄于该档时侧栏按折叠宽显示。 只切换宽度不改变折叠态：折叠态归 siderCollapsed 通道，两者互不干扰。 运行期更换档位会重新绑定媒体查询；需要所属 Window.matchMedia 与对应断点令牌。 |
| `siderPresentation` | `LayoutSiderPresentation` |  | 侧栏呈现形态，默认 inline（在骨架中占一列）。 sheet 是覆盖档：侧栏移出画外，展开时覆盖在内容之上并铺一层遮罩，内容因此占满整宽。 同时提供 siderBreakpoint 时它只在未达该档时成立：宽屏仍占一列，窄屏才覆盖， 且跨档时侧栏随之开合（进入覆盖档收起、回到占位档展开），经 siderCollapsed 通道。 覆盖档不锁定焦点、不把背后的内容标记为惰性：它是骨架中的一段，不是模态浮层。 |
| `headerFixed` | `boolean` |  | 头部吸顶：滚动时头部固定在滚动容器的上沿。只写标记，固定的实现归皮肤。 |
| `siderFixed` | `boolean` |  | 侧栏吸附：滚动时侧栏固定在滚动容器的上沿，头部也吸顶时让开头部的高度。只写标记，固定的实现归皮肤。 |
| `split` | `boolean` |  | 在头部、侧栏、脚部与内容之间绘制分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onSiderBreakpoint` | `(details: LayoutSiderBreakpointDetails) => void` |  | 跨过断点时发出一次，挂载或更换档位时也发出一次当前值。 窄屏需要把侧栏换成抽屉时接入该回调：组件自身只切换宽度。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sider-collapsed-change` | `LayoutSiderCollapsedChangeDetails` | 折叠态变化；detail 为 `{ collapsed: boolean }` |
| `sider-breakpoint` | `LayoutSiderBreakpointDetails` | 跨过断点时发出，挂载时也发出一次当前值；detail 为 `{ matched: boolean }` |

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
| `siderPresentation` | `LayoutSiderPresentation` | 已解析的侧栏呈现形态：提供断点时，覆盖档只在未达该档时成立。 |
| `setSiderCollapsed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSiderBackdropProps` | `() => T['element']` | 覆盖档铺在内容之上的遮罩：点击它收起侧栏。 占位档下它带 hidden，不占位也不接收指针。渲染时排在侧栏之前：两层同一个层号，覆盖顺序按文档序。 |
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
| `root` | `data-collapsed` | ''（条件成立时才出现） |
| `root` | `data-header-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-breakpoint` | props.siderBreakpoint |
| `root` | `data-sider-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-placement` | props.siderPlacement |
| `root` | `data-sider-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `root` | `data-split` | ''（条件成立时才出现） |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `sider-backdrop` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-collapsed` | ''（条件成立时才出现） |
| `sider` | `data-fixed` | ''（条件成立时才出现） |
| `sider` | `data-placement` | props.siderPlacement |
| `sider` | `data-presentation` | resolveSiderPresentation( prop('siderPresentation'), … |
| `sider-trigger` | `data-collapsed` | ''（条件成立时才出现） |
| `sider-trigger` | `data-xh-action-control` | '' |
| `sider-trigger` | `data-xh-action-display` | 'always' |
| `sider-trigger` | `data-xh-action-profile` | 'text' |
| `sider-trigger` | `data-xh-action-size` | 'sm' |
| `sider-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-layout-bg` | `root` | `background` | `default` | `--xh-bg-page` | layout 的 root 部件 background 覆盖槽。 |
| `--xh-layout-border` | `footer`<br>`header`<br>`root`<br>`sider` | `border-block-end`<br>`border-block-start`<br>`border-inline-end`<br>`border-inline-start` | `placement=end`<br>`placement=start`<br>`presentation=sheet`<br>`split` | `--xh-border-default`<br>`--xh-material-elevated-border` | layout 的 footer、header、root、sider 部件 border-block-end、border-block-start、border-inline-end、border-inline-start 覆盖槽。 |
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
| `--xh-layout-sider-bg` | `sider` | `background` | `default`<br>`presentation=sheet` | `--xh-bg-subtle`<br>`--xh-material-elevated-bg` | layout 的 sider 部件 background 覆盖槽。 |
| `--xh-layout-sider-collapsed-w` | `root`<br>`sider` | `inline-size` | `collapsed`<br>`sider-breakpoint` | `4rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
| `--xh-layout-sider-layer` | `sider` | `z-index` | `presentation=sheet` | `--xh-layer-drawer` | layout 的 sider 部件 z-index 覆盖槽。 |
| `--xh-layout-sider-padding` | `sider` | `padding`<br>`padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default`<br>`presentation=sheet` | `--xh-space-3` | layout 的 sider 部件 padding、padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-layout-sider-shadow` | `sider` | `box-shadow` | `presentation=sheet` | `--xh-material-elevated-shadow` | layout 的 sider 部件 box-shadow 覆盖槽。 |
| `--xh-layout-sider-trigger-bg` | `sider-trigger` | `background-color` | `default` | `--xh-_action-variant-bg-rest` | layout 的 sider-trigger 部件 background-color 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-active` | `sider-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | layout 的 sider-trigger 部件 background-color 覆盖槽。 |
| `--xh-layout-sider-trigger-bg-hover` | `sider-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | layout 的 sider-trigger 部件 background-color 覆盖槽。 |
| `--xh-layout-sider-trigger-fg` | `sider-trigger` | `color` | `default`<br>`disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | layout 的 sider-trigger 部件 color 覆盖槽。 |
| `--xh-layout-sider-trigger-gap` | `sider-trigger` | `gap` | `default` | `--xh-_action-profile-gap` | layout 的 sider-trigger 部件 gap 覆盖槽。 |
| `--xh-layout-sider-trigger-px` | `sider-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | layout 的 sider-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-layout-sider-trigger-radius` | `sider-trigger` | `border-radius` | `default` | `--xh-_action-profile-radius` | layout 的 sider-trigger 部件 border-radius 覆盖槽。 |
| `--xh-layout-sider-w` | `root`<br>`sider` | `inline-size` | `@media (min-width: 1024px)`<br>`@media (min-width: 1280px)`<br>`@media (min-width: 640px)`<br>`@media (min-width: 768px)`<br>`default`<br>`presentation=sheet`<br>`sider-breakpoint=lg`<br>`sider-breakpoint=md`<br>`sider-breakpoint=sm`<br>`sider-breakpoint=xl` | `15rem` | layout 的 root、sider 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`inline-size` · `opacity` · `translate` · `visibility` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤按视口分档：`min-width: 1024px` · `min-width: 1280px` · `min-width: 640px` · `min-width: 768px`。

- `siderBreakpoint` 在指定断点以下折叠侧栏。
- `siderPresentation="sheet"` 在窄屏以覆盖层显示侧栏。
- 覆盖侧栏可通过遮罩或 Escape 收起。
- 覆盖侧栏不是模态内容；模态导航使用[抽屉](./drawer)。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
