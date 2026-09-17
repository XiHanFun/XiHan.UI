# Drawer 抽屉 <Badge type="info" text="alpha" />

从屏幕某一边滑出的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Escape 关闭、Tab 在面板内循环，展开期间页面不可滚动

<XhDemo src="drawer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `close-trigger`

## 示例

### 贴边方向

side 只写为 data-side，面板贴在哪条边由皮肤按该值决定；root 与 content 报告的是同一条边

<XhDemo src="drawer/02-side" />

### 受控

传入 open 后由宿主决定；Escape、点击面板外、按关闭按钮都只回写 open，不自行修改状态

<XhDemo src="drawer/03-controlled" />

### 尺寸

size 写为 content 的 data-size，只改变面板贴边方向上的厚度；三档各自一个抽屉，打开后才可见厚度差异

<XhDemo src="drawer/04-size" />

### 头尾固定、正文滚动

header / body / footer 把面板切为三段：头与尾固定在原处，只有正文一段滚动

<XhDemo src="drawer/05-scroll" />

### 关闭前拦截

受控时组件不自行修改状态：Escape、点击面板外、按关闭按钮都只发一次收起意图，是否写回由宿主决定

<XhDemo src="drawer/06-guard" />

### 拖动边缘改变厚度

面板中放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；该槽覆盖 size 三档，滑入滑出仍按面板自身宽度计算

<XhDemo src="drawer/07-resize" />

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换为 absolute，只覆盖该区域而不是整屏

<XhDemo src="drawer/08-contained" />

## 设计指引

### 何时使用

- 内容比对话框长（完整表单、详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

### 何时不用

- 只确认一件事时，使用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照查看时，并排展开，不遮挡。

### 特性

- `side` 决定滑出方向；`contained` 让它只占据某个容器而不是整个视口。
- `modal=false` 时不渲染遮罩，定位层也不截获页面指针；页面可以与抽屉并行交互。展开期间切换 `modal`，滚动锁、背景失活与焦点陷阱会同步切换。
- 可以拖动边缘调整厚度。
- 关闭时内容立即失活并退出可访问树；面板与遮罩全部完成退场后释放模态资源并发出 `onExitComplete` / `exit-complete`。退场中重开不会被旧完成关闭，卸载立即清理。
- 关闭前可以拦截，例如有未保存改动时先确认。
- 面板走 M4 sheet 三件套（1px 描边、不透明底、投影），边界由描边承担，不只靠影分层；入场是整面板从画外推入的大尺度位移，走 slide 时长与曲线，退场仍走 exit 档。
- 触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，展开期间压住为悬停同档的中性面；关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底；Space / Enter 与触屏按住期间投影 `data-pressed`。标题为 heading-3，说明文字为 13px 说明档。
- Body 是模态滚动面：滚到头不带动页面，内容高度变化时保留稳定的滚动条空道；不用三段结构时 content 自身是唯一滚动层。

### 组合

- 内部放[表单](./form)、[侧栏导航](./side-nav)；内容区使用[滚动区域](./scroll-area)。

### 最佳实践

- 提交与取消固定在底部，用户不需要滚动到底部查找。
- 有未保存改动时拦截关闭。

### 反模式

- 在抽屉内再打开抽屉。
- 在宽屏上用抽屉承载可以直接展开的内容。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerBody` `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerFooter` `XhDrawerHeader` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styles/drawer.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  | 是否启用模态约束，默认 true。false 时不提供遮罩，页面其余部分保持可交互； 展开期间可以切换，滚动锁、背景失活与焦点陷阱会同步更新。 |
| `contained` | `boolean` |  | 浮层挂在局部容器中而不是视口：遮罩与定位层从 fixed 改为 absolute， 因此只覆盖该容器、不再覆盖整屏。 挂到哪个容器由适配器决定（Vue 由 root 的 container 决定，WC 本身是 Light DOM、 作者写在何处即在何处），这里只表达按局部容器绘制这一点。 |
| `side` | `DrawerSide` |  | 滑出的边，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横向放置时影响面板宽度、纵向放置时影响面板高度，随 side 而定。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `open-change` | `DrawerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `side` | `DrawerSide` | 已解析的滑出边（prop 未提供时是默认值），作者据此配置动画。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getBodyProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或抽屉收起撤下 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-hidden` | !open \|\| undefined |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/drawer.css` 使用 `[data-scope="drawer"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-contained` | ''（条件成立时才出现） |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-contained` | ''（条件成立时才出现） |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-contained` | ''（条件成立时才出现） |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | ''（条件成立时才出现） |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `close-trigger` | `data-xh-action-control` | '' |
| `close-trigger` | `data-xh-action-display` | 'always' |
| `close-trigger` | `data-xh-action-profile` | 'icon' |
| `close-trigger` | `data-xh-action-size` | 'sm' |
| `close-trigger` | `data-xh-action-variant` | 'ghost' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | drawer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-drawer-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | drawer 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | drawer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` | drawer 的 content 部件 background 覆盖槽。 |
| `--xh-drawer-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | drawer 的 content 部件 border 覆盖槽。 |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | drawer 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | drawer 的 description 部件 color 覆盖槽。 |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | drawer 的 description 部件 font-size 覆盖槽。 |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | drawer 的 content 部件 color 覆盖槽。 |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 footer 部件 gap 覆盖槽。 |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | drawer 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | drawer 的 content 部件 gap 覆盖槽。 |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | drawer 的 header 部件 gap 覆盖槽。 |
| `--xh-drawer-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | drawer 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-drawer-icon-size` | `close-trigger`<br>`content`<br>`root`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | drawer 的 close-trigger、content、root、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` | drawer 的 content、positioner 部件 z-index 覆盖槽。 |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-md` | drawer 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-surface-py-md` | drawer 的 content 部件 padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-overlay` | drawer 的 content 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | drawer 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` | drawer 的 content 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | drawer 的 title 部件 color 覆盖槽。 |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | drawer 的 title 部件 font-size 覆盖槽。 |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | drawer 的 title 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-bg` | `trigger` | `background-color` | `default`<br>`focus-visible` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-rest` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-bg-open` | `trigger` | `background-color` | `focus-visible`<br>`state=open` | `--xh-bg-subtle` | drawer 的 trigger 部件 background-color 覆盖槽。 |
| `--xh-drawer-trigger-border` | `trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-_action-variant-border-focus-visible`<br>`--xh-_action-variant-border-rest` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-border-hover`<br>`--xh-_action-variant-border-pressed` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-open` | `trigger` | `border`<br>`border-color` | `focus-visible`<br>`state=open` | `--xh-border-control-hover` | drawer 的 trigger 部件 border、border-color 覆盖槽。 |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | drawer 的 trigger 部件 color 覆盖槽。 |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-_action-profile-font-size` | drawer 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | drawer 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-_action-profile-gap` | drawer 的 trigger 部件 gap 覆盖槽。 |
| `--xh-drawer-trigger-h` | `trigger` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | drawer 的 trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | drawer 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-drawer-in-bottom` · `xh-drawer-in-left` · `xh-drawer-in-right` · `xh-drawer-in-top` · `xh-drawer-out-bottom` · `xh-drawer-out-left` · `xh-drawer-out-right` · `xh-drawer-out-top` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-fade-in` · `xh-fade-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
