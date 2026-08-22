# 抽屉 <Badge type="info" text="drawer" />

从屏幕某一边滑出的面板。

## 何时使用

- 内容比对话框长（一整张表单、一份详情），但仍属于当前上下文。
- 窄屏上的导航或筛选面板。

## 何时不用

- 只是确认一件事：用[对话框](./dialog)或[弹出确认](./popconfirm)。
- 内容需要与页面主体对照着看：并排展开，别遮住。

## 特性

- `side` 决定从哪一边出来；`contained` 让它只占据某个容器而不是整个视口。
- 可以拖边缘改厚度。
- 关闭前可以拦截（有未保存改动时先问一句）。

## 示例

### 基础用法

不传 open 即为非受控；Escape 关闭、Tab 在面板里循环，展开期间页面滚不动

<XhDemo src="drawer/01-basic" />

### 贴边方向

side 只落成 data-side，面板压在哪条边由皮肤按这个值决定；root 与 content 报的是同一条边

<XhDemo src="drawer/02-side" />

### 受控

传了 open 就由宿主说了算；Escape、点面板外、按叉都只回写 open，不自己改状态

<XhDemo src="drawer/03-controlled" />

### 尺寸

size 落成 content 的 data-size，只改面板贴边方向上的厚度；三档各自一个抽屉，点开才看得出厚薄

<XhDemo src="drawer/04-size" />

### 内容滚动

面板本身定高，把中间那段设成可伸缩并开滚动，标题与底部操作就钉在两头

<XhDemo src="drawer/05-scroll" />

### 关闭前拦截

受控时组件不自改状态：Escape、点面板外、按叉都只发一次收起意图，写不写由宿主定

<XhDemo src="drawer/06-guard" />

### 拖边缘改厚度

面板里放一根把手，拖动时把新厚度写进 content 的 --xh-drawer-size；这个槽压过 size 三档，滑入滑出仍按面板自身宽度算

<XhDemo src="drawer/07-resize" />

### 局部抽屉

把抽屉收进某块区域：遮罩与定位层从 fixed 换成 absolute，只罩住那块区域而不是盖满整屏

<XhDemo src="drawer/08-contained" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-drawer>` |
| Vue 组件 | `XhDrawerCloseTrigger` `XhDrawerContent` `XhDrawerDescription` `XhDrawerRoot` `XhDrawerTitle` `XhDrawerTrigger` |
| 组合式函数 | `useDrawer` |
| 状态机 | `drawerMachine` |
| 皮肤 | `@xihan-ui/styles/drawer.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="drawer"`：**`root`** · `trigger` · `backdrop` · `positioner` · **`content`** · `title` · `description` · `close-trigger`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` |  |  |
| `defaultOpen` | `boolean` |  |  |
| `modal` | `boolean` |  |  |
| `contained` | `boolean` |  | 浮层挂在某个局部容器里而不是视口：遮罩与定位层从 fixed 换成 absolute， 于是只罩住那个容器、不再盖满整屏。 挂到哪个容器是适配器的事（Vue 由 root 的 container 决定，WC 本就是 Light DOM、 作者写在哪就在哪），这里只表达「按局部容器画」这一件事。 |
| `side` | `DrawerSide` |  | 从哪条边滑出，默认 'right'。只影响输出的 data-side，不参与状态转移。 |
| `role` | `'dialog' \| 'alertdialog'` |  |  |
| `closeOnEscape` | `boolean` |  |  |
| `closeOnInteractOutside` | `boolean` |  |  |
| `restoreFocus` | `boolean` |  |  |
| `size` | `Size` |  | 尺寸：sm / md / lg。横放时换面板宽度、竖放时换面板高度，随 side 而定。 |
| `translations` | `Partial<DrawerTranslations>` |  |  |
| `onOpenChange` | `(details: DrawerOpenChangeDetails) => void` |  | open 变化意图回调；受控时是唯一出口，非受控时随内部转移一并通知。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `DrawerOpenChangeDetails` | open 状态变化；detail 为 `{ open: boolean }` |

## 插槽

作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhDrawerRoot` | `default` | `DrawerRootSlotProps` |  |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `backdrop` | 'open' \| 'closed' |
| `positioner` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`open` · `closed`

**事件**：`OPEN` · `TOGGLE` · `CLOSE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isOpenControlled`

## connect API

`useDrawer` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` |  |
| `side` | `DrawerSide` | 已解析的滑出边（prop 缺省时是默认值），作者据此配动画。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
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
| `Enter` / `Space` | focus in trigger | 打开抽屉并把焦点移入 content |
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
| `content` | `role` | props.role |
| `close-trigger` | `aria-label` | props.translations.close |

## 样式

默认皮肤 `@xihan-ui/styles/drawer.css` 按部件选择：`[data-scope="drawer"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-contained` | ''（条件成立时才出现） |
| `root` | `data-side` | props.side |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `backdrop` | `data-contained` | ''（条件成立时才出现） |
| `backdrop` | `data-state` | 'open' \| 'closed' |
| `positioner` | `data-contained` | ''（条件成立时才出现） |
| `positioner` | `data-positioned` | '' |
| `positioner` | `data-state` | 'open' \| 'closed' |
| `content` | `data-contained` | ''（条件成立时才出现） |
| `content` | `data-side` | props.side |
| `content` | `data-size` | props.size |
| `content` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-drawer-backdrop-bg` · `--xh-drawer-backdrop-layer` · `--xh-drawer-bg` · `--xh-drawer-close-bg-active` · `--xh-drawer-close-bg-hover` · `--xh-drawer-close-radius` · `--xh-drawer-close-size` · `--xh-drawer-description-fg` · `--xh-drawer-fg` · `--xh-drawer-gap` · `--xh-drawer-icon-size` · `--xh-drawer-layer` · `--xh-drawer-px` · `--xh-drawer-py` · `--xh-drawer-radius` · `--xh-drawer-shadow` · `--xh-drawer-size` · `--xh-drawer-title-fg` · `--xh-drawer-title-font-size` · `--xh-drawer-title-font-weight` · `--xh-drawer-trigger-bg` · `--xh-drawer-trigger-bg-hover` · `--xh-drawer-trigger-bg-open` · `--xh-drawer-trigger-border` · `--xh-drawer-trigger-border-hover` · `--xh-drawer-trigger-border-open` · `--xh-drawer-trigger-fg` · `--xh-drawer-trigger-font-size` · `--xh-drawer-trigger-font-weight` · `--xh-drawer-trigger-gap` · `--xh-drawer-trigger-h` · `--xh-drawer-trigger-px` · `--xh-drawer-trigger-radius`

## 动效

关键帧 `xh-drawer-in-bottom` · `xh-drawer-in-left` · `xh-drawer-in-right` · `xh-drawer-in-top` · `xh-drawer-out-bottom` · `xh-drawer-out-left` · `xh-drawer-out-right` · `xh-drawer-out-top` · `xh-fade-in` · `xh-fade-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像；另有按 `dir` 分支的规则。

## 组合

- 里面放[表单](./form)、[侧栏导航](./side-nav)；内容区套[滚动区域](./scroll-area)。

## 最佳实践

- 提交与取消固定在底部，别让用户滚到最下面才找得到。
- 有未保存改动时拦下关闭。

## 反模式

- 抽屉里再开抽屉。
- 在宽屏上用抽屉装本可以直接展开的内容。
