# Kbd 键盘按键

显示单个键或快捷键组合；需要实际响应按键时，显式开启 `register`。`Mod` 在 Mac 上显示为 ⌘，其他平台显示为 Ctrl。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

单键与组合键使用同一组件

<XhDemo src="kbd/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="kbd"`：**`root`** · `key`

## 示例

### 外观

default 使用中性底，light 保持透明

<XhDemo src="kbd/02-variant" />

### 平台键名

常用按键与跨平台组合由 Headless 统一格式化

<XhDemo src="kbd/03-special" />

### 快捷键注册

可见提示显式开启 register 后响应按键

<XhDemo src="kbd/04-inline" />

## 设计指引

### 何时使用

- 表示单个键或同时按下的组合键。
- 在说明文字或操作旁提示键盘输入。
- 让可见的快捷键提示同时承担注册行为。

### 何时不用

- 代码和命令使用[代码视图](./code-view)。
- 只注册、不需要任何可见提示的全局命令，应放在应用自己的命令系统中。

### 特性

- 单键和组合键都只渲染一个原生 `kbd` 表面。
- 组合键名之间保留 4px 间隙，不显示加号。
- 平台键名由 Headless 统一格式化。
- 默认不监听；`register` 开启后支持全局或局部 `target`、动态 `enabled` 与 `preventDefault`。
- 固定使用 24px 高度；`default` 使用中性底，`light` 保持透明。

### 组合

- 可放在按钮、菜单项和说明文字中。
- `keys` 的顺序就是视觉顺序；RTL 文本中也保持物理键位顺序。

### 最佳实践

- 跨平台快捷键使用 `Mod`。
- 同时按下的键放在同一份 `keys` 中，不要手工拼接加号或多个 Kbd。
- 只有确实需要监听时才开启 `register`，避免展示文字意外接管浏览器快捷键。

### 反模式

- 不要用 Kbd 代替按钮或菜单项。
- 不要把依次输入的按键序列当成同时按下的组合。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-kbd>` |
| Vue 组件 | `XhKbd` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/kbd.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` |  | 已注册的监听是否生效，默认 true。 |
| `keys` | `string[]` | 是 | 单键或组合键，例如 ['Escape']、['Mod', 'K']。 |
| `onHotKey` | `(details: KbdTriggerDetails) => void` |  | 已注册组合被按下时触发。 |
| `platform` | `KbdPlatform` |  | 平台键名；auto 在适配器探测前按非 Mac 输出。 |
| `preventDefault` | `boolean` |  | 命中时是否阻止浏览器默认动作，默认 true。 |
| `register` | `boolean` |  | 是否注册快捷键监听，默认 false。 |
| `target` | `KbdTarget` |  | 监听目标，默认 document；局部监听传入返回 EventTarget 的函数。 |
| `translations` | `Partial<KbdTranslations>` |  | 逐键名称和整组读屏文案。 |
| `variant` | `KbdVariant` |  | 视觉外观，默认 default。 |

### 事件

自定义元素将载荷放在 `detail`；Vue 使用同名 emit。

| 事件 | 载荷 | 说明 |
| --- | --- | --- |
| `hot-key` | `` | 组合被按出；detail 为 `{ keys: string[], event: KeyboardEvent }` |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segments` | `readonly HotkeySegment[]` |  |
| `platform` | `KbdResolvedPlatform` |  |
| `register` | `boolean` |  |
| `enabled` | `boolean` |  |
| `target` | `KbdTarget` |  |
| `resolveTarget` | `(documentTarget: EventTarget \| null) => EventTarget \| null` |  |
| `matches` | `(event: KeyboardEvent) => boolean` |  |
| `handleKeyDown` | `(event: KeyboardEvent) => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getKeyProps` | `(props: KbdKeyProps) => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/TR/uievents/#event-type-keydown)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `keys 指定的组合` | register 开启、enabled 未关，且不在输入法组合期 | 触发 onHotKey；preventDefault 开启（默认）时同时拦下浏览器默认动作 |
| `keys 指定的组合` | 组合里没有 Ctrl / Meta / Alt，且按键落在输入区里 | 不触发也不拦截，输入优先 |

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.hotkey?.(names) |
| `key` | `aria-hidden` | 'true' |

- 整组只通过根元素的 `aria-label` 朗读一次，视觉键名不重复进入无障碍树。
- 普通字符快捷键落在输入区时不会接管输入；带 Ctrl、Meta 或 Alt 的命令组合仍可响应。

## 样式参考

### 皮肤

`@xihan-ui/styles/kbd.css` 使用 `[data-scope="kbd"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-platform` | resolveKbdPlatform(props.platform) |
| `root` | `data-register` | ''（条件成立时才出现） |
| `root` | `data-variant` | props.variant |
| `key` | `data-key` | segmentOf(value)?.key |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | kbd 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-border` | `root` | `border` | `default` | `transparent` | kbd 的 root 部件 border 覆盖槽。 |
| `--xh-kbd-fg` | `root` | `color` | `default` | `--xh-fg-muted` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-fg-disabled` | `root` | `color` | `disabled` | `--xh-fg-disabled` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-font` | `root` | `font-family` | `default` | `inherit` | kbd 的 root 部件 font-family 覆盖槽。 |
| `--xh-kbd-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | kbd 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd 的 root 部件 font-weight 覆盖槽。 |
| `--xh-kbd-gap` | `root` | `gap` | `default` | `--xh-space-1` | kbd 的 root 部件 gap 覆盖槽。 |
| `--xh-kbd-h` | `root` | `block-size` | `default` | `--xh-space-6` | kbd 的 root 部件 block-size 覆盖槽。 |
| `--xh-kbd-min-w` | `root` | `min-inline-size` | `default` | `--xh-space-6` | kbd 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-px` | `root` | `padding-inline` | `default` | `--xh-space-2` | kbd 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | kbd 的 root 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
