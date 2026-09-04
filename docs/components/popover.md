# 气泡卡片 <Badge type="info" text="popover" />

由点击触发、贴着触发器的一小块浮层，里面可以放任意内容与交互。

## 何时使用

- 补充信息或一小组操作，不值得为它开对话框。
- 内容里有可聚焦元素（按钮、输入框）——这是它与[文字提示](./tooltip)的分界线。

## 何时不用

- 只是一句纯文字说明：用[文字提示](./tooltip)。
- 悬停即出、不需要点击：用[悬浮卡片](./hover-card)。
- 内容是一列命令：用[菜单](./menu)。

## 特性

- `placement` 只是首选位，空间不够时定位引擎自动翻面。
- `modal` 可选：需要锁住下层时打开。
- 可以与触发器同宽，也可以落在指针位置。
- `end` 这类对齐是逻辑方向，跟着书写方向走，不是左右。

## 示例

### 基础用法

点击展开，Escape 或点外部关闭；positioner 负责摆位，content 才是浮层本体

<XhDemo src="popover/01-basic" />

### 朝向与间距

placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是浮层与触发器的距离

<XhDemo src="popover/02-placement" />

### 受控

传了 open 就由宿主说了算；这里额外关掉点外部关闭，只有按钮与 Escape 能收起

<XhDemo src="popover/03-controlled" />

### 尺寸

三档换的是浮层的内边距与字号，不写 size 即缺省档；逐个点开触发器看差别

<XhDemo src="popover/04-size" />

### 确认气泡

标题、说明与两颗按钮拼成一次就地确认；两颗按钮按下后都只是把浮层收起

<XhDemo src="popover/05-confirm" />

### 长内容滚动

浮层自己不限高，给里面的容器设上限并开滚动，标题与关闭按钮就不跟着滚

<XhDemo src="popover/06-scroll" />

### 模态浮层

modal 让焦点陷在浮层里：Tab 到末尾回绕，旁边那颗按钮这时接不到焦点

<XhDemo src="popover/07-modal" />

### 事件

open-change 带一份 { open }，报的是这次要落到的状态；非受控时内部开合也照发一次

<XhDemo src="popover/08-event" />

### 书写方向

start / end 是逻辑对齐不是左右：RTL 下 bottom-start 贴的是锚点右缘，块轴上的对齐不受影响

<XhDemo src="popover/09-rtl" />

### 浮层与触发器同宽

量出触发器的实际宽度写进 content 的行内样式，同时解掉最大宽度上限；触发器换了文案宽度也跟着走

<XhDemo src="popover/09-trigger-width" />

### 落在指针位置

触发器缩成一个像素、按点击坐标固定摆放，浮层就钉在刚点到的那一点上；再点一下换个落点

<XhDemo src="popover/10-point-anchor" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-popover>` |
| Vue 组件 | `XhPopoverArrow` `XhPopoverCloseTrigger` `XhPopoverContent` `XhPopoverDescription` `XhPopoverPositioner` `XhPopoverRoot` `XhPopoverTitle` `XhPopoverTrigger` |
| 组合式函数 | `usePopover` |
| 状态机 | `popoverMachine` |
| 皮肤 | `@xihan-ui/styles/popover.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="popover"`：**`trigger`** · `positioner` · **`content`** · `title` · `description` · `close-trigger` · `arrow`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `placement` | `Placement` |  |  |
| `dir` | `Direction` |  | 文字方向，缺省 ltr。只改写浮层在行内轴上 start 与 end 的落点。 |
| `offset` | `number` |  |  |
| `modal` | `boolean` |  | 模态浮层陷住焦点；默认 false（非模态，Tab 可离开）。 |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `translations` | `Partial<PopoverTranslations>` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg，决定面板的内边距档位。 |
| `onOpenChange` | `(details: PopoverOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `PopoverOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhPopoverRoot` | `default` | `PopoverRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `trigger` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`usePopover` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getPositionerProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getTitleProps` | `() => T['element']` |  |
| `getDescriptionProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |
| `getArrowProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger | 切换开合，展开时把焦点移入 content |
| `Escape` | open | 关闭并把焦点还给 trigger |
| `Tab` | open 且 modal | 在 content 内向后循环焦点 |
| `Shift+Tab` | open 且 modal | 在 content 内向前循环焦点 |

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
| `content` | `role` | 'dialog' |
| `close-trigger` | `aria-label` | props.translations.close |
| `arrow` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/popover.css` 按部件选择：`[data-scope="popover"][data-part="trigger"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
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

`--xh-popover-arrow-size` · `--xh-popover-bg` · `--xh-popover-border` · `--xh-popover-close-bg-active` · `--xh-popover-close-bg-hover` · `--xh-popover-close-fg` · `--xh-popover-close-fg-hover` · `--xh-popover-close-radius` · `--xh-popover-close-size` · `--xh-popover-description-fg` · `--xh-popover-fg` · `--xh-popover-gap` · `--xh-popover-icon-size` · `--xh-popover-layer` · `--xh-popover-max-h` · `--xh-popover-max-w` · `--xh-popover-px` · `--xh-popover-py` · `--xh-popover-radius` · `--xh-popover-shadow` · `--xh-popover-title-fg` · `--xh-popover-title-font-size` · `--xh-popover-title-font-weight`

## 动效

关键帧 `xh-overlay-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 触发器用[按钮](./button)；长内容套[滚动区域](./scroll-area)。

## 最佳实践

- 打开后焦点进浮层，Escape 关闭并归还焦点。
- 内容控制在一屏内，需要滚动就说明该换[抽屉](./drawer)了。

## 反模式

- 悬停触发却里面有按钮：指针移过去的路上就关了。
- 气泡里再弹气泡。
