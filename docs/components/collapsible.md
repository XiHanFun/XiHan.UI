# 折叠区域 <Badge type="info" text="collapsible" />

一块可以展开收起的内容，只有一块。

## 何时使用

- 高级选项、补充说明这类默认不需要看见的单块内容。

## 何时不用

- 有好几块并列的可折叠内容：用[手风琴](./accordion)，它管互斥与整组语义。
- 内容需要浮在页面之上：用[气泡卡片](./popover)。

## 特性

- 触发器与内容通过 `aria-controls` 与 `aria-expanded` 关联。
- 展开动画由皮肤给，内容高度由组件量出来。
- 指示符部件空着由皮肤画一枚箭头，塞进图形即以作者的为准，转向两种情形都由皮肤打。

## 示例

### 基础用法

不传 open 即为非受控，defaultOpen 只给初始值，之后由组件自己维护开合

<XhDemo src="collapsible/01-basic" />

### 受控

传了 open 就由宿主说了算，组件自己不再改状态，只发 open-change 报告意图

<XhDemo src="collapsible/02-controlled" />

### 禁用

disabled 把触发器整个关停，点击与键盘都不再改开合，已展开的内容维持原样

<XhDemo src="collapsible/03-disabled" />

### 尺寸

size 换的是触发按钮的高度、内边距与字号，三档并排对照

<XhDemo src="collapsible/04-size" />

### 自定义展开标记

往指示符部件里塞自己的图形，转向仍由皮肤按 open 接管

<XhDemo src="collapsible/05-marker" />

### 展开动画

收起时节点不卸载，作者接管内容区的 display，用一条行高过渡就能平滑展开

<XhDemo src="collapsible/06-transition" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-collapsible>` |
| Vue 组件 | `XhCollapsibleContent` `XhCollapsibleIndicator` `XhCollapsibleRoot` `XhCollapsibleTrigger` |
| 组合式函数 | `useCollapsible` |
| 状态机 | `collapsibleMachine` |
| 皮肤 | `@xihan-ui/styles/collapsible.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="collapsible"`：`root` · `trigger` · **`content`** · `indicator`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useCollapsible` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in trigger, not disabled | 展开/收起 content |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/collapsible.css` 按部件选择：`[data-scope="collapsible"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-disabled` | ''（条件成立时才出现） |
| `indicator` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-collapsible-content-fg` · `--xh-collapsible-content-py` · `--xh-collapsible-icon-size` · `--xh-collapsible-trigger-bg` · `--xh-collapsible-trigger-bg-hover` · `--xh-collapsible-trigger-fg` · `--xh-collapsible-trigger-font-size` · `--xh-collapsible-trigger-font-weight` · `--xh-collapsible-trigger-gap` · `--xh-collapsible-trigger-h` · `--xh-collapsible-trigger-px` · `--xh-collapsible-trigger-radius`

## 动效

关键帧 `xh-collapsible-collapse` · `xh-collapsible-expand` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 放进[卡片](./card)、[表单](./form)的高级选项区。

## 最佳实践

- 触发器文字说明里面是什么，别只写"展开"。
- 收起时内容退出 Tab 序列，别让焦点落到看不见的地方。

## 反模式

- 把必填字段藏进折叠区：用户提交失败也不知道错在哪。
