# 对话框 <Badge type="info" text="dialog" />

浮在页面之上的一层，通常需要用户处理完才能回到下面。

## 何时使用

- 需要用户做出决定且不能忽略（确认删除、填一段必要信息）。
- 一段独立的子任务，完成后回到原处。

## 何时不用

- 只是提示一条结果：用[轻提示](./toast)。
- 内容是页面主流程的一部分：直接展开在页面里。
- 内容很长或是一整个表单：用[抽屉](./drawer)或单独一页。

## 特性

- `modal` 决定是否锁住下层：非模态时下面照常可交互。
- 焦点进入时落在 `initialFocus`，关闭后归还触发器。
- `closeOnEscape` 与 `closeOnInteractOutside` 各自可关——填了一半的表单不该点一下外面就没了。
- 内容区可以内部滚动，标题栏可以拖动挪窗口。
- 另有命令式服务，业务代码一次调用即弹出。

## 示例

### 基础用法

不传 open 即为非受控；Esc 或点遮罩关闭，关闭后焦点回到触发按钮

<XhDemo src="dialog/01-basic" />

### 受控

传了 open 就由宿主说了算，组件自己不再改状态；Esc、点遮罩、按叉都只回写 open

<XhDemo src="dialog/02-controlled" />

### 警示对话框

role=alertdialog 交给读屏更强的语气；关掉 Esc 与点遮罩后，只剩里面这两颗按钮能走出去

<XhDemo src="dialog/03-alert" />

### 尺寸

size 落成 content 的 data-size，只改面板的最大宽度；三档各自一个对话框，点开才看得出宽窄

<XhDemo src="dialog/04-size" />

### 内容滚动

标题与底部操作留在原处，只有中间那块长文在自己的框里滚

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

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-dialog>` |
| Vue 组件 | `XhDialogCloseTrigger` `XhDialogContent` `XhDialogDescription` `XhDialogRoot` `XhDialogTitle` `XhDialogTrigger` |
| 组合式函数 | `useDialog` |
| 状态机 | `dialogMachine` |
| 皮肤 | `@xihan-ui/styles/dialog.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="dialog"`：`trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

## Props

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
| `translations` | `Partial<DialogTranslations>` |  |  |
| `onOpenChange` | `(details: DialogOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `DialogOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDialogRoot` | `default` | `DialogRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDialog` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getBackdropProps` | `() => T['element']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 打开对话框并把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open | 在 content 内向后循环焦点 |
| `Shift+Tab` | open | 在 content 内向前循环焦点 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `aria-modal` | 'true' \| 'false' |
| `content` | `role` | props.role |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/dialog.css` 按部件选择：`[data-scope="dialog"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-position` | 'center' |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-dialog-backdrop-bg` · `--xh-dialog-backdrop-layer` · `--xh-dialog-bg` · `--xh-dialog-close-bg-active` · `--xh-dialog-close-bg-hover` · `--xh-dialog-close-radius` · `--xh-dialog-close-size` · `--xh-dialog-description-fg` · `--xh-dialog-fg` · `--xh-dialog-gap` · `--xh-dialog-icon-size` · `--xh-dialog-layer` · `--xh-dialog-max-w` · `--xh-dialog-positioner-padding` · `--xh-dialog-px` · `--xh-dialog-py` · `--xh-dialog-radius` · `--xh-dialog-shadow` · `--xh-dialog-title-fg` · `--xh-dialog-title-font-size` · `--xh-dialog-title-font-weight`

## 动效

关键帧 `xh-dialog-in` · `xh-dialog-out` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 内容区套[滚动区域](./scroll-area)；按钮行用[按钮组](./button-group)；确认类的轻量场景改用[弹出确认](./popconfirm)。

## 最佳实践

- 标题写这次要做什么，别写"提示"。
- 确认按钮的文字写具体动作（"删除"），不写"确定"。
- 破坏性操作用危险语气，并让取消是默认焦点。

## 反模式

- 对话框里再开对话框。
- 点外面就关，而里面有未保存的输入。
