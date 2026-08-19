# 布局 <Badge type="info" text="layout" />

一整页的骨架：头与脚各横贯一行，侧栏与内容并排占中间那一行。少写一段就少一行或少一列。

## 何时使用

- 搭一个应用外壳：管理后台、控制台、文档站。
- 侧栏需要折叠，且折叠时节点仍在（只改宽度，不卸载）。

## 何时不用

- 只是把几个块并排：用[弹性布局](./flex)或[栅格](./grid)。
- 两块区域之间要由用户拖动分配空间：用[分栏](./splitter)。
- 侧栏本身是一棵可展开的导航树：布局只出壳，树交给[侧栏导航](./side-nav)。

## 特性

- 六个部件都可选，只写用得上的那几段。
- 折叠只改宽度，侧栏节点一直在：里面的滚动位置与焦点不会丢。
- 展开与折叠各一档宽度，两档都接受任意 CSS 长度。
- `headerFixed` 与 `siderFixed` 各自独立；两个一起用时侧栏自动让开头的高度。

## 示例

### 基础用法

头与脚各横贯一行，侧栏与内容并排占中间那一行；少写一段就少一行或少一列

<XhDemo src="layout/01-basic" />

### 折叠侧栏

不传 sider-collapsed 即为非受控，把手按下去只改宽度，侧栏节点一直在

<XhDemo src="layout/02-sider-collapse" />

### 受控

传了 sider-collapsed 就由宿主说了算，组件不再自改，只发 sider-collapsed-change

<XhDemo src="layout/03-controlled" />

### 侧栏位置

sider-placement 决定侧栏挂在行首还是行尾，分隔线也跟着换到挨内容的那一边

<XhDemo src="layout/04-sider-placement" />

### 侧栏宽度

展开与折叠各一档宽度，两档都接受任意 CSS 长度，切换时按皮肤里的过渡走

<XhDemo src="layout/05-sider-width" />

### 吸顶与固定

header-fixed 让头钉在滚动容器上沿，sider-fixed 让侧栏跟着钉住；两个一起用时侧栏自动让开头的高度

<XhDemo src="layout/06-fixed" />

### 分别固定

两个开关各自独立：只写 header-fixed 时侧栏照常随内容滚走，只写 sider-fixed 时侧栏钉在滚动容器上沿、头照常滚走

<XhDemo src="layout/07-fixed-independent" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-layout>` |
| Vue 组件 | `XhLayoutContent` `XhLayoutFooter` `XhLayoutHeader` `XhLayoutRoot` `XhLayoutSider` `XhLayoutSiderTrigger` |
| 组合式函数 | `useLayout` |
| 状态机 | `layoutMachine` |
| 皮肤 | `@xihan-ui/styles/layout.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="layout"`：**`root`** · `header` · `sider` · `content` · `footer` · `sider-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `siderCollapsed` | `boolean` |  | 受控折叠态：给了值就由宿主说了算。 |
| `defaultSiderCollapsed` | `boolean` |  | 非受控初始折叠态。 |
| `siderWidth` | `string` |  | 展开时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderCollapsedWidth` | `string` |  | 折叠时侧栏的宽度，任意 CSS 长度；不写则用皮肤里的档位。 |
| `siderPlacement` | `LayoutSiderPlacement` |  | 侧栏挂在行首还是行尾，缺省 start。 |
| `headerFixed` | `boolean` |  | 头吸顶：滚动时头钉在滚动容器的上沿。只落标记，钉住的实现归皮肤。 |
| `siderFixed` | `boolean` |  | 侧栏吸附：滚动时侧栏钉在滚动容器的上沿，头也吸顶时让开头那一条。只落标记，钉住的实现归皮肤。 |
| `bordered` | `boolean` |  | 在头、侧栏、脚与内容之间画分隔线。 |
| `onSiderCollapsedChange` | `(details: LayoutSiderCollapsedChangeDetails) => void` |  | 折叠态变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `sider-collapsed-change` | `LayoutSiderCollapsedChangeDetails` | 折叠态变化；detail 为 `{ collapsed: boolean }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `sider` | 'collapsed' \| 'expanded' |
| `sider-trigger` | 'collapsed' \| 'expanded' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`expanded` · `collapsed`

**事件**：`SIDER.COLLAPSE` · `SIDER.EXPAND` · `SIDER.TOGGLE` · `CONTROLLED.COLLAPSE` · `CONTROLLED.EXPAND`

**判据**：`isSiderCollapsedControlled`

## connect API

`useLayout` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `siderCollapsed` | `boolean` | 侧栏当前是否折叠。 |
| `setSiderCollapsed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getHeaderProps` | `() => T['element']` |  |
| `getSiderProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getFooterProps` | `() => T['element']` |  |
| `getSiderTriggerProps` | `() => T['button']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in sider-trigger | 折叠/展开 sider |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `sider-trigger` | `aria-controls` | `sider` 部件的 id |
| `sider-trigger` | `aria-expanded` | 'false' \| 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/layout.css` 按部件选择：`[data-scope="layout"][data-part="root"]`。它落在 `xihan.components` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-bordered` | ''（条件成立时才出现） |
| `root` | `data-header-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-collapsed` | ''（条件成立时才出现） |
| `root` | `data-sider-fixed` | ''（条件成立时才出现） |
| `root` | `data-sider-placement` | props.siderPlacement |
| `header` | `data-fixed` | ''（条件成立时才出现） |
| `sider` | `data-fixed` | ''（条件成立时才出现） |
| `sider` | `data-placement` | props.siderPlacement |
| `sider` | `data-state` | 'collapsed' \| 'expanded' |
| `sider-trigger` | `data-state` | 'collapsed' \| 'expanded' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-layout-bg` · `--xh-layout-border` · `--xh-layout-fg` · `--xh-layout-footer-bg` · `--xh-layout-header-bg` · `--xh-layout-header-h` · `--xh-layout-header-layer` · `--xh-layout-scrollport-h` · `--xh-layout-sider-bg` · `--xh-layout-sider-collapsed-width` · `--xh-layout-sider-trigger-bg` · `--xh-layout-sider-trigger-bg-hover` · `--xh-layout-sider-trigger-fg` · `--xh-layout-sider-trigger-radius` · `--xh-layout-sider-width`

## 动效

状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

`prefers-reduced-motion: reduce` 下本组件另有降级规则。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- `sider` 里放[侧栏导航](./side-nav)，`header` 里放[菜单栏](./menubar)或[工具栏](./toolbar)，`content` 里放[页头](./page-header)。

## 最佳实践

- 内容区自己定高、内部滚动，别让整页滚动——吸顶的头与侧栏才立得住。
- 折叠态的宽度要放得下图标加内边距，否则图标会被裁。

## 反模式

- 折叠时把侧栏整个卸载再挂回来：展开的分支、滚动位置、焦点全部重置。
- 头和侧栏都不吸附却给它们设了 `position: fixed`：占位没了，内容会被盖住。
