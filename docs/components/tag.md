# 标签 <Badge type="info" text="tag" />

告诉你这是什么：一个分类、一项技能、一个筛选条件。它承载实体身份，可以被摘掉。
标签说的是「它是什么」，不是「有事情发生了」——后者是[徽标](./badge)的活。

## 何时使用

- 一条记录挂着的若干分类、技能、关键词。
- 已生效的筛选条件，用户可以逐条摘掉。
- 需要用户看清"这是什么"并能把它移除的任何短文本。

## 何时不用

- 提醒用户注意某个东西——未读数、小红点、在线状态：用[徽标](./badge)，它附着在别的元素上、不接交互。
- 用户要在几个互斥选项里挑一个：用[单选组](./radio-group)或[切换按钮组](./toggle-group)。
- 用户要自己输入并累积多个值：用[标签输入](./tags-input)，它自带输入框与增删逻辑。
- 是一整条页面级提示：用[警告提示](./alert)。

## 特性

- 形态 · 语气 · 尺寸三轴与其余组件同源。
- `closable` 给出关闭钮，显隐可受控（`open` / `defaultOpen` / `open-change`）。
- `disabled` 让标签留在原地但摘不掉，宽度不会因禁用而跳变。

## 示例

### 基础用法

一个标签就是 root 加一段 label 文字；不写 closable 就没有关闭钮

<XhDemo src="tag/01-basic" />

### 形态

variant 决定颜色怎么用：实心填底、淡色填底、只描边

<XhDemo src="tag/02-variant" />

### 语气

tone 决定用哪族颜色；语气只换色相，形态与尺寸不受影响

<XhDemo src="tag/03-tone" />

### 可关闭

closable 给出关闭钮；open 受控时去留由宿主决定，可访问名逐枚带上标签文字，摘掉一枚后焦点交给下一枚

<XhDemo src="tag/04-closable" />

### 禁用

disabled 让标签留在原地却摘不掉：关闭钮仍占着位置，标签宽度不因禁用跳变

<XhDemo src="tag/05-disabled" />

### 尺寸

size 只改内边距、间距与字号，不写就是缺省档；关闭钮的命中区不跟着缩

<XhDemo src="tag/06-size" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-tag>` |
| Vue 组件 | `XhTagCloseTrigger` `XhTagLabel` `XhTagRoot` |
| 组合式函数 | `useTag` |
| 状态机 | `tagMachine` |
| 皮肤 | `@xihan-ui/styles/tag.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="tag"`：**`root`** · `label` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `variant` | `TagVariant` |  | 形态：solid / subtle / outline，决定颜色怎么用。 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `closable` | `boolean` |  | 是否给出关闭钮，默认 false。false 时该钮同时被禁用与收起。 |
| `disabled` | `boolean` |  | 标签禁用：关闭钮不可用，点击不改显隐。 |
| `open` | `boolean` |  | 受控显隐；缺省该 prop 即非受控。 |
| `defaultOpen` | `boolean` |  | 非受控初始显隐，默认显示。 |
| `onOpenChange` | `(details: TagOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |
| `translations` | `Partial<TagTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `TagOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSED`

**判据**：`isOpenControlled`

## connect API

`useTag` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `closable` | `boolean` |  |
| `disabled` | `boolean` |  |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getLabelProps` | `() => T['element']` |  |
| `getCloseTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus 在 close-trigger 上，且 closable 且未禁用 | 收起标签并通知 open=false；关闭钮是原生 button，这两个键由平台翻成 click |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/tag.css` 按部件选择：`[data-scope="tag"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `close-trigger` | `data-disabled` | ''（条件成立时才出现） |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-tag-bg` · `--xh-tag-bg-disabled` · `--xh-tag-border` · `--xh-tag-border-disabled` · `--xh-tag-close-bg-active` · `--xh-tag-close-bg-hover` · `--xh-tag-close-fg` · `--xh-tag-close-radius` · `--xh-tag-close-size` · `--xh-tag-fg` · `--xh-tag-font-size` · `--xh-tag-font-weight` · `--xh-tag-gap` · `--xh-tag-icon-size` · `--xh-tag-px` · `--xh-tag-py` · `--xh-tag-radius`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 一排标签用[弹性布局](./flex)排开。
- 标签里的图元用[图标](./icon)。
- 文字过长时配[文本省略](./ellipsis)，或直接让皮肤截断。

## 最佳实践

- 关闭钮的可访问名要带上标签文字：默认只念 Remove，一屏十个标签听起来一模一样。逐实例传 `translations.close` 写成"移除 前端"。
- 摘掉一枚之后要把焦点交出去：标签是成排出现的，被摘的那一枚带着焦点一起消失，焦点会掉回页面开头，键盘与读屏用户每摘一次就丢一次位置。交给顶上来的那一枚的关闭钮，一枚不剩就交给列表容器或"还原"钮。组件不替宿主决定去留，这件事也就只能宿主自己接。
- 摘掉一个标签之后要有回退路径，否则用户误点就再也加不回来。
- 标签文字尽量短：它是身份标记，不是句子。

## 反模式

- 把标签当按钮用：整块可点却没有按钮语义，键盘用户根本按不到。
- 一屏铺满高饱和度的实心标签：全都在喊，等于都没喊。
- 用颜色单独表达含义：色觉障碍的用户分不出来，文字本身要说清楚。
