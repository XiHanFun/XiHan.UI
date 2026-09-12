# KbdGroup <Badge type="info" text="键帽组" />

显示一组快捷键，不注册键盘监听。键名和连接符按平台格式化。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

Mac 使用符号，其他平台使用文字

<XhDemo src="kbd-group/01-platform" />

## 组件结构

加粗的是必需部件。

`data-scope="kbd-group"`：**`root`** · `key` · `separator`

## 示例

### 尺寸

小、中、大三档

<XhDemo src="kbd-group/02-size" />

### 禁用

表示对应动作不可用

<XhDemo src="kbd-group/03-disabled" />

### 换行

每组内部保持为一个单元

<XhDemo src="kbd-group/04-wrap" />

## 设计指引

### 何时使用

- 在菜单、命令面板和快捷键说明中显示组合键。
- 同一组按键需要适配 Mac 和其他平台。

### 何时不用

- 注册快捷键使用[快捷键](./hotkeys)。
- 单个键使用[键帽](./kbd)。

### 特性

- Mac 使用符号连排，其他平台使用 `+` 连接。
- 整组保持为一个不可拆分的行内单元。
- `disabled` 和 `pressed` 仅表示展示状态。
- 键帽使用与 Kbd 相同的尺寸和压感。

### 组合

- 可放在 Menu、ContextMenu 和 Command 条目末端。
- 可与 Hotkeys 共用同一份 `keys`。

### 最佳实践

- 跨平台主修饰键使用 `Mod`。
- 仅在对应动作不可用时设置 `disabled`。

### 反模式

- 不要用 Hotkeys 代替 KbdGroup 显示按键。
- 不要手写平台相关的组合键文本。

## API 参考

### 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-kbd-group>` |
| Vue 组件 | `XhKbdGroup` |
| 状态机 | 无，`connect` 直接由 props 算属性 |
| 皮肤 | `@xihan-ui/styles/kbd-group.css` |

### Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` |  | 组合所提示的动作是否不可用。 |
| `keys` | `string[]` | 是 | 组合里的各枚键，例如 ['Mod', 'Shift', 'P']。 |
| `platform` | `HotkeysPlatform` |  | 平台写法；auto 在适配器测出平台前按 other。 |
| `pressed` | `boolean` |  | 整组是否正在被真实动作激活；纯展示默认静止。 |
| `size` | `Size` |  | 尺寸：sm / md / lg。 |
| `translations` | `Partial<KbdGroupTranslations>` |  | 读屏文案覆盖。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segments` | `readonly HotkeySegment[]` | 翻好的各枚键，顺序与 keys 一致。 |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `separator` | `string` | Mac 为空串，其余平台为 +。 |
| `segmentOf` | `(value: string) => HotkeySegment \| null` | 按原始声明取回一枚键。 |
| `getRootProps` | `() => T['element']` |  |
| `getKeyProps` | `(props: KbdGroupKeyProps) => T['element']` |  |
| `getSeparatorProps` | `() => T['element']` |  |

## 无障碍

### 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)

无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。

### ARIA

以下属性由 `connect` 生成。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `aria-label` | props.translations?.hotkey?.(names) |
| `root` | `role` | 'img' |
| `key` | `aria-hidden` | 'true' |
| `separator` | `aria-hidden` | 'true' |

- root 通过 `aria-label` 朗读完整组合。
- 子键帽和连接符从无障碍树隐藏。
- `keys` 不能为空。

## 样式参考

### 皮肤

`@xihan-ui/styles/kbd-group.css` 使用 `[data-scope="kbd-group"][data-part="root"]` 部件选择器，位于 `xihan.components` 层。覆盖样式使用 `xihan.overrides`。

`forced-colors: active` 下另有一套规则：颜色交给系统，边框与状态标记改用系统色关键字。

### 数据属性

由 `connect` 生成；条件不成立时不输出无值属性。

| 部件 | 属性 | 值 |
| --- | --- | --- |
| `root` | `data-disabled` | ''（条件成立时才出现） |
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-pressed` | ''（条件成立时才出现） |
| `root` | `data-size` | props.size |
| `key` | `data-modifier` | ''（条件成立时才出现） |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-group-fg` | `root` | `color` | `default` | `--xh-fg-muted` | kbd-group 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-group-font-size` | `root` | `font-size` | `default` | `--xh-_kbd-group-font-size` | kbd-group 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-group-gap` | `root` | `gap` | `default` | `--xh-space-0_5` | kbd-group 的 root 部件 gap 覆盖槽。 |
| `--xh-kbd-group-key-bg` | `key` | `background-color` | `default` | `--xh-bg-subtle` | kbd-group 的 key 部件 background-color 覆盖槽。 |
| `--xh-kbd-group-key-bg-disabled` | `key`<br>`root` | `background` | `disabled` | `--xh-bg-muted` | kbd-group 的 key、root 部件 background 覆盖槽。 |
| `--xh-kbd-group-key-border` | `key` | `border` | `default` | `--xh-border-default` | kbd-group 的 key 部件 border 覆盖槽。 |
| `--xh-kbd-group-key-fg` | `key` | `color` | `default` | `--xh-fg-default` | kbd-group 的 key 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-fg-disabled` | `key`<br>`root` | `color` | `disabled` | `--xh-fg-disabled` | kbd-group 的 key、root 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-fg-modifier` | `key` | `color` | `modifier` | `--xh-fg-muted` | kbd-group 的 key 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-font` | `key` | `font-family` | `default` | `--xh-font-family-mono` | kbd-group 的 key 部件 font-family 覆盖槽。 |
| `--xh-kbd-group-key-font-weight` | `key` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd-group 的 key 部件 font-weight 覆盖槽。 |
| `--xh-kbd-group-key-h` | `key` | `block-size` | `default` | `--xh-_kbd-group-key-h` | kbd-group 的 key 部件 block-size 覆盖槽。 |
| `--xh-kbd-group-key-min-w` | `key` | `min-inline-size` | `default` | `--xh-_kbd-group-key-h` | kbd-group 的 key 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-group-key-px` | `key` | `padding-inline` | `default` | `--xh-_kbd-group-key-px` | kbd-group 的 key 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-group-key-py` | `key` | `padding-block` | `default` | `--xh-space-0` | kbd-group 的 key 部件 padding-block 覆盖槽。 |
| `--xh-kbd-group-key-radius` | `key` | `border-radius` | `default` | `--xh-shape-control` | kbd-group 的 key 部件 border-radius 覆盖槽。 |
| `--xh-kbd-group-key-shadow` | `key` | `box-shadow` | `default` | `--xh-_kbd-group-key-shadow-rest` | kbd-group 的 key 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-group-key-shadow-pressed` | `key`<br>`root` | `box-shadow` | `active`<br>`disabled`<br>`is(button, a[href], [role='button'], [role='menuitem'], [role='option'])`<br>`not([data-disabled])`<br>`not([disabled], [aria-disabled='true'])`<br>`pressed` | `--xh-_kbd-group-key-shadow-pressed` | kbd-group 的 key、root 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-group-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` | kbd-group 的 separator 部件 color 覆盖槽。 |
| `--xh-kbd-group-separator-fg-disabled` | `root`<br>`separator` | `color` | `disabled` | `--xh-fg-subtle` | kbd-group 的 root、separator 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `box-shadow` · `color` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

键位保持 LTR 顺序，不受周围文本方向影响。
