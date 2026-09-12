# Toast <Badge type="info" text="轻提示" />

一条会自己消失的短反馈：一枚状态字形加一句话，横排一行、贴着文字收缩。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toast" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toast.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toast" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toast" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toast.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

一条一句话：title 部件留空时由属性上的文案填入；duration 给 0 即不自动消失

<XhDemo src="toast/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="toast"`：**`root`** · `indicator` · `title` · `action-trigger` · `progress` · `close-trigger` · `group`

## 示例

### 语气

type 落成 data-severity，淡底、描边与字形一起换族，正文留中性；error 走 alert + assertive，loading 表示事情还没完、不自动消失

<XhDemo src="toast/02-type" />

### 计时与暂停

duration 走完自动退场；指针停在条子上或焦点进到条子里都会把计时按住，离开才接着走剩下那一段

<XhDemo src="toast/03-pause" />

### 操作按钮

action-trigger 按下时先发 action 事件，再让这条进入退场；closable 决定还要不要那颗叉

<XhDemo src="toast/04-action" />

### 自定义排版

条子本身就是一行 flex，摆什么、摆在哪一侧都归作者；组件只管盒子、计时与退场

<XhDemo src="toast/05-icon" />

### 全局服务

轻提示没有容器组件，那一摞由 createToastService 渲染；模块作用域随处可调（请求拦截器、store）

<XhDemo src="toast/06-service" />

## 设计指引

### 何时使用

- 一次操作的结果："已保存"、"已复制"、"发送失败"。
- 反馈重要但不需要打断用户。

### 何时不用

- 用户必须知道并处理：用[警告提示](./alert)让它常驻，或用[对话框](./dialog)阻断。
- 内容较长、分标题与正文两层，或不是用户点出来的：用[通知](./notification)。

### 特性

- `duration` 决定停留时长，指针悬停或页面失焦时计时暂停。
- 可以带一个操作按钮（撤销、查看详情）。
- `type` 决定语气：淡底、描边与状态字形一起换族，正文留中性。
- 组件档 `closable` 缺省为真，叉写不写由作者定；全局服务的默认模板反过来——
  到点自己走的不出叉，走不掉的（`loading`、`duration` 给 0）才出。

### 组合

- 没有容器组件：那一摞由全局服务渲染，业务代码 `toast.success('已保存')` 一行调用即可。

### 最佳实践

- 破坏性操作配"撤销"按钮，比事前确认对话框体验好得多。
- 错误类的提示停留久一点，或干脆不自动消失。

### 反模式

- 把错误详情放进轻提示：用户还没读完就没了。
- 同一个动作连发好几条。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toast>` |
| Vue 组件 | `XhToastActionTrigger` `XhToastCloseTrigger` `XhToastIndicator` `XhToastProgress` `XhToastRoot` `XhToastTitle` |
| 组合式函数 | `useToast` |
| 状态机 | `toastMachine` |
| 皮肤 | `@xihan-ui/styles/toast.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` |  | 队列身份。服务档用它做 create/update/dismiss 的寻址键。 |
| `title` | `string` |  | 标题文本；作者没在 title 部件里写内容时由适配器填入。 |
| `description` | `string` |  | 补充说明。轻提示自己不出这一层——两层文本是 notification 的活； 这条 prop 留着是因为 notification 的单条卡片复用同一台机器。 |
| `type` | `ToastType` |  | 语气，默认 info。error 走 alert + assertive，loading 不自动消失。 |
| `duration` | `number` |  | 停留毫秒，默认 5000。&lt;=0 或非有限数即不自动消失。 |
| `removeDelay` | `number` |  | 退场窗口毫秒，默认 200：进入 dismissing 后停留这么久再转 unmounted，留给退场动画。 |
| `closable` | `boolean` |  | 是否显示可用的关闭按钮，默认 true。 |
| `pauseOnPageIdle` | `boolean` |  | 页面切到后台时暂停计时，默认 false。由服务档统一下发。 |
| `paused` | `boolean` |  | 由宿主按住计时，默认 false。整摞一起暂停走这条： 置真时登记 'service' 这个暂停来源，置假时把它摘掉，与指针、焦点那几路并存。 |
| `translations` | `Partial<ToastTranslations>` |  |  |
| `onStatusChange` | `(details: ToastStatusChangeDetails) => void` |  | 生命周期落位时通知：dismissing 与 unmounted 各一次。宿主据此把条目移出队列。 |
| `onAction` | `(details: ToastActionDetails) => void` |  | 操作按钮被按下。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `status-change` | `ToastStatusChangeDetails` | 生命周期落位；detail 为 `{ id: string, status: 'dismissing'\|'unmounted' }` |
| `action` | `ToastActionDetails` | 操作按钮被按下；detail 为 `{ id: string }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhToastRoot` | `default` | `ToastRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | toStatus(state.get()) |
| `progress` | toStatus(state.get()) |

以下名称仅用于内部状态机。

**状态**：`visible` · `visible.running` · `visible.paused` · `dismissing` · `unmounted`

**事件**：`TOAST.DISMISS` · `TOAST.ACTION` · `TOAST.PAUSE` · `TOAST.RESUME` · `TOAST.RESET` · `after.duration` · `after.removeDelay`

**判据**：`isLastPauseSource`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` |  |
| `status` | `ToastStatus` |  |
| `type` | `ToastType` |  |
| `title` | `string \| undefined` |  |
| `paused` | `boolean` | 计时被按住中。倒计时的可见反馈由使用者自己渲染，这个标记是留给他的钩子——自带皮肤不画。 |
| `closable` | `boolean` |  |
| `remaining` | `number` | 剩余毫秒；不自动消失时为 Infinity。 |
| `dismiss` | `() => void` |  |
| `pause` | `() => void` |  |
| `resume` | `() => void` |  |
| `duration` | `number` | 停留总时长（毫秒）；不自动消失时为 Infinity。 |
| `getRootProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` | 严重度指示符：作者塞自己的图形，不塞则由皮肤画兜底字形。 |
| `getTitleProps` | `() => T['element']` |  |
| `getActionTriggerProps` | `() => T['button']` |  |
| `getProgressProps` | `() => T['element']` | 倒计时条：不自动消失时收起。 |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上且 closable | 立即进入 dismissing，走完 removeDelay 后转 unmounted |
| `Enter` / `Space` | focus 在 action-trigger 上 | 触发 onAction 并进入 dismissing |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-atomic` | 'true' |
| `root` | `aria-labelledby` | `title` 部件的 id |
| `root` | `aria-live` | 'assertive' \| 'polite' |
| `root` | `role` | 'alert' \| 'status' |
| `indicator` | `aria-hidden` | 'true' |
| `progress` | `aria-hidden` | 'true' |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式参考

### 皮肤

`@xihan-ui/styles/toast.css` 使用 `[data-scope="toast"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-paused` | ''（条件成立时才出现） |
| `root` | `data-severity` | props.type |
| `root` | `data-state` | toStatus(state.get()) |
| `root` | `data-tone` | toneOf(type) |
| `indicator` | `data-severity` | props.type |
| `progress` | `data-state` | toStatus(state.get()) |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toast-action-bg` | `action-trigger` | `background` | `default` | `--xh-bg-subtle` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-bg-active` | `action-trigger` | `background` | `active`<br>`not(:disabled)` | `--xh-bg-subtle-active` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-bg-hover` | `action-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | toast 的 action-trigger 部件 background 覆盖槽。 |
| `--xh-toast-action-border` | `action-trigger` | `border` | `default` | `--xh-border-default` | toast 的 action-trigger 部件 border 覆盖槽。 |
| `--xh-toast-action-fg` | `action-trigger` | `color` | `default` | `--xh-fg-default` | toast 的 action-trigger 部件 color 覆盖槽。 |
| `--xh-toast-action-font-weight` | `action-trigger` | `font-weight` | `default` | `--xh-font-weight-medium` | toast 的 action-trigger 部件 font-weight 覆盖槽。 |
| `--xh-toast-action-h` | `action-trigger` | `block-size` | `default` | `--xh-control-h-sm` | toast 的 action-trigger 部件 block-size 覆盖槽。 |
| `--xh-toast-action-px` | `action-trigger` | `padding-inline` | `default` | `--xh-control-px-sm` | toast 的 action-trigger 部件 padding-inline 覆盖槽。 |
| `--xh-toast-action-radius` | `action-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 action-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-bg` | `root` | `background` | `default` | `--xh-_toast-tint` | toast 的 root 部件 background 覆盖槽。 |
| `--xh-toast-border` | `root` | `border` | `default` | `--xh-_toast-edge` | toast 的 root 部件 border 覆盖槽。 |
| `--xh-toast-close-bg-active` | `close-trigger` | `background` | `active` | `--xh-bg-subtle-active` | toast 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-toast-close-bg-hover` | `close-trigger` | `background` | `hover`<br>`not(:disabled)` | `--xh-bg-subtle-hover` | toast 的 close-trigger 部件 background 覆盖槽。 |
| `--xh-toast-close-fg` | `close-trigger` | `color` | `default` | `--xh-fg-muted` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-fg-hover` | `close-trigger` | `color` | `hover`<br>`not(:disabled)` | `--xh-fg-default` | toast 的 close-trigger 部件 color 覆盖槽。 |
| `--xh-toast-close-radius` | `close-trigger` | `border-radius` | `default` | `--xh-shape-control` | toast 的 close-trigger 部件 border-radius 覆盖槽。 |
| `--xh-toast-close-size` | `close-trigger` | `block-size`<br>`inline-size` | `default` | `--xh-control-action-size` | toast 的 close-trigger 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toast-fg` | `root` | `color` | `default` | `--xh-fg-default` | toast 的 root 部件 color 覆盖槽。 |
| `--xh-toast-font-size` | `root` | `font-size` | `default` | `--xh-text-body-size` | toast 的 root 部件 font-size 覆盖槽。 |
| `--xh-toast-gap` | `root` | `gap` | `default` | `--xh-control-gap-md` | toast 的 root 部件 gap 覆盖槽。 |
| `--xh-toast-icon-fg` | `indicator`<br>`root` | `background-color`<br>`color` | `default` | `--xh-_tone-fg` | toast 的 indicator、root 部件 background-color、color 覆盖槽。 |
| `--xh-toast-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-control-indicator-size` | toast 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-toast-inset` | `group` | `padding-block-end`<br>`padding-block-start`<br>`padding-inline` | `default` | `--xh-space-6` | toast 的 group 部件 padding-block-end、padding-block-start、padding-inline 覆盖槽。 |
| `--xh-toast-layer` | `group` | `z-index` | `default` | `--xh-layer-toast` | toast 的 group 部件 z-index 覆盖槽。 |
| `--xh-toast-leading` | `root` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 root 部件 line-height 覆盖槽。 |
| `--xh-toast-progress-bg` | `progress` | `background` | `default` | `--xh-_tone-soft` | toast 的 progress 部件 background 覆盖槽。 |
| `--xh-toast-progress-duration` | `progress` | `animation` | `default` | `--xh-motion-duration-slide` | toast 的 progress 部件 animation 覆盖槽。 |
| `--xh-toast-progress-thickness` | `progress` | `block-size` | `default` | `--xh-space-0_5` | toast 的 progress 部件 block-size 覆盖槽。 |
| `--xh-toast-px` | `root` | `padding-inline` | `default` | `--xh-surface-px-sm` | toast 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toast-py` | `root` | `padding-block` | `default` | `--xh-field-py` | toast 的 root 部件 padding-block 覆盖槽。 |
| `--xh-toast-radius` | `root` | `border-radius` | `default` | `--xh-shape-surface` | toast 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toast-shadow` | `root` | `box-shadow` | `default` | `--xh-elevation-sheet` | toast 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-toast-title-fg` | `title` | `color` | `default` | `--xh-fg-default` | toast 的 title 部件 color 覆盖槽。 |
| `--xh-toast-title-font-size` | `title` | `font-size` | `default` | `--xh-text-body-size` | toast 的 title 部件 font-size 覆盖槽。 |
| `--xh-toast-title-font-weight` | `title` | `font-weight` | `default` | `--xh-text-body-weight` | toast 的 title 部件 font-weight 覆盖槽。 |
| `--xh-toast-title-leading` | `title` | `line-height` | `default` | `--xh-text-body-leading` | toast 的 title 部件 line-height 覆盖槽。 |
| `--xh-toast-w` | `root` | `inline-size` | `default` | `auto` | toast 的 root 部件 inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-countdown` · `xh-toast-in` · `xh-toast-out` · `xh-toast-spin` 随皮肤自带，不引用别处文件里的名字；`background` · `color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
