# Popconfirm 弹出确认

贴着触发器的一句确认：比对话框轻，但仍拦住一次误操作。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/popconfirm" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/popconfirm.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/popconfirm" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/popconfirm" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/popconfirm.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

点触发器就地问一句，确认与取消都收起浮层；展开时焦点先落在取消上

<XhDemo src="popconfirm/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="popconfirm"`：**`root`** · **`trigger`** · `positioner` · **`content`** · `title` · `description` · **`confirm-trigger`** · **`cancel-trigger`** · `arrow`

## 示例

### 放置位

placement 是首选位，位置不够时引擎自己避让，实际落点写在 data-placement 上

<XhDemo src="popconfirm/02-placement" />

### 尺寸

size 换的是面板的内边距与最大宽度，三个档位落在 content 上

<XhDemo src="popconfirm/03-size" />

### 颜色

在 content 上写 data-tone，确认按钮跟着换色；语气是共享的一层，不是本组件的 prop

<XhDemo src="popconfirm/04-tone" />

### 异步确认

确认回调返回 Promise 即挂起确认门：浮层等兑现才收起、确认按钮转圈且再点无效，落空（reject）留在原地；不必再手动受控拦收起

<XhDemo src="popconfirm/05-async-confirm" />

## 设计指引

### 何时使用

- 影响有限、可撤销的删除或清空，且触发器就在近处。

### 何时不用

- 后果严重不可逆：用[对话框](./dialog)，并让用户读到完整说明。
- 操作可以撤销：干脆直接做，配一条带"撤销"的[轻提示](./toast)——那比事前确认体验好。

### 特性

- 确认按钮支持同步返回和任意 thenable：调用业务前即占用事务，兑现后收起；同步抛错、
  `then` 读取失败或拒绝都会保持打开，并通过 `actionError` 与 `confirm-error` 原样暴露 `cause`。
- pending 期间重复确认、触发器切换、`setOpen(false)`、Escape 与层外交互都不会关闭。
  取消仍可立即终止组件的等待并收起；它不会假装取消业务 Promise，迟到的兑现或拒绝会按事务票据丢弃。
- 受控宿主把 `open` 写成 `false` 属于事实状态，会终止当前确认事务；此后重新写成 `true` 是新会话，
  旧 thenable 的结算不会关闭它或写入错误。
- 浮层是非模态 `dialog`：不陷焦点、不锁滚动、不隐藏页面其它内容。
- 位置、尺寸、语气三轴。
- 内容与箭头使用和 Popover 同源的 M2 磨砂表面：边界、顶光、背景模糊与投影保持连续；
  强制颜色模式会撤掉装饰顶光，由系统色接管边界。
- 标题、说明与末行操作按固定节奏排布，长文案可在可用宽度内断行。确认是实心主操作，
  取消是 soft 次操作；两颗按钮都有接触高光、按压回执、明确的不透明聚焦底与粗指针命中区。
- pending 时在确认文案之前显示 spinner，并以 `aria-busy` / `aria-disabled` 报告状态；挂起时按钮不再响应 hover / active 换面，
  减弱动效下以静止点线圆环表达在途。

### 组合

- 触发器用[按钮](./button)；放进[表格](./table)的行操作、[菜单](./menu)的条目旁。

### 最佳实践

- 标题直接问那件事（"删除这条记录？"），描述写清后果。
- 确认按钮写动作名，并对破坏性操作用危险语气。

### 反模式

- 每一个操作都要确认：用户会条件反射地点确认，确认就失去意义了。
- 确认框里没说清楚要删的是哪一条。

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
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `onCancel` | `() => void` |  | 点了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发这条。 |
| `onConfirm` | `() => void \| PromiseLike<unknown>` |  | 点了确认按钮。返回 thenable 即挂起确认门：浮层等它兑现才收起、 确认按钮转圈且再点无效，拒绝则留在原地并报告确认错误。同步返回照旧立即收起。 |
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
| `confirm` | `` | 点了确认按钮；随后浮层收起。异步门走 confirmAction 属性： 事件拿不到监听函数的返回值，给元素赋 `confirmAction = () =&gt; thenable` 即挂起确认门 （浮层等兑现才收、确认按钮转圈，拒绝留在原地），confirm 事件照发只作通知 |
| `confirm-error` | `PopconfirmConfirmErrorDetails` | 确认动作同步抛出或 thenable 拒绝；detail 为 `{ cause }`，保留原始原因 |
| `cancel` | `` | 点了取消按钮；随后浮层收起 |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopconfirmRoot` | `default` | `PopconfirmRootSlotProps` |  |

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
| `pending` | `boolean` | 异步确认进行中：确认按钮转圈、再点无效。 |
| `actionError` | `PopconfirmConfirmErrorDetails \| null` | 最近一次有效确认动作的错误；新确认或取消时清空。 |
| `setOpen` | `(next: boolean) => void` |  |
| `confirm` | `() => void` | 发确认意图并请求收起；异步确认挂起期间再调无效。 |
| `cancel` | `() => void` | 发取消意图并请求收起。 |
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

`@xihan-ui/styles/popconfirm.css` 使用 `[data-scope="popconfirm"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `confirm-trigger` | `data-loading` | ''（条件成立时才出现） |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-popconfirm-action-px` | `cancel-trigger`<br>`confirm-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | popconfirm 的 cancel-trigger、confirm-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-popconfirm-action-radius` | `cancel-trigger`<br>`confirm-trigger` | `border-radius` | `default` | `--xh-shape-control` | popconfirm 的 cancel-trigger、confirm-trigger 部件 border-radius 覆盖槽。 |
| `--xh-popconfirm-action-shadow` | `cancel-trigger`<br>`confirm-trigger` | `box-shadow` | `default`<br>`hover`<br>`loading`<br>`not([data-loading])` | `--xh-_popconfirm-confirm-highlight`<br>`--xh-material-soft-shadow` | popconfirm 的 cancel-trigger、confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-arrow-size` | `arrow` | `--xh-_overlay-arrow-size` | `default` | `--xh-overlay-arrow-size` | popconfirm 的 arrow 部件 --xh-_overlay-arrow-size 覆盖槽。 |
| `--xh-popconfirm-backdrop` | `content` | `-webkit-backdrop-filter`<br>`backdrop-filter` | `default` | `--xh-material-frosted-backdrop` | popconfirm 的 content 部件 -webkit-backdrop-filter、backdrop-filter 覆盖槽。 |
| `--xh-popconfirm-bg` | `arrow`<br>`content` | `background` | `default` | `--xh-material-frosted-bg` | popconfirm 的 arrow、content 部件 background 覆盖槽。 |
| `--xh-popconfirm-border` | `arrow`<br>`content` | `border` | `default` | `--xh-material-frosted-border` | popconfirm 的 arrow、content 部件 border 覆盖槽。 |
| `--xh-popconfirm-cancel-bg` | `cancel-trigger` | `background-color` | `default` | `--xh-material-soft-bg` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-bg-focus` | `cancel-trigger` | `background-color` | `focus-visible` | `--xh-material-soft-focus-surface` | popconfirm 的 cancel-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-cancel-fg` | `cancel-trigger` | `color` | `default` | `--xh-material-soft-fg` | popconfirm 的 cancel-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-cancel-fg-focus` | `cancel-trigger` | `color` | `focus-visible` | `--xh-material-soft-fg` | popconfirm 的 cancel-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-confirm-bg` | `confirm-trigger` | `background-color` | `default`<br>`focus-visible` | `--xh-_tone` | popconfirm 的 confirm-trigger 部件 background-color 覆盖槽。 |
| `--xh-popconfirm-confirm-fg` | `confirm-trigger` | `color` | `default` | `--xh-_tone-on` | popconfirm 的 confirm-trigger 部件 color 覆盖槽。 |
| `--xh-popconfirm-confirm-shadow` | `cancel-trigger`<br>`confirm-trigger` | `box-shadow` | `default`<br>`hover`<br>`loading`<br>`not([data-loading])` | `--xh-popconfirm-action-shadow` | popconfirm 的 cancel-trigger、confirm-trigger 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-description-fg` | `description` | `color` | `default` | `--xh-material-frosted-fg-muted` | popconfirm 的 description 部件 color 覆盖槽。 |
| `--xh-popconfirm-fg` | `content` | `color` | `default` | `--xh-material-frosted-fg` | popconfirm 的 content 部件 color 覆盖槽。 |
| `--xh-popconfirm-gap` | `content` | `gap` | `default` | `--xh-space-2` | popconfirm 的 content 部件 gap 覆盖槽。 |
| `--xh-popconfirm-layer` | `positioner` | `z-index` | `default` | `--xh-_layer` | popconfirm 的 positioner 部件 z-index 覆盖槽。 |
| `--xh-popconfirm-loading-duration` | `confirm-trigger` | `animation` | `loading` | `--xh-spin-duration` | popconfirm 的 confirm-trigger 部件 animation 覆盖槽。 |
| `--xh-popconfirm-max-h` | `content` | `max-block-size` | `default` | `--xh-overlay-max-h` | popconfirm 的 content 部件 max-block-size 覆盖槽。 |
| `--xh-popconfirm-max-w` | `content` | `max-inline-size` | `default` | `--xh-_popconfirm-max-w` | popconfirm 的 content 部件 max-inline-size 覆盖槽。 |
| `--xh-popconfirm-px` | `content` | `padding-inline` | `default` | `--xh-_popconfirm-pad` | popconfirm 的 content 部件 padding-inline 覆盖槽。 |
| `--xh-popconfirm-py` | `content` | `padding-block` | `default` | `--xh-_popconfirm-pad` | popconfirm 的 content 部件 padding-block 覆盖槽。 |
| `--xh-popconfirm-radius` | `content` | `border-radius` | `default` | `--xh-shape-surface` | popconfirm 的 content 部件 border-radius 覆盖槽。 |
| `--xh-popconfirm-shadow` | `content` | `box-shadow` | `default` | `--xh-material-frosted-shadow` | popconfirm 的 content 部件 box-shadow 覆盖槽。 |
| `--xh-popconfirm-title-fg` | `title` | `color` | `default` | `--xh-material-frosted-fg` | popconfirm 的 title 部件 color 覆盖槽。 |
| `--xh-popconfirm-title-font-size` | `title` | `font-size` | `default` | `--xh-text-label-size` | popconfirm 的 title 部件 font-size 覆盖槽。 |
| `--xh-popconfirm-title-font-weight` | `title` | `font-weight` | `default` | `--xh-font-weight-semibold` | popconfirm 的 title 部件 font-weight 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` · `xh-popconfirm-rotate` 随皮肤自带，不引用别处文件里的名字；`background-color` · `border-color` · `box-shadow` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

皮肤之外还有一段：退场由适配器的退场闸门把关，动画播完才真收起。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
