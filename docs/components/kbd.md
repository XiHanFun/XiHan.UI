# Kbd 键帽 <Badge type="tip" text="new" />

显示一个键名，不注册键盘监听。`Mod` 在 Mac 上显示为 ⌘，其他平台显示为 Ctrl。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示单个键名

<XhDemo src="kbd/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="kbd"`：**`root`**

## 示例

### 外观

default 使用中性底，light 保持透明

<XhDemo src="kbd/02-variant" />

### 特殊键

常用修饰键、方向键与操作键由 Headless 统一格式化

<XhDemo src="kbd/03-special" />

### 行内提示

键帽可以嵌入说明文字，但不承担按钮或快捷键监听职责

<XhDemo src="kbd/04-inline" />

## 设计指引

### 何时使用

- 表示单个键。
- 在说明文字或操作旁提示键盘输入。

### 何时不用

- 快捷键组合使用[键帽组](./kbd-group)。
- 快捷键监听使用[快捷键](./hotkeys)。
- 代码和命令使用[代码视图](./code-view)。

### 特性

- 渲染原生 `kbd` 元素。
- 平台键名由 Headless 统一格式化。
- 固定使用 24px 高度；`default` 使用中性底，`light` 保持透明。

### 组合

- 可放在按钮、菜单项和说明文字中。
- 多个键使用 KbdGroup。

### 最佳实践

- 跨平台快捷键使用 `Mod`。
- 组合键使用 KbdGroup，不要手工拼接加号。

### 反模式

- 不要用 Kbd 代替按钮或菜单项。
- 不要在 Kbd 上注册快捷键。

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
| `platform` | `HotkeysPlatform` |  | 平台写法；auto 在适配器测出平台前按 other。 |
| `translations` | `Partial<KbdTranslations>` |  | 读屏键名覆盖。 |
| `value` | `string` | 是 | 一枚键的声明，例如 Mod、Shift、Esc 或 S。 |
| `variant` | `KbdVariant` |  | 外观：default 使用中性底，light 保持透明。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segment` | `HotkeySegment` | 归一化后的键。 |
| `label` | `string` | 键帽可见文本。 |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `getRootProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.keyName?.(segment.key) |

- 符号键通过 `aria-label` 提供可读名称。
- 在 KbdGroup 内由整组统一朗读。

## 样式参考

### 皮肤

`@xihan-ui/styles/kbd.css` 使用 `[data-scope="kbd"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | kbd 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-border` | `root` | `border` | `default` | `transparent` | kbd 的 root 部件 border 覆盖槽。 |
| `--xh-kbd-fg` | `root` | `color` | `default` | `--xh-fg-muted` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-font` | `root` | `font-family` | `default` | `inherit` | kbd 的 root 部件 font-family 覆盖槽。 |
| `--xh-kbd-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | kbd 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd 的 root 部件 font-weight 覆盖槽。 |
| `--xh-kbd-h` | `root` | `block-size` | `default` | `--xh-space-6` | kbd 的 root 部件 block-size 覆盖槽。 |
| `--xh-kbd-min-w` | `root` | `min-inline-size` | `default` | `--xh-space-6` | kbd 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-px` | `root` | `padding-inline` | `default` | `--xh-space-2` | kbd 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | kbd 的 root 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
