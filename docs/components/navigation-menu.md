# 导航菜单 <Badge type="info" text="navigation-menu" />

站点的主导航：一排入口，展开后是一整块去处面板，面板里是链接不是命令。

## 何时使用

- 门户、营销站、文档站的顶部导航，每个板块下还有若干去处。

## 何时不用

- 条目是命令（执行一次动作）：用[菜单](./menu)。
- 后台的层级导航：用[侧栏导航](./side-nav)。

## 特性

- 面板落在同一个 `li` 里、紧跟入口之后，展开时按 Tab 就走得进去。
- `delayDuration` 防的是指针横穿导航时一路闪出面板；`skipDelayDuration` 是收起后的静默窗口，窗口内再碰任意入口直接展开。
- 没有下级的去处不必套面板：那一项直接铺成一条 `link`，它不进方向键那一组，按 Tab 一样到得了。
- 面板整批塞进 `viewport` 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口。

## 示例

### 基础用法

面板落在同一个 li 里、紧跟 trigger 之后，展开时按 Tab 就走得进去，里面的条目是链接不是命令，点了就跳走

<XhDemo src="navigation-menu/01-basic" />

### 受控

传了 value 就由宿主说了算，null 表示都收起

<XhDemo src="navigation-menu/02-controlled" />

### 展开延时

delay-duration 是悬停多久才展开，防的是指针横穿导航时一路闪出面板；skip-delay-duration 是收起后的静默窗口，窗口内再碰任意入口直接展开

<XhDemo src="navigation-menu/03-delay" />

### 竖排

orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键

<XhDemo src="navigation-menu/04-vertical" />

### 语气

tone 换的是入口的高亮底与指示条、当前链接的文字色，静止态一样：悬停到入口上、或用方向键把焦点移过去才显现

<XhDemo src="navigation-menu/05-tone" />

### 尺寸

size 一档换掉入口的高度、内边距与字号，写在 root 上、面板里的链接一并跟着变

<XhDemo src="navigation-menu/06-size" />

### 直达入口

没有下级的去处不必套面板：那一项直接铺成一条 link，它不进方向键那一组（那一组只认 trigger），按 Tab 一样到得了

<XhDemo src="navigation-menu/07-link-item" />

### 共享面板外壳

面板整批塞进 viewport 后落位归外壳管：几个入口的面板落在同一处，宽窄不同也不再各贴各的入口

<XhDemo src="navigation-menu/08-viewport" />

### 默认展开项

defaultValue 只定首帧展开哪一项，之后照常由交互接管；指针移开、Escape 或点回入口都收得起来

<XhDemo src="navigation-menu/09-default-open" />

### 收窄成一列图标

竖排时面板本就从入口侧边长出来；收窄只是把文字从入口里撤掉、把它挪进面板，指针停上去才露出来

<XhDemo src="navigation-menu/10-collapsed" />

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-navigation-menu>` |
| Vue 组件 | `XhNavigationMenuContent` `XhNavigationMenuIndicator` `XhNavigationMenuItem` `XhNavigationMenuLink` `XhNavigationMenuList` `XhNavigationMenuRoot` `XhNavigationMenuTrigger` `XhNavigationMenuViewport` |
| 组合式函数 | `useNavigationMenu` |
| 状态机 | `navigationMenuMachine` |
| 皮肤 | `@xihan-ui/styles/navigation-menu.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="navigation-menu"`：**`root`** · **`list`** · **`item`** · `trigger` · `content` · **`link`** · `indicator` · `viewport`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `NavigationMenuNode[]` |  | 入口数据，入口文本与禁用的事实源。给了它，trigger 部件只需报 value。 缺省即回到「文本与禁用都写在部件上」的老路。 |
| `value` | `string \| null` |  | 当前展开项，给定即受控；null 表示都收起。 |
| `defaultValue` | `string \| null` |  |  |
| `orientation` | `Orientation` |  | 方向键轴向，默认 horizontal。 |
| `delayDuration` | `number` |  | 悬停/聚焦到 trigger 后等多久才展开，默认 200ms。 |
| `skipDelayDuration` | `number` |  | 收起之后的静默窗口，默认 300ms；窗口内再碰任意 trigger 直接展开。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `translations` | `Partial<NavigationMenuTranslations>` |  |  |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `onValueChange` | `(details: NavigationMenuValueChangeDetails) => void` |  | value 变化回调。 |

## 事件

自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 `detail` 上。可双向绑定的值另有 `update:xxx`，见 Props。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `NavigationMenuValueChangeDetails` | 展开项变化；detail 为 `{ value: string \| null }` |

## 状态

对外可见的状态落在 `data-state` 上，写样式与断言都读它：

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `content` | 'open' \| 'closed' |
| `indicator` | 'open' \| 'closed' |
| `viewport` | 'open' \| 'closed' |

状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。

**状态**：`idle` · `opening` · `skipping`

**事件**：`TRIGGER.POINTER` · `TRIGGER.FOCUS` · `TRIGGER.TOGGLE` · `DISMISS` · `VALUE.SET` · `after.delayDuration` · `after.skipDelayDuration`

**判据**：`hasValue` · `isCurrent` · `shouldKeepOpen`

## connect API

`useNavigationMenu` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string \| null` | 当前展开的那一项；都收起时为 null。 |
| `collection` | `readonly NavigationMenuNodeMeta[]` | collection 推出的入口元信息，按数据顺序排列；没给 collection 即空数组。 |
| `open` | `boolean` | 有没有面板展开着。 |
| `isOpen` | `(value: string) => boolean` |  |
| `setValue` | `(next: string \| null) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getListProps` | `() => T['element']` |  |
| `getItemProps` | `() => T['element']` |  |
| `getTriggerProps` | `(props: NavigationMenuTriggerProps) => T['button']` |  |
| `getContentProps` | `(props: NavigationMenuContentProps) => T['element']` |  |
| `getLinkProps` | `(props: NavigationMenuLinkProps) => T['element']` |  |
| `getIndicatorProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `ArrowRight` / `ArrowDown` | focus in trigger, 按键与 orientation 同轴 | 焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；随后的自动展开走 delayDuration |
| `ArrowLeft` / `ArrowUp` | focus in trigger, 按键与 orientation 同轴 | 焦点移到上一个 trigger |
| `Home` | focus in trigger | 焦点移到首个可停留 trigger |
| `End` | focus in trigger | 焦点移到末个可停留 trigger |
| `Enter` / `Space` | focus in trigger, not disabled | 立即展开对应面板（不走 delayDuration）；面板是自动弹出来的那一次不收起，再按一次才收起 |
| `Escape` | open | 收起面板并把焦点归还对应 trigger；静默窗口内这一次归还不会把面板重新弹出来 |
| `Tab` / `Shift+Tab` | open, focus in trigger | 走进展开的面板：面板就在 trigger 之后，收起的面板带 hidden 因而被整个跳过 |

## 无障碍

下面这些由 `connect` 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations.root |
| `trigger` | `aria-controls` | `content` 部件的 id |
| `trigger` | `aria-disabled` | 'true' \| 'false' |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `content` | `aria-labelledby` | `trigger` 部件的 id |
| `content` | `role` | 'group' |
| `link` | `aria-current` | 'page' \| undefined |
| `indicator` | `aria-hidden` | 'true' |

## 样式

默认皮肤 `@xihan-ui/styles/navigation-menu.css` 按部件选择：`[data-scope="navigation-menu"][data-part="root"]`。它落在 `xihan.components` 与 `xihan.motion` 层；业务样式不写进 `@layer` 即高于全部库层，要按层压过来就写进 `xihan.overrides`。

## 数据属性

由 `connect` 产出并铺到部件上，皮肤与测试都据此选择；`data-disabled` 这类无值属性在条件不成立时整个不出现。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `list` | `data-orientation` | props.orientation |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-orientation` | props.orientation |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `content` | `data-orientation` | props.orientation |
| `content` | `data-state` | 'open' \| 'closed' |
| `link` | `data-current` | ''（条件成立时才出现） |
| `indicator` | `data-orientation` | props.orientation |
| `indicator` | `data-state` | 'open' \| 'closed' |
| `indicator` | `data-value` | context.get('value') |
| `viewport` | `data-orientation` | props.orientation |
| `viewport` | `data-state` | 'open' \| 'closed' |

## CSS 变量

本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。

`--xh-navigation-menu-content-bg` · `--xh-navigation-menu-content-border` · `--xh-navigation-menu-content-gap` · `--xh-navigation-menu-content-min-w` · `--xh-navigation-menu-content-offset` · `--xh-navigation-menu-content-p` · `--xh-navigation-menu-content-radius` · `--xh-navigation-menu-content-shadow` · `--xh-navigation-menu-fg` · `--xh-navigation-menu-font-size` · `--xh-navigation-menu-gap` · `--xh-navigation-menu-indicator-color` · `--xh-navigation-menu-indicator-radius` · `--xh-navigation-menu-indicator-thickness` · `--xh-navigation-menu-link-bg-hover` · `--xh-navigation-menu-link-fg` · `--xh-navigation-menu-link-fg-current` · `--xh-navigation-menu-link-font-size` · `--xh-navigation-menu-link-font-weight-current` · `--xh-navigation-menu-link-px` · `--xh-navigation-menu-link-py` · `--xh-navigation-menu-link-radius` · `--xh-navigation-menu-trigger-bg-hover` · `--xh-navigation-menu-trigger-fg` · `--xh-navigation-menu-trigger-fg-open` · `--xh-navigation-menu-trigger-font-weight` · `--xh-navigation-menu-trigger-gap` · `--xh-navigation-menu-trigger-h` · `--xh-navigation-menu-trigger-px` · `--xh-navigation-menu-trigger-radius`

## 动效

关键帧 `xh-pop-in` · `xh-pop-out` 随皮肤自带，不引用别处文件里的名字；状态切换走 `transition`。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

## RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

## 组合

- 与[布局](./layout)的头部配合；窄屏时整体换成[抽屉](./drawer)里的[侧栏导航](./side-nav)。

## 最佳实践

- 面板里的链接分组并加组标题，一整块无结构的链接墙没人看得下去。
- 延时保留默认值：调到 0 会让导航在指针路过时不停闪。

## 反模式

- 面板里混进需要提交的表单或命令按钮。
- 悬停即刻展开且没有静默窗口：指针横穿时面板一路弹出。
