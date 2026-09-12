# Drawer <Badge type="info" text="抽屉" />

从屏幕某一边滑出的面板。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/drawer" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/drawer.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/drawer" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/drawer" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/drawer.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动

<XhDemo src="drawer/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `header` · `title` · `description` · `body` · `footer` · `close-trigger`

## 示例

### 贴边方向

side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边

<XhDemo src="drawer/02-side" />

### 受控

传了 open 就由宿主说了算；Escape、点面板外、按叉都只回写 open，不自己改状态

<XhDemo src="drawer/03-controlled" />

### 尺寸

size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄

<XhDemo src="drawer/04-size" />

### 头尾固定、正文滚动

header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚

<XhDemo src="drawer/05-scroll" />

### 关闭前拦截

受控时组件不自改状态：Escape、点面板外、按叉都只发一次收起意图，写不写由宿主定

<XhDemo src="drawer/06-guard" />

### 拖边缘改厚度

面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算

<XhDemo src="drawer/07-resize" />

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换成 absolute，只罩住那块区域而不是盖满整屏

<XhDemo src="drawer/08-contained" />

## 设计指引

### 何时使用

- 内容比对话框长（一整张表单、一份详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

### 何时不用

- 只是确认一件事：用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照着看：并排展开，别遮住。

### 特性

- `side` 决定从哪一边出来；`contained` 让它只占据某个容器而不是整个视口。
- `modal=false` 时不渲染遮罩，定位层也不截获页面指针；页面可以与抽屉并行交互。展开期间切换 `modal`，滚动锁、背景失活与焦点陷阱会同步切换。
- 可以拖边缘改厚度。
- 关闭时内容立即失活并退出可访问树；面板与遮罩全部完成退场后释放模态资源并发出 `onExitComplete` / `exit-complete`。退场中重开不会被旧完成关闭，卸载立即清理。
- 关闭前可以拦截（有未保存改动时先问一句）。

### 组合

- 里面放[表单](./form)、[侧栏导航](./side-nav)；内容区套[滚动区域](./scroll-area)。

### 最佳实践

- 提交与取消固定在底部，别让用户滚到最下面才找得到。
- 有未保存改动时拦下关闭。

### 反模式

- 抽屉里再开抽屉。
- 在宽屏上用抽屉装本可以直接展开的内容。

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
| `contained` | `boolean` |  | 浮层挂在某个局部容器里而不是视口：遮罩与定位层从 fixed 换成 absolute， 于是只罩住那个容器、不再盖满整屏。 挂到哪个容器是适配器的事（Vue 由 root 的 container 决定，WC 本就是 Light DOM、 作者写在哪就在哪），这里只表达「按局部容器画」这一件事。 |
| `side` | `DrawerSide` |  | 从哪条边滑出，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横放时换面板宽度、竖放时换面板高度，随 side 而定。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
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

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `side` | `DrawerSide` | 已解析的滑出边（prop 缺省时是默认值），作者据此配动画。 |
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

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-drawer-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | drawer 的 backdrop 部件 background 覆盖槽。 |
| `--xh-drawer-backdrop-blur` | `backdrop` | `backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | drawer 的 backdrop 部件 backdrop-filter 覆盖槽。 |
| `--xh-drawer-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | drawer 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-drawer-bg` | `content` | `background` | `default` | `--xh-bg-surface` | drawer 的 content 部件 background 覆盖槽。 |
| `--xh-drawer-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | drawer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-close-bg-hover` | `close-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | drawer 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-drawer-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-fg-hover` | `close-trigger` | `color` | `hover` | `--xh-fg-default` | drawer 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-drawer-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-drawer-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='drawer'][data-part='close-trigger'])` | `--xh-control-h-sm` | drawer 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-drawer-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | drawer 的 description 部件 color 覆盖槽。 |
| `--xh-drawer-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | drawer 的 description 部件 font-size 覆盖槽。 |
| `--xh-drawer-fg` | `content` | `color` | `default` | `--xh-fg-default` | drawer 的 content 部件 color 覆盖槽。 |
| `--xh-drawer-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 footer 部件 gap 覆盖槽。 |
| `--xh-drawer-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | drawer 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-drawer-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | drawer 的 content 部件 gap 覆盖槽。 |
| `--xh-drawer-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | drawer 的 header 部件 gap 覆盖槽。 |
| `--xh-drawer-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | drawer 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-drawer-icon-size` | `content`<br>`root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | drawer 的 content、root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-drawer-layer` | `content`<br>`positioner` | `z-index` | `default` | `--xh-_layer` | drawer 的 content、positioner 部件 z-index 覆盖槽。 |
| `--xh-drawer-px` | `content` | `padding-inline` | `contained`<br>`default` | `--xh-surface-px-md` | drawer 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-py` | `content` | `padding-block-end`<br>`padding-block-start` | `contained`<br>`default` | `--xh-surface-py-md` | drawer 的 content 部件 padding-block-end、padding-block-start 覆盖槽。 |
| `--xh-drawer-radius` | `content` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-shape-surface` | drawer 的 content 部件 border-end-end-radius、border-end-start-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-drawer-shadow` | `content` | `box-shadow` | `default` | `--xh-elevation-sheet` | drawer 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-drawer-size` | `content` | `block-size`<br>`inline-size` | `side=bottom`<br>`side=left`<br>`side=right`<br>`side=top` | `--xh-_drawer-size` | drawer 的 content 部件 block-size、inline-size 覆盖槽。 |
| `--xh-drawer-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | drawer 的 title 部件 color 覆盖槽。 |
| `--xh-drawer-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | drawer 的 title 部件 font-size 覆盖槽。 |
| `--xh-drawer-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | drawer 的 title 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-bg` | `trigger` | `background` | `default` | `--xh-bg-canvas` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-active` | `trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-hover` | `trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-bg-open` | `trigger` | `background` | `state=open` | `--xh-bg-subtle-active` | drawer 的 trigger 部件 background 覆盖槽。 |
| `--xh-drawer-trigger-border` | `trigger` | `border` | `default` | `--xh-border-control` | drawer 的 trigger 部件 border 覆盖槽。 |
| `--xh-drawer-trigger-border-hover` | `trigger` | `border-color` | `hover`<br>`not(:disabled)` | `--xh-border-control-hover` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-border-open` | `trigger` | `border-color` | `state=open` | `--xh-border-control-hover` | drawer 的 trigger 部件 border-color 覆盖槽。 |
| `--xh-drawer-trigger-fg` | `trigger` | `color` | `default` | `--xh-fg-default` | drawer 的 trigger 部件 color 覆盖槽。 |
| `--xh-drawer-trigger-font-size` | `trigger` | `font-size` | `default` | `--xh-text-label-size` | drawer 的 trigger 部件 font-size 覆盖槽。 |
| `--xh-drawer-trigger-font-weight` | `trigger` | `font-weight` | `default` | `--xh-text-label-weight` | drawer 的 trigger 部件 font-weight 覆盖槽。 |
| `--xh-drawer-trigger-gap` | `trigger` | `gap` | `default` | `--xh-control-gap-md` | drawer 的 trigger 部件 gap 覆盖槽。 |
| `--xh-drawer-trigger-h` | `trigger` | `block-size` | `default` | `--xh-control-h-md` | drawer 的 trigger 部件 block-size 覆盖槽。 |
| `--xh-drawer-trigger-px` | `trigger` | `padding-inline` | `default` | `--xh-control-px-md` | drawer 的 trigger 部件 padding-inline 覆盖槽。 |
| `--xh-drawer-trigger-radius` | `trigger` | `border-radius` | `default` | `--xh-shape-control` | drawer 的 trigger 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-drawer-in-bottom` · `xh-drawer-in-left` · `xh-drawer-in-right` · `xh-drawer-in-top` · `xh-drawer-out-bottom` · `xh-drawer-out-left` · `xh-drawer-out-right` · `xh-drawer-out-top` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；`background` · `border-color` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。
