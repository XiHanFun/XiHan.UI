# ToggleGroup 切换按钮组

将多个切换按钮组合为单选或多选控件。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

同时切换多个文本格式

<XhDemo src="toggle-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="toggle-group"`：**`root`** · **`item`** · `hidden-input`

## 示例

### 受控状态

由外部状态控制选中值

<XhDemo src="toggle-group/02-controlled" />

### 多选

同时选择多个格式

<XhDemo src="toggle-group/03-multiple" />

### 禁用

禁用单个选项

<XhDemo src="toggle-group/04-disabled" />

### 方向

水平或垂直排列

<XhDemo src="toggle-group/05-orientation" />

### 宽度充满

选项等分可用宽度

<XhDemo src="toggle-group/06-full-width" />

### 尺寸

提供三种尺寸

<XhDemo src="toggle-group/07-size" />

### 变体

设置整组外观

<XhDemo src="toggle-group/08-variant" />

### 无分隔线

省略分隔线部件

<XhDemo src="toggle-group/09-without-separator" />

## 设计指引

### 何时使用

- 在少量选项之间切换视图或显示方式。
- 同时启用多个格式或工具状态。

### 何时不用

- 选项较多或需要搜索时，使用[选择器](./select)。
- 选项需要完整表单标签时，使用[单选组](./radio-group)。
- 各项只执行操作时，使用[按钮组](./button-group)。

### 特性

- 支持单选和多选模式。
- 支持受控和非受控状态。
- 支持水平、垂直、全宽和三种尺寸。
- 默认在相邻条目之间显示分隔线，可通过 `separators=false` 关闭。
- 使用 roving tabindex 管理组内键盘导航。
- `disallowEmpty` 可阻止清空最后一个选中项。
- `collection` 可统一提供标签和禁用状态。

### 最佳实践

- 每组使用二到五个简短选项。
- 同组条目应保持相近宽度。
- 必须保留一个选中项时启用 `disallowEmpty`。

### 反模式

- 不要用切换按钮组代替带面板关联的标签页。
- 关闭 roving focus 时，应提供其他组内导航方式。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle-group>` |
| Vue 组件 | `XhToggleGroupHiddenInput` `XhToggleGroupItem` `XhToggleGroupRoot` |
| 组合式函数 | `useToggleGroup` |
| 状态机 | `toggleGroupMachine` |
| 皮肤 | `@xihan-ui/styles/toggle-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `collection` | `ToggleGroupNode[]` |  | 条目数据，显示文本与禁用的事实源。给了它，条目部件只需报 value。 缺省即回到「文本与禁用都写在条目部件上」的老路。 |
| `value` | `ToggleGroupValue` |  | 选中值。给定即受控：内部不再自改，只发 onValueChange。 |
| `defaultValue` | `ToggleGroupValue` |  |  |
| `multiple` | `boolean` |  | 允许多项同时选中；false 时选中一项即挤掉其余。 |
| `disabled` | `boolean` |  | 整组禁用：条目全部 aria-disabled，点击与方向键都不生效。 |
| `disallowEmpty` | `boolean` |  | 不许把值清空：单选模式下点当前选中项不再取消它，多选模式下摘不掉最后一个。 默认 false（可以点成无选中）。 |
| `variant` | `ActionVariant` |  | 变体：solid / subtle / outline / ghost，决定段的底色与描边怎么用。 |
| `tone` | `Tone` |  | 颜色：brand / neutral / success / warning / danger / info。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `fullWidth` | `boolean` |  | 撑满行宽：整组占满可用宽度，每段等分剩余空间。 |
| `separators` | `boolean` |  | 是否自动在相邻条目之间插入分隔线，默认 true。 |
| `name` | `string` |  | 表单字段名。给定后隐藏输入才带 name 并参与提交。 |
| `orientation` | `Orientation` |  | 视觉排布，默认 horizontal。方向键接受的轴与它无关（四个方向键恒响应）。 |
| `dir` | `Direction` |  | 文字方向，默认 ltr；只改写左右方向键的语义，上下键与之无关。 |
| `loop` | `boolean` |  | 方向键走到尽头是否回绕，默认 true。 |
| `rovingFocus` | `boolean` |  | roving tabindex，默认开启：整组只占一个 Tab 位，组内靠方向键走。 关掉后每个条目自成一个 Tab 停靠点，方向键不再接管。 |
| `onValueChange` | `(details: ToggleGroupValueChangeDetails) => void` |  | value 变化意图回调；受控时是唯一出口，非受控随内部写入一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `value-change` | `ToggleGroupValueChangeDetails` | 选中值变化；detail 为 `{ value: string \| string[] \| null }`（形态跟着 multiple 走） |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `item` | 'on' \| 'off' |

以下名称仅用于内部状态机。

**状态**：`idle`

**事件**：`VALUE.SET` · `ITEM.TOGGLE` · `ITEM.FOCUS` · `GROUP.BLUR` · `FORM.RESET`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string[]` | 当前选中集合，恒为数组（单选时长度 ≤ 1）。 |
| `collection` | `readonly ToggleGroupNodeMeta[]` | collection 推出的条目元信息，按数据顺序排列；没给 collection 即空数组。 |
| `focusedValue` | `string \| null` | 焦点在组外时为 null。 |
| `multiple` | `boolean` |  |
| `disabled` | `boolean` |  |
| `orientation` | `Orientation` |  |
| `separators` | `boolean` |  |
| `isSelected` | `(value: string) => boolean` |  |
| `setValue` | `(next: ToggleGroupValue) => void` | 传单值 / 数组 / null 皆可，内部按 multiple 归一。 |
| `getRootProps` | `() => T['element']` |  |
| `getItemProps` | `(props: ToggleGroupItemProps) => T['button']` |  |
| `getHiddenInputProps` | `() => T['input']` | 表单出口：整组只有一份，提交的就是当前选中值。 |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` / `Shift+Tab` | rovingFocus 开启（默认） | 整组只占一个 Tab 位：焦点落到锚点条目，无锚点时先落容器再由它转投 |
| `ArrowRight` / `ArrowDown` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到下一个可停留条目（禁用项跳过、尽头按 loop 回绕），不改选中；dir=rtl 时改由 ArrowLeft 承担 |
| `ArrowLeft` / `ArrowUp` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到上一个可停留条目，不改选中；dir=rtl 时改由 ArrowRight 承担 |
| `Home` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到首个可停留条目 |
| `End` | focus in group, 组未禁用且 rovingFocus 开启 | 焦点移到末个可停留条目 |
| `Enter` / `Space` | focus on item, 条目未禁用 | 切换该条目；条目是原生 button，这两个键由平台翻成 click |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-orientation` | undefined \| props.orientation |
| `root` | `role` | 'group' \| 'radiogroup' |
| `item` | `aria-checked` | undefined \| 'true' \| 'false' |
| `item` | `aria-disabled` | 'true' \| 'false' |
| `item` | `aria-pressed` | 'true' \| 'false' \| undefined |
| `item` | `role` | undefined \| 'radio' |

## 样式参考

### 皮肤

`@xihan-ui/styles/toggle-group.css` 使用 `[data-scope="toggle-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-orientation` | props.orientation |
| `root` | `data-size` | props.size |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `item` | `data-disabled` | ''（条件成立时才出现） |
| `item` | `data-state` | 'on' \| 'off' |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toggle-group-item-bg` | `item` | `background` | `default` | `--xh-_toggle-group-item-bg` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-active` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])` | `--xh-_toggle-group-item-bg-active` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-disabled` | `item` | `background` | `disabled` | `--xh-bg-muted` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-hover` | `item` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])` | `--xh-_toggle-group-item-bg-hover` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on` | `item` | `background` | `state=on` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-active` | `item` | `background` | `active`<br>`disabled`<br>`not([data-disabled])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-active` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-disabled` | `item` | `background` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-bg-on` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-bg-on-hover` | `item` | `background` | `disabled`<br>`hover`<br>`not([data-disabled])`<br>`state=on` | `--xh-_toggle-group-item-bg-on-hover` | toggle-group 的 item 部件 background 覆盖槽。 |
| `--xh-toggle-group-item-border` | `item` | `border` | `default` | `--xh-_toggle-group-item-border` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-disabled` | `item` | `border` | `disabled` | `--xh-border-subtle` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-on` | `item` | `border` | `state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-border-on-disabled` | `item` | `border` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-border-on` | toggle-group 的 item 部件 border 覆盖槽。 |
| `--xh-toggle-group-item-fg` | `item` | `color` | `default` | `--xh-_toggle-group-item-fg` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-disabled` | `item` | `color` | `disabled` | `--xh-fg-disabled` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on` | `item` | `color` | `state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-fg-on-disabled` | `item` | `color` | `disabled`<br>`state=on` | `--xh-_toggle-group-item-fg-on` | toggle-group 的 item 部件 color 覆盖槽。 |
| `--xh-toggle-group-item-font-size` | `item` | `font-size` | `default` | `--xh-_toggle-group-font-size` | toggle-group 的 item 部件 font-size 覆盖槽。 |
| `--xh-toggle-group-item-font-weight` | `item` | `font-weight` | `default` | `--xh-text-label-weight` | toggle-group 的 item 部件 font-weight 覆盖槽。 |
| `--xh-toggle-group-item-gap` | `item` | `gap` | `default` | `--xh-_toggle-group-gap` | toggle-group 的 item 部件 gap 覆盖槽。 |
| `--xh-toggle-group-item-h` | `item` | `block-size` | `default` | `--xh-_toggle-group-h` | toggle-group 的 item 部件 block-size 覆盖槽。 |
| `--xh-toggle-group-item-px` | `item` | `padding-inline` | `default` | `--xh-_toggle-group-px` | toggle-group 的 item 部件 padding-inline 覆盖槽。 |
| `--xh-toggle-group-item-radius` | `item`<br>`root` | `border-end-end-radius`<br>`border-end-start-radius`<br>`border-radius`<br>`border-start-end-radius`<br>`border-start-start-radius` | `first-child`<br>`first-of-type`<br>`last-child`<br>`last-of-type`<br>`orientation=horizontal`<br>`orientation=vertical`<br>`variant=outline` | `--xh-shape-pill` | toggle-group 的 item、root 部件 border-end-end-radius、border-end-start-radius、border-radius、border-start-end-radius、border-start-start-radius 覆盖槽。 |
| `--xh-toggle-group-item-shadow` | `item` | `box-shadow` | `state=on` | `--xh-_toggle-group-highlight` | toggle-group 的 item 部件 box-shadow 覆盖槽。 |
| `--xh-toggle-group-outline-color` | `root` | `border` | `variant=outline` | `--xh-_tone-border-control` | toggle-group 的 root 部件 border 覆盖槽。 |
| `--xh-toggle-group-separator-color` | `root` | `background` | `xh-toggle-group-separator` | `--xh-fg-default` | toggle-group 的 root 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-color-disabled` | `root` | `background` | `disabled`<br>`xh-toggle-group-separator` | `--xh-border-subtle` | toggle-group 的 root 部件 background 覆盖槽。 |
| `--xh-toggle-group-separator-opacity` | `root` | `opacity` | `xh-toggle-group-separator` | `--xh-control-separator-opacity` | toggle-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-toggle-group-separator-opacity-disabled` | `root` | `opacity` | `disabled`<br>`xh-toggle-group-separator` | `--xh-control-separator-disabled-opacity` | toggle-group 的 root 部件 opacity 覆盖槽。 |
| `--xh-toggle-group-separator-radius` | `root` | `border-radius` | `xh-toggle-group-separator` | `--xh-shape-pill` | toggle-group 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toggle-group-separator-size` | `root` | `block-size`<br>`inline-size` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-_group-separator-size` | toggle-group 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toggle-group-separator-thickness` | `root` | `block-size`<br>`inline-size`<br>`margin-block-start`<br>`margin-inline-start` | `orientation=horizontal`<br>`orientation=vertical`<br>`xh-toggle-group-separator` | `--xh-stroke-thin` | toggle-group 的 root 部件 block-size、inline-size、margin-block-start、margin-inline-start 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background` · `border-color` · `box-shadow` · `color` · `opacity` · `scale` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### 响应式

皮肤另按输入能力分档：`pointer: coarse`——同一份皮肤在触屏与带指针的设备上不一样，与视口宽度无关。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
