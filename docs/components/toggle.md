# Toggle <Badge type="info" text="切换按钮" />

在按下和未按下状态之间切换的按钮。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/toggle" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/toggle.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/toggle" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/toggle" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/toggle.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

切换按钮状态

<XhDemo src="toggle/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="toggle"`：**`root`**

## 示例

### 禁用

保留禁用前的状态

<XhDemo src="toggle/02-disabled" />

### 形态

设置切换按钮外观

<XhDemo src="toggle/04-variant" />

### 语气

设置按下状态的颜色

<XhDemo src="toggle/05-tone" />

### 尺寸

提供三种尺寸

<XhDemo src="toggle/06-size" />

### 图标

支持图标标签和仅图标按钮

<XhDemo src="toggle/07-icon" />

### 受控状态

由外部状态控制按下值

<XhDemo src="toggle/08-events" />

## 设计指引

### 何时使用

- 切换立即生效的格式、视图或工具状态。
- 操作需要保留当前状态时。

### 何时不用

- 需要提交表单值时，使用[开关](./switch)或[复选框](./checkbox)。
- 需要互斥选择时，使用[切换按钮组](./toggle-group)。
- 只执行一次操作时，使用[按钮](./button)。

### 特性

- 使用 `aria-pressed` 表达当前状态。
- 支持受控和非受控状态。
- 支持形态、语气、尺寸、仅图标和全宽外观。
- 禁用后保留当前按下状态。

### 最佳实践

- 标签应说明切换后影响的功能。
- 仅图标按钮必须提供 `aria-label`。
- 按下状态不能只依赖颜色区分。

### 反模式

- 不要用切换按钮表示当前标签页。
- 不要将切换按钮作为表单开关使用。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-toggle>` |
| Vue 组件 | `XhToggle` |
| 组合式函数 | `useToggle` |
| 状态机 | `toggleMachine` |
| 皮肤 | `@xihan-ui/styles/toggle.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pressed` | `boolean` |  |  |
| `defaultPressed` | `boolean` |  |  |
| `disabled` | `boolean` |  |  |
| `variant` | `ActionVariant` |  | 形态：solid / subtle / outline / ghost，决定颜色怎么用 |
| `tone` | `Tone` |  | 语气：brand / neutral / success / warning / danger / info，决定用哪族颜色 |
| `size` | `Size` |  | 尺寸：sm / md / lg |
| `iconOnly` | `boolean` |  | 只有图标：左右内距清零、宽高相等。宽度跟着当前尺寸档的高度走， 不必把档位写进行内样式。图标按钮没有可见文字，作者须自行给可及名。 |
| `fullWidth` | `boolean` |  | 撑满行宽：工具条里一列开关常用。 |
| `onPressedChange` | `(details: TogglePressedChangeDetails) => void` |  | pressed 变化意图回调；受控时是唯一出口，非受控随内部转移一并通知。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `pressed-change` | `TogglePressedChangeDetails` | pressed 状态变化；detail 为 `{ pressed: boolean }` |

### 状态

公开状态写入 `data-state`。

| 部件 | 取值 |
| --- | --- |
| `root` | 'on' \| 'off' |

以下名称仅用于内部状态机。

**状态**：`off` · `on`

**事件**：`TOGGLE` · `CONTROLLED.ON` · `CONTROLLED.OFF`

**判据**：`isPressedControlled`

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `pressed` | `boolean` |  |
| `setPressed` | `(next: boolean) => void` |  |
| `getRootProps` | `() => T['button']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Space` / `Enter` | focus in root, not disabled | 切换 pressed 状态 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-pressed` | 'true' \| 'false' |

## 样式参考

### 皮肤

`@xihan-ui/styles/toggle.css` 使用 `[data-scope="toggle"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-full-width` | ''（条件成立时才出现） |
| `root` | `data-icon-only` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `root` | `data-state` | 'on' \| 'off' |
| `root` | `data-tone` | props.tone |
| `root` | `data-variant` | props.variant |
| `root` | `data-xh-action-control` | '' |
| `root` | `data-xh-action-display` | 'always' |
| `root` | `data-xh-action-profile` | 'icon' \| 'text' |
| `root` | `data-xh-action-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-toggle-bg` | `root` | `background-color` | `default`<br>`disabled`<br>`focus-visible` | `--xh-bg-subtle` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-bg-active` | `root` | `background-color` | `active`<br>`disabled`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-active` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-bg-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-bg-subtle-hover` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-bg-on` | `root` | `background-color` | `disabled`<br>`focus-visible`<br>`state=on` | `--xh-_tone-subtle` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-bg-on-active` | `root` | `background-color` | `active`<br>`disabled`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-_tone-subtle-active` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-bg-on-hover` | `root` | `background-color` | `disabled`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-_tone-subtle-hover` | toggle 的 root 部件 background-color 覆盖槽。 |
| `--xh-toggle-border` | `root` | `border`<br>`border-color` | `active`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `transparent` | toggle 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-toggle-border-on` | `root` | `border`<br>`border-color` | `active`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `transparent` | toggle 的 root 部件 border、border-color 覆盖槽。 |
| `--xh-toggle-fg` | `root` | `color` | `active`<br>`default`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])` | `--xh-fg-default` | toggle 的 root 部件 color 覆盖槽。 |
| `--xh-toggle-fg-on` | `root` | `color` | `active`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `--xh-_tone-fg` | toggle 的 root 部件 color 覆盖槽。 |
| `--xh-toggle-font-size` | `root` | `font-size` | `default` | `--xh-_action-profile-font-size` | toggle 的 root 部件 font-size 覆盖槽。 |
| `--xh-toggle-font-weight` | `root` | `font-weight` | `default` | `--xh-text-label-weight` | toggle 的 root 部件 font-weight 覆盖槽。 |
| `--xh-toggle-gap` | `root` | `gap` | `default` | `--xh-_action-profile-gap` | toggle 的 root 部件 gap 覆盖槽。 |
| `--xh-toggle-h` | `root` | `block-size`<br>`inline-size` | `default`<br>`xh-action-profile=icon` | `--xh-_action-profile-visual-size` | toggle 的 root 部件 block-size、inline-size 覆盖槽。 |
| `--xh-toggle-icon-size` | `*`<br>`root` | `--xh-icon-size`<br>`block-size`<br>`inline-size` | `default` | `--xh-_action-profile-glyph-size` | toggle 的 *、root 部件 --xh-icon-size、block-size、inline-size 覆盖槽。 |
| `--xh-toggle-px` | `root` | `padding-inline` | `default` | `--xh-_action-profile-padding-inline` | toggle 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-toggle-radius` | `root` | `border-radius` | `default` | `--xh-shape-pill` | toggle 的 root 部件 border-radius 覆盖槽。 |
| `--xh-toggle-shadow` | `root` | `box-shadow` | `active`<br>`disabled`<br>`focus-visible`<br>`hover`<br>`loading`<br>`not([data-disabled])`<br>`not([data-loading])`<br>`state=on` | `none` | toggle 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
