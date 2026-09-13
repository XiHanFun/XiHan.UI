# KbdGroup 键帽组 <Badge type="tip" text="new" />

显示一组快捷键，不注册键盘监听。多枚键名共享同一枚紧凑键帽表面。

<div class="xh-resource-links">
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/engine/headless/src/kbd-group" target="_blank" rel="noreferrer">Headless</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/design/styles/css/kbd-group.css" target="_blank" rel="noreferrer">Styles</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/vue/src/components/kbd-group" target="_blank" rel="noreferrer">Vue</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/tree/dev/ui/packages/adapters/react/src/components/kbd-group" target="_blank" rel="noreferrer">React</a>
  <a href="https://github.com/XiHanFun/XiHan.UI/blob/dev/ui/packages/adapters/web-components/src/elements/kbd-group.ts" target="_blank" rel="noreferrer">Web Components</a>
</div>

## 用法

显示一组快捷键

<XhDemo src="kbd-group/01-basic" />

## 组件结构

加粗的是必需部件。

`data-scope="kbd-group"`：**`root`** · `key`

## 示例

### 平台

使用对应平台的修饰键格式

<XhDemo src="kbd-group/02-platform" />

### 外观

default 使用中性底，light 保持透明；两档共享同一组键名与读屏名称

<XhDemo src="kbd-group/03-variant" />

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

- 各枚键紧凑连排；完整读法仍由整组 `aria-label` 提供。
- 整组保持为一个不可拆分的行内单元。
- 固定使用 24px 高度；`default` 使用中性底，`light` 保持透明。

### 组合

- 可放在 Menu、ContextMenu 和 Command 条目末端。
- 可与 Hotkeys 共用同一份 `keys`。

### 最佳实践

- 跨平台主修饰键使用 `Mod`。
- 组合顺序按实际按键顺序提供，不要把 `+` 放进 keys。

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
| `keys` | `string[]` | 是 | 组合里的各枚键，例如 ['Mod', 'Shift', 'P']。 |
| `platform` | `HotkeysPlatform` |  | 平台写法；auto 在适配器测出平台前按 other。 |
| `translations` | `Partial<KbdGroupTranslations>` |  | 读屏文案覆盖。 |
| `variant` | `KbdVariant` |  | 外观：default 使用中性底，light 保持透明。 |

### connect API

`getXxxProps()` 返回对应部件的宿主属性。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `segments` | `readonly HotkeySegment[]` | 翻好的各枚键，顺序与 keys 一致。 |
| `platform` | `HotkeysResolvedPlatform` | 实际采用的平台写法。 |
| `segmentOf` | `(value: string) => HotkeySegment \| null` | 按原始声明取回一枚键。 |
| `getRootProps` | `() => T['element']` |  |
| `getKeyProps` | `(props: KbdGroupKeyProps) => T['element']` |  |

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
| `root` | `data-platform` | resolveHotkeysPlatform(props.platform) |
| `root` | `data-variant` | props.variant |

<!-- xh-component-tokens:start -->
### CSS 变量

本组件公开覆盖槽由独立皮肤的实际消费位生成；缺省来源、作用部件和状态均与 CSS 同源。

| 变量 | 部件 | CSS 属性 | 状态 | 缺省来源 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `--xh-kbd-group-bg` | `root` | `background` | `default` | `--xh-bg-subtle` | kbd-group 的 root 部件 background 覆盖槽。 |
| `--xh-kbd-group-border` | `root` | `border` | `default` | `transparent` | kbd-group 的 root 部件 border 覆盖槽。 |
| `--xh-kbd-group-fg` | `root` | `color` | `default` | `--xh-fg-muted` | kbd-group 的 root 部件 color 覆盖槽。 |
| `--xh-kbd-group-font` | `root` | `font-family` | `default` | `inherit` | kbd-group 的 root 部件 font-family 覆盖槽。 |
| `--xh-kbd-group-font-size` | `root` | `font-size` | `default` | `--xh-text-label-size` | kbd-group 的 root 部件 font-size 覆盖槽。 |
| `--xh-kbd-group-font-weight` | `root` | `font-weight` | `default` | `--xh-font-weight-medium` | kbd-group 的 root 部件 font-weight 覆盖槽。 |
| `--xh-kbd-group-gap` | `root` | `gap` | `default` | `--xh-space-0_5` | kbd-group 的 root 部件 gap 覆盖槽。 |
| `--xh-kbd-group-h` | `root` | `block-size` | `default` | `--xh-space-6` | kbd-group 的 root 部件 block-size 覆盖槽。 |
| `--xh-kbd-group-min-w` | `root` | `min-inline-size` | `default` | `--xh-space-6` | kbd-group 的 root 部件 min-inline-size 覆盖槽。 |
| `--xh-kbd-group-px` | `root` | `padding-inline` | `default` | `--xh-space-2` | kbd-group 的 root 部件 padding-inline 覆盖槽。 |
| `--xh-kbd-group-radius` | `root` | `border-radius` | `default` | `--xh-shape-control` | kbd-group 的 root 部件 border-radius 覆盖槽。 |
<!-- xh-component-tokens:end -->

### 动效

本组件皮肤不含过渡与关键帧，也没有脚本驱动的动效：状态一变，外观立即到位。

### RTL

皮肤用逻辑属性排布（`inline-start` 一族），`dir="rtl"` 下自动镜像。

键位保持 LTR 顺序，不受周围文本方向影响。
