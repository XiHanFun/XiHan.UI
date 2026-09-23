# Dialog 对话框

浮在页面之上的一层，通常需要用户处理完成后才能回到页面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/dialog" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/dialog.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/dialog" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/dialog" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/dialog.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

不传 open 即为非受控；Esc 或点击遮罩关闭，关闭后焦点回到触发按钮

<XhDemo src="dialog/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `header` · `indicator` · `title` · `description` · `body` · `footer` · `close-trigger`

## 示例

### 受控

传入 open 后由宿主决定，组件自身不再修改状态；Esc、点击遮罩、按关闭按钮都只回写 open

<XhDemo src="dialog/02-controlled" />

### 警示对话框

role=alertdialog 交给读屏更强的语气；关闭 Esc 与点击遮罩后，只剩内部两个按钮可以离开

<XhDemo src="dialog/03-alert" />

### 尺寸

size 写为 content 的 data-size，只改变面板的最大宽度；三档各自一个对话框，打开后才可见宽窄差异

<XhDemo src="dialog/04-size" />

### 头尾固定、正文滚动

header / body / footer 把面板切为三段：头与尾固定在原处，只有正文一段滚动

<XhDemo src="dialog/05-scroll" />

### 异步确认

提交期间按钮显示加载，Esc 与点击遮罩两条出口一并封闭，落定之后才把 open 写回 false

<XhDemo src="dialog/06-async" />

### 命令式确认框

一次函数调用把描述符推入表中并展开对话框；返回的对象随后可修改标题、正文与按钮状态，表中即当前所有实例

<XhDemo src="dialog/07-imperative" />

### 拖动标题栏移动窗口

指针按在标题上，沿 DOM 找到 content 部件，把累计位移写进它的 translate；入场动画使用 transform，两者互不覆盖

<XhDemo src="dialog/08-draggable" />

### 命令式服务

createDialogService 的 confirm 与单按钮预设：一行调用弹出，onOk 返回 Promise 时确认按钮自动 pending 并阻止关闭；多次调用排队依次弹出

<XhDemo src="dialog/09-service" />

## 设计指引

### 何时使用

- 需要用户做出决定且不能忽略（确认删除、填写必要信息）。
- 一段独立的子任务，完成后回到原处。

### 何时不用

- 只提示一条结果时，使用[轻提示](./toast)。
- 内容是页面主流程的一部分时，直接展开在页面内。
- 内容很长或是完整表单时，使用[抽屉](./drawer)或单独页面。

### 特性

- `modal` 决定是否锁住下层：非模态不创建遮罩，页面仍可点击、聚焦和滚动；展开期间切换会同步更新这些约束。
- 焦点进入时落在 `initialFocus`，关闭后归还触发器。
- `closeOnEscape` 与 `closeOnInteractOutside` 可分别关闭，避免填写中的表单因误点外部而丢失。
- 内容区可以内部滚动，标题栏可以拖动移动窗口。Body 是模态滚动面：滚到头不带动页面，内容高度变化时保留稳定的滚动条空道。
- 面板走 M4 sheet 三件套（描边、不透明底、投影）。触发器与关闭按钮走 Action Control 家族配方：触发器为 text 档中性描边，关闭按钮为 icon 档 ghost 面，悬停与按下沿画布承载阶梯换底，Space / Enter 与触屏按住期间投影 `data-pressed`。标题为 heading-3，说明文字为 13px 说明档。
- 关闭时内容立即失活并退出可访问树，内容与遮罩的有限退场动画全部完成后再释放模态资源，并发出 `onExitComplete` / `exit-complete`。重开撤销旧退出，卸载立即清理。
- 另有命令式服务，业务代码一次调用即可弹出。
- 命令式服务与声明式组件共用 `Header / Body / Footer` 三段：标题和徽记在 Header，字符串、函数正文及取值表单在 Body，操作按钮在 Footer。长内容只滚动 Body，头尾保留在面板内。
- 命令式服务的 `onOk` 返回 `false` 只阻止关闭；同步抛错或 Promise 拒绝会保持对话框打开，设置独立 `service.actionError` 并触发 `onActionError({ cause })`。`cause` 保留原始异常，不直接转成用户提示。
- 失败提示通过服务的 `actionErrorText` 本地化：Vue 支持字符串/ref/getter，React 支持字符串/getter，Web Components 使用字符串，与各端按钮文案合同一致；提示位于 Body 的 `role=alert` 实时区。重试先清理旧异常，关闭或切换请求后旧 Promise 不再写回。
- 服务宿主或函数正文渲染失败会拒绝所属请求，`onActionError` 通知自身失败也会拒绝所属请求；业务需要处理返回 Promise 的拒绝。显式 `target` 必须是当前文档中已经连接的元素，无法展示时不会解析为取消或永久等待。

### 组合

- 内容区放[滚动区域](./scroll-area)；按钮行使用[按钮组](./button-group)；轻量确认场景改用[弹出确认](./popconfirm)。

### 最佳实践

- 标题说明本次要做什么，不写“提示”。
- 确认按钮的文字写具体动作（“删除”），不写“确定”。
- 破坏性操作使用危险语气，并让取消成为默认焦点。

### 反模式

- 在对话框内再打开对话框。
- 内部有未保存的输入却允许点击外部关闭。

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
| `initialFocus` | `string` |  | 展开后先聚焦到 content 内匹配该选择器的元素；选择器不匹配时回退为默认聚焦顺序。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。只影响 content 的最大宽度，写在 content 上（本组件没有 root 部件）。 |
| `variant` | `OverlayBackdropVariant` |  | 遮罩形态：opaque / blur / transparent。写在 backdrop 上，只影响该层的底色与模糊。 |
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

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhDialogContent` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhDialogRoot` | `children` | `SlotChildren<DialogRootSlotProps>` |  |  |

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

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE` · `PRESS.START` · `PRESS.END`

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
| `Enter` / `Space` | held in trigger / close-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或面板收起撤下 |

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
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-variant` | props.variant |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `close-trigger` | `data-pressed` | ''（条件成立时才出现） |
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
| `--xh-dialog-backdrop-bg` | `backdrop` | `background` | `default` | `--xh-bg-overlay` | dialog 的 backdrop 部件 background 覆盖槽。 |
| `--xh-dialog-backdrop-blur` | `backdrop` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `variant=blur` | `--xh-overlay-backdrop-blur` | dialog 的 backdrop 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-filter` | `backdrop`<br>`content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default`<br>`variant=blur` | `--xh-dialog-backdrop-blur`<br>`--xh-material-elevated-backdrop` | dialog 的 backdrop、content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-backdrop-layer` | `backdrop` | `z-index` | `default` | `--xh-_layer` | dialog 的 backdrop 部件 z-index 覆盖槽。 |
| `--xh-dialog-bg` | `content` | `background` | `@media (forced-colors: active)`<br>`default` | `--xh-material-elevated-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-border` | `content` | `border` | `default` | `--xh-material-elevated-border` | dialog 的 content 部件 border 覆盖槽。 |
| `--xh-dialog-close-bg-active` | `close-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-bg-pressed` | dialog 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-dialog-close-bg-focus` | `close-trigger` | `background-color` | `focus-visible` | `--xh-_action-variant-bg-focus-visible` | dialog 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-dialog-close-bg-hover` | `close-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-_action-variant-bg-hover` | dialog 的 close-trigger 部件 background-color 覆盖槽。 |
| `--xh-dialog-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-focus` | `close-trigger` | `color` | `focus-visible` | `--xh-dialog-close-fg-hover` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-fg-hover` | `close-trigger` | `color` | `disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-pressed` | dialog 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-dialog-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | dialog 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-dialog-close-size` | `close-trigger`<br>`content`<br>`title` | `block-size`<br>`inline-size`<br>`padding-inline-end` | `default`<br>`has([data-scope='dialog'][data-part='close-trigger'])`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size`<br>`--xh-control-h-sm` | dialog 的 close-trigger、content、title 部件 block-size、inline-size、padding-inline-end 覆盖槽。 |
| `--xh-dialog-content-backdrop-filter` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-dialog-backdrop-filter` | dialog 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-dialog-content-lens-bg` | `content` | `background` | `default` | `--xh-dialog-header-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-content-lens-depth` | `content` | `background` | `default` | `--xh-dialog-header-lens-depth` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | dialog 的 description 部件 color 覆盖槽。 |
| `--xh-dialog-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | dialog 的 description 部件 font-size 覆盖槽。 |
| `--xh-dialog-fg` | `content` | `color` | `default` | `--xh-material-elevated-fg` | dialog 的 content 部件 color 覆盖槽。 |
| `--xh-dialog-footer-gap` | `footer` | `gap` | `default` | `--xh-control-gap-md` | dialog 的 footer 部件 gap 覆盖槽。 |
| `--xh-dialog-footer-pt` | `footer` | `padding-block-start` | `default` | `--xh-space-2` | dialog 的 footer 部件 padding-block-start 覆盖槽。 |
| `--xh-dialog-gap` | `content` | `gap` | `default` | `--xh-stack-gap-md` | dialog 的 content 部件 gap 覆盖槽。 |
| `--xh-dialog-header-bg` | `content` | `background` | `default` | `--xh-material-elevated-bg` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-gap` | `header` | `gap` | `default` | `--xh-stack-gap-sm` | dialog 的 header 部件 gap 覆盖槽。 |
| `--xh-dialog-header-lens-depth` | `content` | `background` | `default` | `--xh-dialog-py` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-header-pb` | `header` | `padding-block-end` | `default` | `--xh-space-2` | dialog 的 header 部件 padding-block-end 覆盖槽。 |
| `--xh-dialog-highlight` | `content` | `background` | `default` | `--xh-material-elevated-highlight` | dialog 的 content 部件 background 覆盖槽。 |
| `--xh-dialog-icon-size` | `close-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | dialog 的 close-trigger、content、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-bg` | `indicator` | `background` | `default` | `--xh-_tone-subtle` | dialog 的 indicator 部件 background 覆盖槽。 |
| `--xh-dialog-indicator-fg` | `indicator` | `color` | `default` | `--xh-_tone-fg` | dialog 的 indicator 部件 color 覆盖槽。 |
| `--xh-dialog-indicator-mark-size` | `indicator` | `--xh-icon-size` | `default` | `--xh-dialog-indicator-size` | dialog 的 indicator 部件 --xh-icon-size 覆盖槽。 |
| `--xh-dialog-indicator-radius` | `indicator` | `border-radius` | `default` | `--xh-shape-circle` | dialog 的 indicator 部件 border-radius 覆盖槽。 |
| `--xh-dialog-indicator-size` | `indicator` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-glyph-size-md` | dialog 的 indicator 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-dialog-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | dialog 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-dialog-max-w` | `content` | `max-inline-size` | `default` | `--xh-_dialog-max-w` | dialog 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-dialog-positioner-padding` | `positioner` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-4` | dialog 的 positioner 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-dialog-px` | `content` | `padding-inline` | `default` | `--xh-surface-px-md` | dialog 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-dialog-py` | `content` | `background`<br>`padding-block` | `default` | `--xh-surface-py-md` | dialog 的 content 部件 background、padding-block 覆盖槽。 |
| `--xh-dialog-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | dialog 的 content 部件 border-radius 覆盖槽。 |
| `--xh-dialog-separator` | `body`<br>`content`<br>`footer`<br>`header` | `border-block-end`<br>`border-block-start` | `has([data-scope='dialog'][data-part='body'])`<br>`has([data-scope='dialog'][data-part='footer'])` | `--xh-material-elevated-separator` | dialog 的 body、content、footer、header 部件 border-block-end、border-block-start 覆盖槽。 |
| `--xh-dialog-shadow` | `content` | `box-shadow` | `default` | `--xh-material-elevated-shadow` | dialog 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-dialog-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | dialog 的 title 部件 color 覆盖槽。 |
| `--xh-dialog-title-font-size` | `title` | `font-size` | `default` | `--xh-text-heading-3-size` | dialog 的 title 部件 font-size 覆盖槽。 |
| `--xh-dialog-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-heading-3-weight` | dialog 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-dialog-in` · `xh-dialog-out` 随皮肤自带，不引用别处文件里的名字；共享关键帧 `xh-fade-in` · `xh-fade-out` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
