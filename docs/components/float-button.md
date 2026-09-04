# 浮动按钮 <Badge type="info" text="float-button" />

钉在视口某一角的动作入口：平时是一枚触发器，展开后长出一列动作。

## 何时使用

- 页面主动作在长内容里滚没了，但要求随时可达（新建、回到编辑、联系客服）。
- 移动端或窄视口，工具栏没有位置再挂按钮。

## 何时不用

- 动作与当前滚动位置有关：那是[回到顶部](./back-top)。
- 一屏里已经有固定工具栏：直接放进[工具栏](./toolbar)，别再叠一层浮层。
- 动作超过五六个：收进[菜单](./menu)或抽屉，一列悬浮按钮遮内容。

## 特性

- 四个角可钉，`start` / `end` 跟着书写方向走，那一组恒往页面中间长。
- `hover` 与 `click` 两种展开方式，点击那条恒在——触摸与键盘只有它。
- 收起时组内按钮退出 Tab 序列，不会盲聚焦到看不见的东西上。

## 示例

### 基础用法

点触发器展开一组动作，再点一下收起；收起时那组按钮退出 Tab 序列

<XhDemo src="float-button/01-basic" />

### 四角

placement 决定钉在哪一角，start / end 跟着书写方向走；那一组恒往页面中间长

<XhDemo src="float-button/02-placement" />

### 展开方式

hover 指针进出整个壳就开合，click 点触发器；点这条恒在，触摸与键盘都靠它

<XhDemo src="float-button/03-expand-trigger" />

### 外形与贴边

shape 换圆角档，offset 决定距那两条边多远；translations 换掉读屏念出的名字

<XhDemo src="float-button/04-shape-offset" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-float-button>` |
| Vue 组件 | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| 组合式函数 | `useFloatButton` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/float-button.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="float-button"`：**`root`** · **`trigger`** · **`list`**

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  | 展开方式，默认 click。 |
| `offset` | `number` |  | 距那两条边的距离（px），默认 24。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `FloatButtonPlacement` |  | 钉在哪一角，默认 bottom-end。 |
| `shape` | `FloatButtonShape` |  | 触发器外形，默认 circle。 |
| `translations` | `Partial<FloatButtonTranslations>` |  |  |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `CollapsibleOpenChangeDetails` | 展开状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatButtonRoot` | `default` | `FloatButtonRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |

## connect API

`useFloatButton` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 展开的那一组此刻露不露面。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getListProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, not disabled | 展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它 |
| `Escape` | open，焦点在整组之内 | 收起 list；悬停展开时指针一走就收，键盘上就只剩这一条路 |
| `Tab` / `Shift+Tab` | open | 走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `list` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.translations?.trigger |
| `list` | `aria-labelledby` | `trigger` 部件的 id |
| `list` | `role` | 'group' |

## 样式

默认皮肤 `@xihan-ui/styles/float-button.css` 按部件选择：`[data-scope="float-button"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-placement` | props.placement |
| `root` | `data-shape` | props.shape |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-shape` | props.shape |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `list` | `data-placement` | props.placement |
| `list` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-float-button-bg` · `--xh-float-button-bg-active` · `--xh-float-button-bg-hover` · `--xh-float-button-border` · `--xh-float-button-border-hover` · `--xh-float-button-fg` · `--xh-float-button-gap` · `--xh-float-button-icon-size` · `--xh-float-button-layer` · `--xh-float-button-radius` · `--xh-float-button-shadow` · `--xh-float-button-size`

## 动效

关键帧 `xh-pop-in` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## 响应式

皮肤内置条件规则：`hover: hover`。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 组内放[按钮](./button)或[图标块](./icon-wrapper)；每一项配[文字提示](./tooltip)说明它是什么。

## 最佳实践

- 每一项都给可及名字：悬浮按钮通常只有图标。
- `offset` 要躲开移动端的安全区与系统手势条。

## 反模式

- 用它承载破坏性动作（删除、清空）：贴边的大按钮最容易误触。
- 展开后盖住页面主内容或另一个固定条。
