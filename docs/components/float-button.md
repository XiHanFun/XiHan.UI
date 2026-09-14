# FloatButton 浮动按钮 <Badge type="info" text="alpha" />

用于在视口边缘提供持续可见的操作入口。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/float-button" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/float-button.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/float-button" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/float-button" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/float-button.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

展开一组悬浮操作

<XhDemo src="float-button/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="float-button"`：**`root`** · **`trigger`** · **`list`**

## 示例

### 悬停展开

指针进入时展开，键盘与触控仍可点击

<XhDemo src="float-button/02-hover" />

### 变体

设置浮动按钮的表面

<XhDemo src="float-button/03-variant" />

### 尺寸

使用小、中、大三档尺寸

<XhDemo src="float-button/04-size" />

### 外形

使用圆形或方形触发器

<XhDemo src="float-button/05-shape" />

## 设计指引

### 何时使用

- 长页面中的常用主操作。
- 移动端或窄屏中的紧凑操作组。

### 何时不用

- 返回页面顶部时，使用[回到顶部](./back-top)。
- 页面已有固定[工具栏](./toolbar)时。
- 操作数量较多时，使用[菜单](./menu)或抽屉。

### 特性

- 支持四个视口角与安全区偏移。
- 支持点击或悬停展开；键盘与触控始终使用点击。
- Escape、层外点击和再次触发均可收起。
- 收起后动作项退出 Tab 序列。
- 默认使用通透玻璃表面，显式变体使用对应语义表面。
- 原生按钮动作项自动继承触发器的尺寸与外观。

### 组合

- 动作项可使用原生按钮或[按钮](./button)。
- 纯图标动作可配合[文字提示](./tooltip)。

### 最佳实践

- 为每个图标按钮提供可访问名称。
- 将操作数量控制在 2 至 5 个。
- 使用 `offset` 避开系统手势区。

### 反模式

- 不要承载高风险的破坏性操作。
- 不要遮挡主要内容或固定导航。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-float-button>` |
| Vue 组件 | `XhFloatButtonList` `XhFloatButtonRoot` `XhFloatButtonTrigger` |
| 组合式函数 | `useFloatButton` |
| 状态机 | `floatButtonMachine` |
| 皮肤 | `@xihan-ui/styles/float-button.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultOpen` | `boolean` |  |  |
| `dir` | `Direction` |  | 文字方向，只作用于排版；作者没给就不写。 |
| `disabled` | `boolean` |  |  |
| `expandTrigger` | `FloatButtonExpandTrigger` |  | 展开方式，默认 click。 |
| `offset` | `number` |  | 距那两条边的距离（px），默认 24。 |
| `onOpenChange` | `(details: CollapsibleOpenChangeDetails) => void` |  | open 变化意图；受控时是唯一出口，非受控时随内部转移一并通知。 |
| `open` | `boolean` |  |  |
| `placement` | `FloatButtonPlacement` |  | 钉在哪一角，默认 bottom-end。 |
| `shape` | `FloatButtonShape` |  | 触发器外形，默认 circle。 |
| `size` | `Size` |  | 尺寸：sm / md / lg，缺省与 lg 同档——悬浮钮要够得着，起步就比行内按钮大一号。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `translations` | `Partial<FloatButtonTranslations>` |  |  |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `open-change` | `` | 展开状态变化；detail 为 `{ open: boolean }` |

### 插槽

仅列出带载荷的插槽。

| Vue 组件 | 插槽 | 载荷 | 说明 |
| --- | --- | --- | --- |
| `XhFloatButtonRoot` | `default` | `FloatButtonRootSlotProps` |  |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'open' \| 'closed' |
| `trigger` | 'open' \| 'closed' |
| `list` | 'open' \| 'closed' |

以下名称仅用于内部状态机。

**状态**：`open` · `closed`

**事件**：`OPEN` · `CLOSE` · `TOGGLE` · `DISABLE` · `CONTROLLED.OPEN` · `CONTROLLED.CLOSE`

**判据**：`isDisabled` · `isOpenControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `boolean` | 展开的那一组此刻露不露面。 |
| `setOpen` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getTriggerProps` | `() => T['button']` |  |
| `getListProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Enter` / `Space` | focus in trigger, not disabled | 展开 / 收起 list；悬停展开时这条路照样在，触摸与键盘都靠它 |
| `Escape` | open，无论焦点是否仍在整组内 | 只收起当前 LayerRegistry 的栈顶层；更晚打开的 Drawer / Popover 先处理自己的 Escape |
| `Tab` / `Shift+Tab` | open | 走进展开的那一组；收起时 list 带 hidden，里面的按钮一并退出 Tab 序列 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `trigger` | `aria-controls` | `list` 部件的 id |
| `trigger` | `aria-expanded` | 'true' \| 'false' |
| `trigger` | `aria-label` | props.translations?.trigger |
| `list` | `aria-labelledby` | `trigger` 部件的 id |
| `list` | `role` | 'group' |

## 样式参考

### 皮肤

`@xihan-ui/styles/float-button.css` 使用 `[data-scope="float-button"][data-part="root"]` 部件选择器，位于 `xihan.components` 与 `xihan.motion` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-placement` | props.placement |
| `root` | `data-shape` | props.shape |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'open' \| 'closed' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `trigger` | `data-disabled` | ''（条件成立时才出现） |
| `trigger` | `data-shape` | props.shape |
| `trigger` | `data-state` | 'open' \| 'closed' |
| `list` | `data-placement` | props.placement |
| `list` | `data-state` | 'open' \| 'closed' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-float-button-bg` | `list`<br>`trigger` | `background-color` | `default`<br>`not([data-scope])` | `--xh-_float-button-bg` | float-button 的 list、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-active` | `list`<br>`trigger` | `background-color` | `active`<br>`disabled`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-scope])` | `--xh-_float-button-bg-active` | float-button 的 list、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-bg-hover` | `list`<br>`trigger` | `background-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-scope])` | `--xh-_float-button-bg-hover` | float-button 的 list、trigger 部件 background-color 覆盖槽。 |
| `--xh-float-button-border` | `list`<br>`trigger` | `border` | `default`<br>`not([data-scope])` | `--xh-_float-button-border` | float-button 的 list、trigger 部件 border 覆盖槽。 |
| `--xh-float-button-border-hover` | `list`<br>`trigger` | `border-color` | `@media (hover: hover)`<br>`disabled`<br>`hover`<br>`not(:disabled)`<br>`not([data-disabled])`<br>`not([data-scope])` | `--xh-_float-button-border-hover` | float-button 的 list、trigger 部件 border-color 覆盖槽。 |
| `--xh-float-button-fg` | `list`<br>`root`<br>`trigger` | `--xh-_ring-color`<br>`color` | `default`<br>`disabled`<br>`focus-visible`<br>`not([data-scope])`<br>`variant=solid` | `--xh-_float-button-fg` | float-button 的 list、root、trigger 部件 --xh-_ring-color、color 覆盖槽。 |
| `--xh-float-button-gap` | `list`<br>`root` | `gap` | `default` | `--xh-space-2` | float-button 的 list、root 部件 gap 覆盖槽。 |
| `--xh-float-button-icon-size` | `root` | `--xh-icon-size` | `default` | `--xh-glyph-size-text` | float-button 的 root 部件 --xh-icon-size 覆盖槽。 |
| `--xh-float-button-layer` | `root` | `z-index` | `default` | `--xh-_layer` | float-button 的 root 部件 z-index 覆盖槽。 |
| `--xh-float-button-radius` | `list`<br>`root`<br>`trigger` | `border-radius` | `default`<br>`shape=square` | `--xh-shape-control`<br>`--xh-shape-pill` | float-button 的 list、root、trigger 部件 border-radius 覆盖槽。 |
| `--xh-float-button-shadow` | `list`<br>`trigger` | `box-shadow` | `default`<br>`not([data-scope])` | `--xh-_float-button-shadow` | float-button 的 list、trigger 部件 box-shadow 覆盖槽。 |
| `--xh-float-button-size` | `list`<br>`trigger` | `block-size`<br>`inline-size` | `default` | `--xh-_float-button-size` | float-button 的 list、trigger 部件 block-size、inline-size 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

关键帧 `xh-pop-in` 随皮肤自带，不引用别处文件里的名字；`background` · `background-color` · `border-color` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`hover: hover` · `pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
