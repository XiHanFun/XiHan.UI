# 悬浮卡片 <Badge type="info" text="hover-card" />

指针停留一会儿才出现的信息卡：预览一个对象，不打断当前动作。

## 何时使用

- 链接或头像的预览：用户资料、文档摘要、商品简介。
- 信息属于"顺便看看"，不需要专门去点。

## 何时不用

- 内容需要交互（按钮、表单）：用[气泡卡片](./popover)。
- 只是一句文字：用[文字提示](./tooltip)。
- 触摸端是主要场景。

## 特性

- `openDelay` 与 `closeDelay` 一对：进入要停留、离开有宽限，指针斜穿去卡片上不会误收。
- 可受控。

## 示例

### 基础用法

与 Tooltip 的分界在于卡片本体可交互：指针停在卡片上不收起，里面的链接与按钮都点得到

<XhDemo src="hover-card/01-basic" />

### 延时

openDelay 默认 700ms，closeDelay 默认 300ms——那段收起等待正是留给指针从触发器走到卡片上的通行时间

<XhDemo src="hover-card/02-delay" />

### 受控

传了 open 就由宿主说了算；悬停与 Escape 都只发意图，最终写不写由外面这颗按钮同一份状态决定

<XhDemo src="hover-card/03-controlled" />

### 尺寸

三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别

<XhDemo src="hover-card/04-size" />

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离

<XhDemo src="hover-card/05-placement" />

### 禁用

disabled 只关掉卡片本身，触发器照样可点、可聚焦，也照样进不了展开等待

<XhDemo src="hover-card/06-disabled" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-hover-card>` |
| Vue 组件 | `XhHoverCardArrow` `XhHoverCardContent` `XhHoverCardPositioner` `XhHoverCardRoot` `XhHoverCardTrigger` |
| 组合式函数 | `useHoverCard` |
| 状态机 | `hoverCardMachine` |
| 皮肤 | `@xihan-ui/styles/hover-card.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="hover-card"`：`root` · **`trigger`** · `positioner` · **`content`** · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  | 请求的浮层朝向，默认 bottom；空间不足时由定位引擎避让。 |
| `offset` | `number` |  | 浮层与锚点的间距（px）。 |
| `openDelay` | `number` |  | 悬停进入到展开的等待毫秒，默认 700。 |
| `closeDelay` | `number` |  | 指针离开 trigger 或 content 到收起的等待毫秒，默认 300。 |
| `dir` | `Direction` |  | 文字方向，仅在显式给出时写到根节点上。 |
| `disabled` | `boolean` |  | 只关掉卡片本身，不影响 trigger 元素自身的可用性。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定卡片的内边距档位。 |
| `onOpenChange` | `(details: HoverCardOpenChangeDetails) => void` |  | open 变化意图回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `HoverCardOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhHoverCardRoot` | `default` | `HoverCardRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`closed` · `opening` · `visible` · `visible.open` · `visible.closing`

**事件**：`POINTER.ENTER` · `POINTER.LEAVE` · `FOCUS` · `BLUR` · `ESCAPE` · `OPEN` · `CLOSE` · `after.openDelay` · `after.closeDelay` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled` · `isDisabled` · `isFocusHeld`

## connect API

`useHoverCard` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | not disabled | 焦点进入 trigger 立即展开、离开卡片即收起，都不走延时 |
| `Escape` | 浮层可见（含收起等待期） | 立即收起，不等 closeDelay |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-haspopup` | 'dialog' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `aria-modal` | 'false' |
| `content` | `role` | 'dialog' |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/hover-card.css` 按部件选择：`[data-scope="hover-card"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-hidden` | ''（条件成立时才出现） |
| `positioner` | `data-placement` | 定位引擎算出的实际落位 |
| `positioner` | `data-positioned` | ''（条件成立时才出现） |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-placement` | 定位引擎算出的实际落位 |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |
| `arrow` | `data-placement` | 定位引擎算出的实际落位 |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-hover-card-arrow-size` · `--xh-hover-card-bg` · `--xh-hover-card-border` · `--xh-hover-card-fg` · `--xh-hover-card-font-size` · `--xh-hover-card-gap` · `--xh-hover-card-layer` · `--xh-hover-card-max-h` · `--xh-hover-card-max-w` · `--xh-hover-card-px` · `--xh-hover-card-py` · `--xh-hover-card-radius` · `--xh-hover-card-shadow` · `--xh-hover-card-trigger-gap`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器常是[头像](./avatar)或链接；卡片里放[卡片](./card)式的排版。

## 最佳实践

- 打开延时给到几百毫秒，否则鼠标扫过一段文字会弹出一串卡片。
- 卡片里的信息在别处也要有正式入口。

## 反模式

- 卡片里放操作按钮：指针过去的路上可能就关了。
- 延时为 0。
