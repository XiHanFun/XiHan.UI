# 弹出确认 <Badge type="info" text="popconfirm" />

贴着触发器的一句确认：比对话框轻，但仍拦住一次误操作。

## 何时使用

- 影响有限、可撤销的删除或清空，且触发器就在近处。

## 何时不用

- 后果严重不可逆：用[对话框](./dialog)，并让用户读到完整说明。
- 操作可以撤销：干脆直接做，配一条带"撤销"的[轻提示](./toast)——那比事前确认体验好。

## 特性

- 确认按钮支持异步：在途期间进 pending 并拦住关闭，失败保持打开。
- 位置、尺寸、语气三轴。

## 示例

### 基础用法

点触发器就地问一句，确认与取消都收起浮层；展开时焦点先落在取消上

<XhDemo src="popconfirm/01-basic" />

### 放置位

placement 是首选位，位置不够时引擎自己避让，实际落点写在 data-placement 上

<XhDemo src="popconfirm/02-placement" />

### 尺寸

size 换的是面板的内边距与最大宽度，三个档位落在 content 上

<XhDemo src="popconfirm/03-size" />

### 语气

在 content 上写 data-tone，确认按钮跟着换色；语气是共享的一层，不是本组件的 prop

<XhDemo src="popconfirm/04-tone" />

### 异步确认

确认回调返回 Promise 即挂起确认门：浮层等兑现才收起、确认按钮转圈且再点无效，落空（reject）留在原地；不必再手动受控拦收起

<XhDemo src="popconfirm/05-async-confirm" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popconfirm>` |
| Vue 组件 | `XhPopconfirmCancelTrigger` `XhPopconfirmConfirmTrigger` `XhPopconfirmContent` `XhPopconfirmDescription` `XhPopconfirmPositioner` `XhPopconfirmRoot` `XhPopconfirmTitle` `XhPopconfirmTrigger` |
| 组合式函数 | `usePopconfirm` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/popconfirm.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popconfirm"`：**`root`** · **`trigger`** · `positioner` · **`content`** · `title` · `description` · **`confirm-trigger`** · **`cancel-trigger`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `onCancel` | `() => void` |  | 点了取消按钮，随后浮层收起；挂起中的确认结果随之作废。Escape 与层外交互只发 onOpenChange，不发这条。 |
| `onConfirm` | `() => void \| Promise<unknown>` |  | 点了确认按钮。返回 Promise 即挂起确认门：浮层等它兑现才收起、 确认按钮转圈且再点无效，落空（reject）则留在原地不收。同步返回照旧立即收起。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |
| `confirm` | `` | 点了确认按钮；随后浮层收起。异步门走 confirmAction 属性： 事件拿不到监听函数的返回值，给元素赋 `confirmAction = () =&gt; Promise` 即挂起确认门 （浮层等兑现才收、确认按钮转圈，落空留在原地），confirm 事件照发只作通知 |
| `cancel` | `` | 点了取消按钮；随后浮层收起 |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopconfirmRoot` | `default` | `PopconfirmRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

## connect API

`usePopconfirm` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `pending` | `boolean` | 异步确认进行中：确认按钮转圈、再点无效。 |
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

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Enter` / `Space` | focus in confirm-trigger | 发确认意图并收起浮层 |
| `Enter` / `Space` | focus in cancel-trigger | 发取消意图并收起浮层 |
| `Escape` | open | 收起浮层并把焦点还给 trigger；不发确认也不发取消 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-describedby` | `description` 部件的 id |
| `content` | `aria-labelledby` | `title` 部件的 id |
| `content` | `role` | 'alertdialog' |
| `confirm-trigger` | `aria-busy` | 'true' \| undefined |

## 样式

默认皮肤 `@xihan-ui/styles/popconfirm.css` 按部件选择：`[data-scope="popconfirm"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

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

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-popconfirm-action-px` · `--xh-popconfirm-action-radius` · `--xh-popconfirm-bg` · `--xh-popconfirm-border` · `--xh-popconfirm-cancel-bg` · `--xh-popconfirm-cancel-fg` · `--xh-popconfirm-confirm-bg` · `--xh-popconfirm-confirm-fg` · `--xh-popconfirm-confirm-shadow` · `--xh-popconfirm-description-fg` · `--xh-popconfirm-fg` · `--xh-popconfirm-gap` · `--xh-popconfirm-layer` · `--xh-popconfirm-loading-duration` · `--xh-popconfirm-max-w` · `--xh-popconfirm-px` · `--xh-popconfirm-py` · `--xh-popconfirm-radius` · `--xh-popconfirm-shadow` · `--xh-popconfirm-title-fg` · `--xh-popconfirm-title-font-size` · `--xh-popconfirm-title-font-weight`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` · `xh-popconfirm-rotate` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器用[按钮](./button)；放进[表格](./table)的行操作、[菜单](./menu)的条目旁。

## 最佳实践

- 标题直接问那件事（"删除这条记录？"），描述写清后果。
- 确认按钮写动作名，并对破坏性操作用危险语气。

## 反模式

- 每一个操作都要确认：用户会条件反射地点确认，确认就失去意义了。
- 确认框里没说清楚要删的是哪一条。
