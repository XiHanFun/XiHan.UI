# KbdGroup <Badge type="info" text="键帽组" />

把一组按键按当前平台格式化成完整快捷键提示，不注册任何监听。行为由[快捷键](./hotkeys)负责，单枚说明用[键帽](./kbd)。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

同一份 keys 两套写法：Mac 出符号且键帽连排，其余平台出单词并用加号连接

<XhDemo src="kbd-group/01-platform" />

## 组件结构

加粗的是必需部件。

`data-scope="kbd-group"`：**`root`** · `key` · `separator`

## 示例

### 尺寸

size 换的是字号与键帽的内边距，三档与其余控件同源

<XhDemo src="kbd-group/02-size" />

### 禁用

展示状态由作者显式给出，不从 Hotkeys enabled 暗中推导

<XhDemo src="kbd-group/03-disabled" />

### 多组合换行

每组内部不拆行，容器只在完整组合之间换行

<XhDemo src="kbd-group/04-wrap" />

## 设计指引

### 何时使用

- 在菜单、命令面板、按钮提示或快捷键速查表中展示完整组合。
- 同一份 `keys` 需要在 Mac 与 Windows/Linux 上使用各自熟悉的写法。

### 何时不用

- 注册键盘动作：用[快捷键](./hotkeys)。
- 只显示一枚键：用[键帽](./kbd)。

### 特性

- Mac 使用符号并连排；其他平台使用文字和统一基线的 `+`。
- 整组不会为了展示安装全局监听；`disabled` 与 `pressed` 只是显式展示事实。
- 组合保持为不可拆分的行内单元，多个组合可以在外层自然换行。
- M1 实体键帽使用等宽字、1px edge、顶部高光和底部 contact shadow。

### 组合

- 放在 Menu/ContextMenu/Command 条目末端时用 `margin-inline-start: auto` 对齐。
- 与 Hotkeys 使用同一份 `keys`，由业务显式组合展示和行为。

### 最佳实践

- 一律写 `Mod` 作为跨平台主修饰键。
- 只有对应动作不可用时才设置 `disabled`，不要从行为组件暗中推导视觉状态。

### 反模式

- 用 Hotkeys 组件代替 KbdGroup 只为了显示。
- 手写 `Ctrl+S` 文本，导致 Mac 显示与真实组合不一致。

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

- root 以一个组级 `aria-label` 朗读完整组合，视觉键帽和连接符全部 `aria-hidden`，不会重复念。
- `keys` 必填且不能为空；无效组合直接报错，不产生无名称图像。

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
| `--xh-kbd-group-key-bg` | `key` | `background` | `default` | `--xh-material-soft-bg` | kbd-group 的 key 部件 background 覆盖槽。 |
| `--xh-kbd-group-key-bg-disabled` | `key`<br>`root` | `background` | `disabled` | `--xh-bg-muted` | kbd-group 的 key、root 部件 background 覆盖槽。 |
| `--xh-kbd-group-key-border` | `key` | `border` | `default` | `--xh-material-soft-border` | kbd-group 的 key 部件 border 覆盖槽。 |
| `--xh-kbd-group-key-fg` | `key` | `color` | `default` | `--xh-fg-default` | kbd-group 的 key 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-fg-disabled` | `key`<br>`root` | `color` | `disabled` | `--xh-fg-subtle` | kbd-group 的 key、root 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-fg-modifier` | `key` | `color` | `modifier` | `--xh-fg-muted` | kbd-group 的 key 部件 color 覆盖槽。 |
| `--xh-kbd-group-key-font` | `key` | `font-family` | `default` | `--xh-font-family-mono` | kbd-group 的 key 部件 font-family 覆盖槽。 |
| `--xh-kbd-group-key-font-weight` | `key` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd-group 的 key 部件 font-weight 覆盖槽。 |
| `--xh-kbd-group-key-min-w` | `key` | `min-inline-size` | `default` | `--xh-control-indicator-size` | kbd-group 的 key 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-group-key-px` | `key` | `padding-inline` | `default` | `--xh-_kbd-group-key-px` | kbd-group 的 key 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-group-key-py` | `key` | `padding-block` | `default` | `--xh-space-0_5` | kbd-group 的 key 部件 padding-block 覆盖槽。 |
| `--xh-kbd-group-key-radius` | `key` | `border-radius` | `default` | `--xh-shape-inset` | kbd-group 的 key 部件 border-radius 覆盖槽。 |
| `--xh-kbd-group-key-shadow` | `key` | `box-shadow` | `default` | `--xh-stroke-thin` | kbd-group 的 key 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-group-key-shadow-pressed` | `key`<br>`root` | `box-shadow` | `active`<br>`disabled`<br>`is(button, a[href], [role='button'], [role='menuitem'], [role='option'])`<br>`not([data-disabled])`<br>`not([disabled], [aria-disabled='true'])`<br>`pressed` | `--xh-stroke-thin` | kbd-group 的 key、root 部件 box-shadow 覆盖槽。 |
| `--xh-kbd-group-separator-fg` | `separator` | `color` | `default` | `--xh-fg-subtle` | kbd-group 的 separator 部件 color 覆盖槽。 |
| `--xh-kbd-group-separator-fg-disabled` | `root`<br>`separator` | `color` | `disabled` | `--xh-fg-subtle` | kbd-group 的 root、separator 部件 color 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

`background-color` · `border-color` · `box-shadow` · `color` · `translate` 走 `transition` 过渡。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。

系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

键位顺序保持物理键盘的 LTR 顺序，并用 unicode bidi 隔离，不受周围文本方向重排。
