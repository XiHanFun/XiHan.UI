# Popconfirm 弹出确认

贴着触发器的一句确认：比对话框轻，但仍能拦住一次误操作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/popconfirm" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/popconfirm.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/popconfirm" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/popconfirm" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/popconfirm.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点击触发器就地询问，确认与取消都收起浮层；展开时焦点先落在取消上

<XhDemo src="popconfirm/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="popconfirm"`：**`root`** · **`trigger`** · `positioner` · **`content`** · `title` · `description` · **`confirm-trigger`** · **`cancel-trigger`** · `arrow`

## 示例

### 放置位

placement 是首选位，空间不足时引擎自行避让，实际落点写在 data-placement 上

<XhDemo src="popconfirm/02-placement" />

### 尺寸

size 改变面板的内边距与最大宽度，三个档位落在 content 上

<XhDemo src="popconfirm/03-size" />

### 颜色

在 content 上写 data-tone，确认按钮随之换色；语气是共享的一层，不是本组件的 prop

<XhDemo src="popconfirm/04-tone" />

### 异步确认

确认回调返回 Promise 即挂起确认门：浮层等待兑现后再收起、确认按钮显示加载且再次点击无效，拒绝（reject）时保持打开；不必再手动受控拦截收起

<XhDemo src="popconfirm/05-async-confirm" />

## 设计指引

### 何时使用

- 影响有限、可撤销的删除或清空，且触发器就在近处。

### 何时不用

- 后果严重且不可逆时，使用[对话框](./dialog)，让用户读到完整说明。
- 操作可以撤销时，直接执行并配一条带“撤销”的[轻提示](./toast)，体验优于事前确认。

### 特性

- 确认按钮支持同步返回和任意 thenable：调用业务前即占用事务，兑现后收起；同步抛错、`then` 读取失败或拒绝都会保持打开，并通过 `actionError` 与 `confirm-error` 原样暴露 `cause`。
- pending 期间重复确认、触发器切换、`setOpen(false)`、Escape 与层外交互都不会关闭。取消仍可立即终止组件的等待并收起；它不假装取消业务 Promise，迟到的兑现或拒绝按事务票据丢弃。
- 受控宿主把 `open` 写为 `false` 属于事实状态，会终止当前确认事务；此后重新写为 `true` 是新会话，旧 thenable 的结算不会关闭它或写入错误。
- 浮层是非模态 `dialog`：不捕获焦点、不锁定滚动、不隐藏页面其他内容。
- 位置、尺寸、语气三轴。
- 内容与箭头使用与 Popover 同源的 M2 磨砂表面：边界、顶光、背景模糊与投影保持连续；强制色模式撤掉装饰顶光，由系统色接管边界。
- 标题、说明与末行操作按固定节奏排布，长文案可在可用宽度内断行；说明文字为 13px 说明档。触发器与两个按钮走 Action Control 家族配方：确认是本浮层的主要动作，显式 solid 实心（语气随 content 的 `data-tone`）；取消是中性次要出口，outline 描边；触发器为 text 档中性描边。三者的按压反馈、粗指针命中区与焦点环由配方给出，Space / Enter 与触屏按住期间投影 `data-pressed`。
- pending 时在确认文案之前显示 spinner，并以 `aria-busy` / `aria-disabled` 报告状态；挂起时按钮不再响应 hover / active 换面，减弱动效下以静止点线圆环表达在途。

### 组合

- 触发器使用[按钮](./button)；放入[表格](./table)的行操作、[菜单](./menu)的条目旁。

### 最佳实践

- 标题直接询问该操作（“删除这条记录？”），描述说明后果。
- 确认按钮写动作名，破坏性操作使用危险语气。

### 反模式

- 每个操作都确认：用户会条件反射地点击确认，确认失去意义。
- 确认框内未说明要删除的是哪一条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popconfirm>` |
| Vue 组件 | `XhPopconfirmArrow` `XhPopconfirmCancelTrigger` `XhPopconfirmConfirmTrigger` `XhPopconfirmContent` `XhPopconfirmDescription` `XhPopconfirmPositioner` `XhPopconfirmRoot` `XhPopconfirmTitle` `XhPopconfirmTrigger` |
| 组合式函数 | `usePopconfirm` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/popconfirm.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `dir` | `Direction` |  | 文字方向，默认 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `onCancel` | `() => void` |  | 点击了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发该回调。 |
| `onConfirm` | `() => void \| PromiseLike<unknown>` |  | 点击了确认按钮。返回 thenable 即挂起确认门：浮层等待它兑现才收起、 确认按钮转圈且再次点击无效，拒绝则留在原地并报告确认错误。同步返回照常立即收起。 |
| `onConfirmError` | `(details: PopconfirmConfirmErrorDetails) => void` |  | 确认回调同步抛出或 thenable 拒绝；details.cause 是未经包装的原始原因。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `confirm` | `` | 点击了确认按钮；随后浮层收起。异步门经 confirmAction 属性： 事件拿不到监听函数的返回值，给元素赋 `confirmAction = () =&gt; thenable` 即挂起确认门 （浮层等兑现才收、确认按钮转圈，拒绝留在原地），confirm 事件照发只作通知 |
| `confirm-error` | `PopconfirmConfirmErrorDetails` | 确认动作同步抛出或 thenable 拒绝；detail 为 `{ cause }`，保留原始原因 |
| `cancel` | `` | 点击了取消按钮；随后浮层收起 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopconfirmRoot` | `default` | `PopconfirmRootSlotProps` |  |

### React 适配器 props

只列各组件自己声明的那些：继承自 `ComponentPropsWithRef` 的 DOM 属性不在其中，根组件上与上面 Props 表同名的也不重复列。Vue 的对应物是上面的插槽表。

| React 组件 | 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `XhPopconfirmPositioner` | `container` | `() => Element \| null` |  | 浮层挂载的容器；未提供时按全局配置，再未提供时挂载到 body。 |
| `XhPopconfirmRoot` | `children` | `SlotChildren<PopconfirmRootSlotProps>` |  |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `pending` | `boolean` | 异步确认进行中：确认按钮转圈、再次点击无效。 |
| `actionError` | `PopconfirmConfirmErrorDetails \| null` | 最近一次有效确认动作的错误；新确认或取消时清空。 |
| `setOpen` | `(next: boolean) => void` |  |
| `confirm` | `() => void` | 发出确认意图并请求收起；异步确认挂起期间再次调用无效。 |
| `cancel` | `() => void` | 发出取消意图并请求收起。 |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getConfirmTriggerProps` | `() => T['button']` |  |
| `getCancelTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/wai-aria-1.2/#dialog)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Enter` / `Space` | focus in confirm-trigger | 发确认意图；同步成功或 thenable 兑现后收起 |
| `Enter` / `Space` | focus in cancel-trigger | 终止组件等待，发取消意图并收起浮层 |
| `Escape` | open and not pending | 收起浮层并把焦点还给 trigger；不发确认也不发取消 |
| `Enter` / `Space` | held in trigger / confirm-trigger / cancel-trigger | 按住期间该按钮投影 data-pressed，与指针 :active 同一副按压面；抬起、失焦或浮层收起撤下 |

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
| `content` | `role` | 'dialog' |
| `confirm-trigger` | `aria-busy` | 'true' \| undefined |
| `confirm-trigger` | `aria-disabled` | 'true' \| undefined |
| `arrow` | `aria-hidden` | 'true' |

## 样式参考

### 皮肤

`@xihan-ui/styles/popconfirm.css` 使用 `[data-scope="popconfirm"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-pressed` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-xh-action-control` | '' |
| `trigger` | `data-xh-action-display` | 'always' |
| `trigger` | `data-xh-action-profile` | 'text' |
| `trigger` | `data-xh-action-size` | 'md' |
| `trigger` | `data-xh-action-variant` | 'outline' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `confirm-trigger` | `data-loading` | ''（条件成立时才出现） |
| `confirm-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `confirm-trigger` | `data-xh-action-control` | '' |
| `confirm-trigger` | `data-xh-action-display` | 'always' |
| `confirm-trigger` | `data-xh-action-profile` | 'text' |
| `confirm-trigger` | `data-xh-action-size` | 'sm' |
| `confirm-trigger` | `data-xh-action-variant` | 'solid' |
| `cancel-trigger` | `data-pressed` | ''（条件成立时才出现） |
| `cancel-trigger` | `data-xh-action-control` | '' |
| `cancel-trigger` | `data-xh-action-display` | 'always' |
| `cancel-trigger` | `data-xh-action-profile` | 'text' |
| `cancel-trigger` | `data-xh-action-size` | 'sm' |
| `cancel-trigger` | `data-xh-action-variant` | 'outline' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；默认来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 默认来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-popconfirm-action-font-weight` | `cancel-trigger`<br>`confirm-trigger` | `font-weight` | `default` | `--xh-text-label-weight` | popconfirm 的 cancel-trigger、confirm-trigger 部件 font-weight 覆盖槽。 |
| `--xh-popconfirm-action-px` | `cancel-trigger`<br>`confirm-trigger` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | popconfirm 的 cancel-trigger、confirm-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-popconfirm-action-radius` | `cancel-trigger`<br>`confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` | popconfirm 的 cancel-trigger、confirm-trigger 部件 border-radius 覆盖槽。 |
| `--xh-popconfirm-action-shadow` | `cancel-trigger`<br>`confirm-trigger` | `box-shadow` | `default` | `none` | popconfirm 的 cancel-trigger、confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | popconfirm 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-popconfirm-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | popconfirm 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-popconfirm-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | popconfirm 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-popconfirm-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | popconfirm 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-popconfirm-cancel-bg` | `cancel-trigger` | `background-color` | `default`<br>`focus-visible` | `transparent` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-bg-active` | `cancel-trigger` | `background-color` | `disabled`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-bg-subtle-hover` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-bg-focus` | `cancel-trigger` | `background-color` | `focus-visible` | `--xh-popconfirm-cancel-bg` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-bg-hover` | `cancel-trigger` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-border` | `cancel-trigger` | `border`<br>`border-color` | `default`<br>`focus-visible` | `--xh-border-control` | popconfirm 的 cancel-trigger 部件 border、border-color 覆盖槽。 |
| `--xh-popconfirm-cancel-border-hover` | `cancel-trigger` | `border-color` | `disabled`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-border-control-hover` | popconfirm 的 cancel-trigger 部件 border-color 覆盖槽。 |
| `--xh-popconfirm-cancel-fg` | `cancel-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-fg-default` | popconfirm 的 cancel-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-cancel-fg-focus` | `cancel-trigger` | `color` | `focus-visible` | `--xh-popconfirm-cancel-fg` | popconfirm 的 cancel-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-confirm-bg` | `confirm-trigger` | `background-color` | `default`<br>`focus-visible`<br>`loading` | `--xh-_action-variant-bg-focus-visible`<br>`--xh-_action-variant-bg-loading`<br>`--xh-_action-variant-bg-rest` | popconfirm 的 confirm-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-confirm-fg` | `confirm-trigger` | `color` | `default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`is(:active, [data-pressed])`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`pressed` | `--xh-_action-variant-fg-focus-visible`<br>`--xh-_action-variant-fg-hover`<br>`--xh-_action-variant-fg-loading`<br>`--xh-_action-variant-fg-pressed`<br>`--xh-_action-variant-fg-rest` | popconfirm 的 confirm-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-confirm-shadow` | `confirm-trigger` | `box-shadow` | `default` | `--xh-popconfirm-action-shadow` | popconfirm 的 confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-description-fg` | `description` | `color` | `default` | `--xh-fg-muted` | popconfirm 的 description 部件 color 覆盖槽。 |
| `--xh-popconfirm-description-font-size` | `description` | `font-size` | `default` | `--xh-text-secondary-size` | popconfirm 的 description 部件 font-size 覆盖槽。 |
| `--xh-popconfirm-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | popconfirm 的 content 部件 color 覆盖槽。 |
| `--xh-popconfirm-gap` | `content` | `gap` | `default` | `--xh-space-2` | popconfirm 的 content 部件 gap 覆盖槽。 |
| `--xh-popconfirm-icon-size` | `cancel-trigger`<br>`confirm-trigger`<br>`content`<br>`trigger` | `--xh-icon-size` | `default` | `--xh-_action-profile-glyph-size`<br>`--xh-glyph-size-md` | popconfirm 的 cancel-trigger、confirm-trigger、content、trigger 部件 --xh-icon-size 覆盖槽。 |
| `--xh-popconfirm-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | popconfirm 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-popconfirm-loading-duration` | `confirm-trigger` | `animation` | `loading` | `--xh-spin-duration` | popconfirm 的 confirm-trigger 部件 animation 覆盖槽。 |
| `--xh-popconfirm-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | popconfirm 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-popconfirm-max-w` | `content` | `max-inline-size` | `default` | `--xh-_popconfirm-max-w` | popconfirm 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-popconfirm-px` | `content` | `padding-inline` | `default` | `--xh-_popconfirm-pad` | popconfirm 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-popconfirm-py` | `content` | `padding-block` | `default` | `--xh-_popconfirm-pad` | popconfirm 的 content 部件 padding-block 覆盖槽。 |
| `--xh-popconfirm-radius` | `content` | `border-radius` | `default` | `--xh-shape-overlay` | popconfirm 的 content 部件 border-radius 覆盖槽。 |
| `--xh-popconfirm-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | popconfirm 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | popconfirm 的 title 部件 color 覆盖槽。 |
| `--xh-popconfirm-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | popconfirm 的 title 部件 font-size 覆盖槽。 |
| `--xh-popconfirm-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | popconfirm 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

共享关键帧 `xh-overlay-pop-in` · `xh-pop-out` · `xh-spin` 由 `family/motion.css` 提供，皮肤 `@import` 它，单独引入仍成立。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
