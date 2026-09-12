# Dialog <Badge type="info" text="对话框" />

浮在页面之上的一层，通常需要用户处理完才能回到下面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/dialog" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/dialog.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/dialog" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/dialog" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/dialog.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Esc 或点遮罩关闭，关闭后焦点回到触发按钮

<XhDemo src="dialog/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `header` · `indicator` · `title` · `description` · `body` · `footer` · `close-trigger`

## 示例

### 受控

传了 open 就由宿主说了算，组件自己不再改状态；Esc、点遮罩、按叉都只回写 open

<XhDemo src="dialog/02-controlled" />

### 警示对话框

role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去

<XhDemo src="dialog/03-alert" />

### 尺寸

size 落成 content 的 data-size，只改面板的最大宽度；三档各自一个对话框，点开才看得出宽窄

<XhDemo src="dialog/04-size" />

### 头尾固定、正文滚动

header / body / footer 把面板切成三段：头与尾定在原处，只有正文那一段在滚

<XhDemo src="dialog/05-scroll" />

### 异步确认

提交期间按钮转圈，Esc 与点遮罩这两条出口一并封住，落定之后才把 open 写回 false

<XhDemo src="dialog/06-async" />

### 命令式确认框

一次函数调用把描述符推进表里并展开对话框；拿回的对象随后可改标题、正文与按钮状态，表里就是当前所有实例

<XhDemo src="dialog/07-imperative" />

### 拖动标题栏挪窗口

指针按在标题上，顺着 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画走的是 transform，两者互不覆盖

<XhDemo src="dialog/08-draggable" />

### 命令式服务

createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认钮自动 pending 并拦住关闭；多次调用排队顺次弹

<XhDemo src="dialog/09-service" />

## 设计指引

### 何时使用

- 需要用户做出决定且不能忽略（确认删除、填一段必要信息）。
- 一段独立的子任务，完成后回到原处。

### 何时不用

- 只是提示一条结果：用[轻提示](./toast)。
- 内容是页面主流程的一部分：直接展开在页面里。
- 内容很长或是一整个表单：用[抽屉](./drawer)或单独一页。

### 特性

- `modal` 决定是否锁住下层：非模态不创建遮罩，页面仍可点击、聚焦和滚动；展开期间切换会同步更新这些约束。
- 焦点进入时落在 `initialFocus`，关闭后归还触发器。
- `closeOnEscape` 与 `closeOnInteractOutside` 各自可关——填了一半的表单不该点一下外面就没了。
- 内容区可以内部滚动，标题栏可以拖动挪窗口。
- 关闭时内容立即失活并退出可访问树，内容与遮罩的有限退场动画全部完成后再释放模态资源，并发出 `onExitComplete` / `exit-complete`。重开撤销旧退出，卸载立即清理。
- 另有命令式服务，业务代码一次调用即弹出。
- 命令式服务与声明式组件共用 `Header / Body / Footer` 三段：标题和徽记在 Header，字符串、函数正文及取值表单在 Body，操作按钮在 Footer。长内容只滚动 Body，头尾保留在面板内。
- 命令式服务的 `onOk` 返回 `false` 只阻止关闭；同步抛错或 Promise 拒绝会保持对话框打开，设置独立 `service.actionError` 并触发 `onActionError({ cause })`。`cause` 保留原始异常，不直接转成用户提示。
- 失败提示通过服务的 `actionErrorText` 本地化：Vue 支持字符串/ref/getter，React 支持字符串/getter，Web Components 使用字符串，与各端按钮文案合同一致；提示位于 Body 的 `role=alert` 实时区。重试先清理旧异常，关闭或切换请求后旧 Promise 不再写回。
- 服务宿主或函数正文渲染失败会拒绝所属请求，`onActionError` 通知自身失败也会拒绝所属请求；业务需要处理返回 Promise 的拒绝。显式 `target` 必须是当前文档中已经连接的元素，无法展示时不会解析为取消或永久等待。

### 组合

- 内容区套[滚动区域](./scroll-area)；按钮行用[按钮组](./button-group)；确认类的轻量场景改用[弹出确认](./popconfirm)。

### 最佳实践

- 标题写这次要做什么，别写"提示"。
- 确认按钮的文字写具体动作（"删除"），不写"确定"。
- 破坏性操作用危险语气，并让取消是默认焦点。

### 反模式

- 对话框里再开对话框。
- 点外面就关，而里面有未保存的输入。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogBody` `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogFooter` `XhDialogHeader` `XhDialogIndicator` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styles/dialog.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `initialFocus` | `string` |  | 展开后先聚焦到 content 内匹配此选择器的元素；选择器不匹配时回落默认聚焦顺序。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只换 content 的最大宽度，落在 content 上（本组件没有 root 部件）。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。落在 backdrop 上，只换那一层的底色与模糊。 |
| `translations` | `Partial<DialogTranslations>` |  |  |
| `onOpenChange` | `(details: DialogOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `onExitComplete` | `() => void` |  | 退出动画结束或取消，且本层资源全部释放后通知；卸载和重新打开不通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `exit-complete` | `CustomEvent` | 退出完成且本层资源已释放 |
| `open-change` | `DialogOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDialogRoot` | `default` | `DialogRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
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
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
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
| `Enter` / `Space` | focus in trigger | 打开对话框并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |

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
| `indicator` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/dialog.css` 使用 `[data-scope="dialog"][data-part="trigger"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-dialog-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | dialog 的 backdrop 部件 background 覆盖槽。 |
| `--xh-dialog-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | dialog 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-filter` | `backdrop`<br>`content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default`<br>`variant=blur` | `--xh-dialog-backdrop-blur`<br>`--xh-material-elevated-backdrop` | dialog 的 backdrop、content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | dialog 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-dialog-bg` | `content` | `background` | `@media (forced-colors: active)`<br>`default` | `--xh-material-elevated-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | dialog 的 content 部件 border 覆盖槽。 |
| `--xh-dialog-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-bg-focus` | `close-trigger` | `background` | `focus-visible` | `--xh-material-elevated-focus-surface` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-bg-hover` | `close-trigger` | `background` | `hover` | `--xh-bg-subtle-hover` | dialog 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-dialog-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-material-elevated-fg` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-hover` | `close-trigger` | `color` | `hover` | `--xh-fg-default` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | dialog 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-dialog-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='dialog'][data-part='close-trigger'])` | `--xh-control-h-sm` | dialog 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-dialog-content-backdrop-filter` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-dialog-backdrop-filter` | dialog 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-content-lens-bg` | `content` | `background` | `default` | `--xh-dialog-header-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-content-lens-depth` | `content` | `background` | `default` | `--xh-dialog-header-lens-depth` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | dialog 的 description 部件 color 覆盖槽。 |
| `--xh-dialog-description-font-size` | `description` | `font-size` | `default` | `--xh-text-body-size` | dialog 的 description 部件 font-size 覆盖槽。 |
| `--xh-dialog-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | dialog 的 content 部件 color 覆盖槽。 |
| `--xh-dialog-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | dialog 的 footer 部件 gap 覆盖槽。 |
| `--xh-dialog-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | dialog 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-dialog-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | dialog 的 content 部件 gap 覆盖槽。 |
| `--xh-dialog-header-bg` | `content` | `background` | `default` | `--xh-material-glass-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | dialog 的 header 部件 gap 覆盖槽。 |
| `--xh-dialog-header-lens-depth` | `content` | `background` | `default` | `--xh-dialog-py` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | dialog 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-dialog-highlight` | `content` | `background` | `default` | `--xh-material-elevated-highlight` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-icon-size` | `content` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | dialog 的 content 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-subtle` | dialog 的 indicator 部件 background 覆盖槽。 |
| `--xh-dialog-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` | dialog 的 indicator 部件 color 覆盖槽。 |
| `--xh-dialog-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-dialog-indicator-size` | dialog 的 indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-pill` | dialog 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-dialog-indicator-size` | `indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | dialog 的 indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-dialog-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | dialog 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-dialog-max-w` | `content` | `max-inline-size` | `default` | `--xh-_dialog-max-w` | dialog 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-dialog-positioner-padding` | `positioner` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-4` | dialog 的 positioner 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-dialog-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` | dialog 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-dialog-py` | `content` | `background`<br>`padding-block` | `default` | `--xh-surface-py-md` | dialog 的 content 部件 background、padding-block 覆盖槽。 |
| `--xh-dialog-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | dialog 的 content 部件 border-radius 覆盖槽。 |
| `--xh-dialog-separator` | `body`<br>`content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='dialog'][data-part='body'])`<br>`has([data-scope='dialog'][data-part='footer'])` | `--xh-material-elevated-separator` | dialog 的 body、content、footer、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-dialog-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | dialog 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-dialog-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | dialog 的 title 部件 color 覆盖槽。 |
| `--xh-dialog-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | dialog 的 title 部件 font-size 覆盖槽。 |
| `--xh-dialog-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | dialog 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-dialog-in` · `xh-dialog-out` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
