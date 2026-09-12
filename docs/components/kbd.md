# Kbd 键帽

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

### 尺寸

小、中、大三档

<XhDemo src="kbd/02-size" />

### 禁用

表示对应动作不可用

<XhDemo src="kbd/03-disabled" />

### 按下

展示动作激活时的键帽状态

<XhDemo src="kbd/04-pressed" />

## 设计指引

### 何时使用

- 表示单个键。
- 展示按下或禁用状态。

### 何时不用

- 快捷键组合使用[键帽组](./kbd-group)。
- 快捷键监听使用[快捷键](./hotkeys)。
- 代码和命令使用[代码视图](./code-view)。

### 特性

- 渲染原生 `kbd` 元素。
- 平台键名由 Headless 统一格式化。
- `pressed` 只表示外部传入的按下状态。
- 提供三档尺寸和 compact 密度。

### 组合

- 可放在按钮、菜单项和说明文字中。
- 多个键使用 KbdGroup。

### 最佳实践

- 跨平台快捷键使用 `Mod`。
- 仅在动作激活时设置 `pressed`。

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
| `disabled` | `boolean` |  | 这枚键所提示的动作是否不可用。 |
| `platform` | `HotkeysPlatform` |  | 平台写法；auto 在适配器测出平台前按 other。 |
| `pressed` | `boolean` |  | 这枚键是否正在被真实动作激活；纯展示默认静止。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<KbdTranslations>` |  | 读屏键名覆盖。 |
| `value` | `string` | 是 | 一枚键的声明，例如 Mod、Shift、Esc 或 S。 |

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
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-modifier` | ''（条件成立时才出现） |
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-bg` | `root` | `background-color` | `default` | `--xh-bg-subtle` | kbd 的 root 部件 background-color 覆盖槽。 |
| `--xh-kbd-bg-disabled` | `root` | `background` | `disabled` | `--xh-bg-muted` | kbd 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-border` | `root` | `border` | `default` | `--xh-border-default` | kbd 的 root 部件 border 覆盖槽。 |
| `--xh-kbd-fg` | `root` | `color` | `default` | `--xh-fg-default` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-fg-disabled` | `root` | `color` | `disabled` | `--xh-fg-disabled` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-fg-modifier` | `root` | `color` | `modifier` | `--xh-fg-muted` | kbd 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-font` | `root` | `font-family` | `default` | `--xh-font-family-mono` | kbd 的 root 部件 font-family 覆盖槽。 |
| `--xh-kbd-font-size` | `root` | `font-size` | `default` | `--xh-_kbd-font-size` | kbd 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd 的 root 部件 font-weight 覆盖槽。 |
| `--xh-kbd-h` | `root` | `block-size` | `default` | `--xh-_kbd-h` | kbd 的 root 部件 block-size 覆盖槽。 |
| `--xh-kbd-min-w` | `root` | `min-inline-size` | `default` | `--xh-_kbd-h` | kbd 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-px` | `root` | `padding-inline` | `default` | `--xh-_kbd-px` | kbd 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-py` | `root` | `padding-block` | `default` | `--xh-space-0` | kbd 的 root 部件 padding-block 覆盖槽。 |
| `--xh-kbd-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | kbd 的 root 部件 border-radius 覆盖槽。 |
| `--xh-kbd-shadow` | `root` | `box-shadow` | `default` | `--xh-_kbd-shadow-rest` | kbd 的 root 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-shadow-pressed` | `root` | `box-shadow` | `active`<br>`disabled`<br>`is(button, a[href], [role='button'], [role='menuitem'], [role='option'])`<br>`not([data-disabled])`<br>`not([disabled], [aria-disabled='true'])`<br>`pressed` | `--xh-_kbd-shadow-pressed` | kbd 的 root 部件 box-shadow 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `box-shadow` · `color` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。
